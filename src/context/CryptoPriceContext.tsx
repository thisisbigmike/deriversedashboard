'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { fetchCryptoPrices } from '@/lib/cryptoPrices';
import { CryptoQuote } from '@/types';

interface CryptoPriceContextType {
    prices: Record<string, CryptoQuote>;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    refresh: () => Promise<void>;
}

const CryptoPriceContext = createContext<CryptoPriceContextType | undefined>(undefined);

const REFRESH_INTERVAL = 60 * 1000; // 60 seconds

export function CryptoPriceProvider({ children }: { children: ReactNode }) {
    const [prices, setPrices] = useState<Record<string, CryptoQuote>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const refresh = useCallback(async () => {
        try {
            setError(null);
            const response = await fetchCryptoPrices();
            setPrices(response.data);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch prices');
            console.error('Failed to fetch crypto prices:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        refresh();
    }, [refresh]);

    // Auto-refresh every 60 seconds
    useEffect(() => {
        const interval = setInterval(refresh, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [refresh]);

    return (
        <CryptoPriceContext.Provider value={{ prices, isLoading, error, lastUpdated, refresh }}>
            {children}
        </CryptoPriceContext.Provider>
    );
}

export function useCryptoPrices(): CryptoPriceContextType {
    const context = useContext(CryptoPriceContext);
    if (context === undefined) {
        throw new Error('useCryptoPrices must be used within a CryptoPriceProvider');
    }
    return context;
}
