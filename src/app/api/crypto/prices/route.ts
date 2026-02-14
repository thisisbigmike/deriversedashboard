
import { NextResponse } from 'next/server';
import { getMockPriceResponse } from '@/lib/mockPrices';
import { CryptoPriceResponse, CryptoQuote } from '@/types';

// Cache configuration
let cachedPrices: CryptoPriceResponse | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30 * 1000; // 30 seconds for fresher prices

// Symbol Mappings
const SYMBOL_MAPPING: Record<string, string> = {
    'BTC-PERP': 'BTC',
    'ETH-PERP': 'ETH',
    'SOL-PERP': 'SOL',
    'ARB-PERP': 'ARB',
    'AVAX-PERP': 'AVAX',
};

const COINGECKO_IDS: Record<string, string> = {
    'BTC-PERP': 'bitcoin',
    'ETH-PERP': 'ethereum',
    'SOL-PERP': 'solana',
    'ARB-PERP': 'arbitrum',
    'AVAX-PERP': 'avalanche-2',
};

const BINANCE_SYMBOLS: Record<string, string> = {
    'BTC-PERP': 'BTCUSDT',
    'ETH-PERP': 'ETHUSDT',
    'SOL-PERP': 'SOLUSDT',
    'ARB-PERP': 'ARBUSDT',
    'AVAX-PERP': 'AVAXUSDT',
};



// ─── Binance Futures API ─────────────────────────────────────────────────────

async function fetchFromBinance(): Promise<CryptoPriceResponse> {
    try {
        // Fetch 24hr ticker for all symbols in parallel
        const promises = Object.entries(BINANCE_SYMBOLS).map(async ([perpSymbol, binanceSymbol]) => {
            const response = await fetch(`https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${binanceSymbol}`, {
                next: { revalidate: 30 },
            });
            if (!response.ok) throw new Error(`Binance error ${response.status}`);
            const data = await response.json();
            return { perpSymbol, data };
        });

        const results = await Promise.all(promises);
        const data: Record<string, CryptoQuote> = {};

        results.forEach(({ perpSymbol, data: quote }) => {
            data[perpSymbol] = {
                symbol: perpSymbol,
                name: perpSymbol.split('-')[0],
                price: parseFloat(quote.lastPrice),
                percent_change_1h: 0, // Binance 24hr ticker doesn't provide 1h change
                percent_change_24h: parseFloat(quote.priceChangePercent),
                percent_change_7d: 0,
                market_cap: 0, // Futures metrics don't typically use market cap in the same way, or it's not in this endpoint
                // We'll use quoteVolume (USDT volume) for 24h volume
                volume_24h: parseFloat(quote.quoteVolume),
                last_updated: new Date(quote.closeTime).toISOString(),
            };
        });

        return {
            data,
            timestamp: Date.now(),
            cached: false,
        };
    } catch (error) {
        console.error('Error fetching from Binance:', error);
        throw error;
    }
}

// ─── CoinGecko Fallback ──────────────────────────────────────────────────────

async function fetchFromCoinGecko(): Promise<CryptoPriceResponse> {
    const ids = Object.values(COINGECKO_IDS).join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`;

    try {
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 60 },
        });

        if (!response.ok) throw new Error(`CoinGecko API error: ${response.status}`);

        const result = await response.json();
        const data: Record<string, CryptoQuote> = {};

        for (const [perpSymbol, cgId] of Object.entries(COINGECKO_IDS)) {
            const coinData = result[cgId];
            if (coinData) {
                data[perpSymbol] = {
                    symbol: perpSymbol,
                    name: perpSymbol.split('-')[0],
                    price: coinData.usd,
                    percent_change_1h: 0,
                    percent_change_24h: coinData.usd_24h_change,
                    percent_change_7d: 0,
                    market_cap: coinData.usd_market_cap,
                    volume_24h: coinData.usd_24h_vol,
                    last_updated: new Date(coinData.last_updated_at * 1000).toISOString(),
                };
            }
        }

        return { data, timestamp: Date.now(), cached: false };
    } catch (error) {
        console.error('Error fetching from CoinGecko:', error);
        throw error;
    }
}

// ─── CoinMarketCap ──────────────────────────────────────────────────────────

async function fetchFromCoinMarketCap(): Promise<CryptoPriceResponse> {
    const apiKey = process.env.CMC_API_KEY;
    if (!apiKey) throw new Error('No CMC_API_KEY');

    const symbols = Object.values(SYMBOL_MAPPING).join(',');
    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols}&convert=USD`;

    try {
        const response = await fetch(url, {
            headers: {
                'X-CMC_PRO_API_KEY': apiKey,
                'Accept': 'application/json',
            },
            next: { revalidate: 60 },
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`CoinMarketCap API error: ${response.status} - ${error}`);
        }

        const result = await response.json();
        const data: Record<string, CryptoQuote> = {};

        for (const [perpSymbol, cmcSymbol] of Object.entries(SYMBOL_MAPPING)) {
            const coinData = result.data[cmcSymbol];
            if (coinData) {
                const quote = coinData.quote.USD;
                data[perpSymbol] = {
                    symbol: perpSymbol,
                    name: coinData.name,
                    price: quote.price,
                    percent_change_1h: quote.percent_change_1h,
                    percent_change_24h: quote.percent_change_24h,
                    percent_change_7d: quote.percent_change_7d,
                    market_cap: quote.market_cap,
                    volume_24h: quote.volume_24h,
                    last_updated: quote.last_updated,
                };
            }
        }

        return { data, timestamp: Date.now(), cached: false };
    } catch (error) {
        console.error('Error fetching from CoinMarketCap:', error);
        throw error;
    }
}

// ─── Main Handler ────────────────────────────────────────────────────────────

export async function GET() {
    try {
        // 1. Check Cache
        const now = Date.now();
        if (cachedPrices && (now - cacheTimestamp < CACHE_DURATION)) {
            return NextResponse.json({ ...cachedPrices, cached: true });
        }

        let prices: CryptoPriceResponse | null = null;

        // 2. Primacy Source: Binance Futures (Best for Perp prices, no key needed)
        try {
            prices = await fetchFromBinance();
        } catch (e) {
            console.warn('Binance unavailable, trying fallbacks...');
        }

        // 3. Fallback: CoinMarketCap (If key exists)
        if (!prices && process.env.CMC_API_KEY) {
            try {
                prices = await fetchFromCoinMarketCap();
            } catch (e) {
                console.warn('CMC unavailable, trying CoinGecko...');
            }
        }

        // 4. Fallback: CoinGecko (Free, no key, but spot prices)
        if (!prices) {
            try {
                prices = await fetchFromCoinGecko();
            } catch (e) {
                console.warn('CoinGecko unavailable.');
            }
        }

        // 5. Ultimate Fallback: Valid Cache (stale) or Mock Data
        if (!prices) {
            if (cachedPrices) {
                console.warn('All APIs failed. Serving stale cache.');
                return NextResponse.json({ ...cachedPrices, cached: true, stale: true });
            }
            console.warn('All APIs failed. Serving mock data.');
            return NextResponse.json(getMockPriceResponse());
        }

        // Success - Update Cache
        cachedPrices = prices;
        cacheTimestamp = now;

        return NextResponse.json(prices);

    } catch (error) {
        console.error('Critical error in prices route:', error);
        return NextResponse.json(getMockPriceResponse());
    }
}

