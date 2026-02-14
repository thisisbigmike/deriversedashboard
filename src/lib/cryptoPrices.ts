import { CryptoQuote, CryptoPriceResponse } from '@/types';
import { getMockPriceResponse } from '@/lib/mockPrices';

export type { CryptoQuote, CryptoPriceResponse };

/**
 * Fetch current cryptocurrency prices from our API
 */
export async function fetchCryptoPrices(): Promise<CryptoPriceResponse> {
    try {
        const response = await fetch('/api/crypto/prices');

        if (!response.ok) {
            throw new Error('Failed to fetch crypto prices');
        }

        return response.json();
    } catch (error) {
        console.error('Error fetching prices from API, using fallback:', error);
        return getMockPriceResponse();
    }
}

/**
 * Get price for a specific symbol
 */
export function getPrice(prices: Record<string, CryptoQuote>, symbol: string): number {
    const quote = prices[symbol];
    return quote?.price ?? getFallbackPrice(symbol);
}

/**
 * Fallback prices when API is unavailable
 */
export function getFallbackPrice(symbol: string): number {
    const fallbacks: Record<string, number> = {
        'BTC-PERP': 50000,
        'ETH-PERP': 3000,
        'SOL-PERP': 150,
    };
    return fallbacks[symbol] ?? 100;
}

/**
 * Format price with appropriate decimals
 */
export function formatPrice(price: number): string {
    if (price >= 1000) {
        return price.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } else if (price >= 1) {
        return price.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 4
        });
    } else {
        return price.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 4,
            maximumFractionDigits: 6
        });
    }
}

/**
 * Format percentage change
 */
export function formatPercentChange(percent: number): string {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
}
