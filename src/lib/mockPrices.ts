import { CryptoQuote, CryptoPriceResponse } from '@/types';

export const MOCK_PRICES: Record<string, CryptoQuote> = {
    'BTC-PERP': {
        symbol: 'BTC-PERP',
        name: 'Bitcoin',
        price: 52450.00,
        percent_change_1h: 0.15,
        percent_change_24h: 2.50,
        percent_change_7d: 5.12,
        market_cap: 1000000000000,
        volume_24h: 35000000000,
        last_updated: new Date().toISOString()
    },
    'ETH-PERP': {
        symbol: 'ETH-PERP',
        name: 'Ethereum',
        price: 3150.00,
        percent_change_1h: -0.20,
        percent_change_24h: 1.80,
        percent_change_7d: 8.45,
        market_cap: 350000000000,
        volume_24h: 15000000000,
        last_updated: new Date().toISOString()
    },
    'SOL-PERP': {
        symbol: 'SOL-PERP',
        name: 'Solana',
        price: 145.50,
        percent_change_1h: 0.50,
        percent_change_24h: -1.20,
        percent_change_7d: 12.30,
        market_cap: 65000000000,
        volume_24h: 4000000000,
        last_updated: new Date().toISOString()
    },
    'ARB-PERP': {
        symbol: 'ARB-PERP',
        name: 'Arbitrum',
        price: 1.85,
        percent_change_1h: 0.10,
        percent_change_24h: 4.50,
        percent_change_7d: -2.10,
        market_cap: 2500000000,
        volume_24h: 500000000,
        last_updated: new Date().toISOString()
    },
    'AVAX-PERP': {
        symbol: 'AVAX-PERP',
        name: 'Avalanche',
        price: 38.20,
        percent_change_1h: -0.05,
        percent_change_24h: 0.80,
        percent_change_7d: 1.50,
        market_cap: 14000000000,
        volume_24h: 800000000,
        last_updated: new Date().toISOString()
    }
};

export function getMockPriceResponse(): CryptoPriceResponse {
    // Add slight random variation to make it feel alive
    const data: Record<string, CryptoQuote> = {};

    Object.entries(MOCK_PRICES).forEach(([key, quote]) => {
        const variation = (Math.random() - 0.5) * 0.002; // +/- 0.1%
        data[key] = {
            ...quote,
            price: quote.price * (1 + variation),
            last_updated: new Date().toISOString()
        };
    });

    return {
        data,
        timestamp: Date.now(),
        cached: false
    };
}
