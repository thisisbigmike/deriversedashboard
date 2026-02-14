// ─── Filter State Hook ────────────────────────────────────────────────────────
// Provides filtered trade list and filter actions from Zustand store.

'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store';
import type { Trade, FilterState, TimeframeValue } from '@/types';

const TIMEFRAME_DAYS: Record<TimeframeValue, number> = {
    '7D': 7,
    '30D': 30,
    '90D': 90,
    'ALL': 365,
};

/**
 * Hook for filter state management
 */
export function useFilters() {
    const filters = useDashboardStore((s) => s.filters);
    const setFilters = useDashboardStore((s) => s.setFilters);
    const setTimeframe = useDashboardStore((s) => s.setTimeframe);
    const resetFilters = useDashboardStore((s) => s.resetFilters);

    return {
        filters,
        setFilters: (newFilters: Partial<FilterState>) => setFilters(newFilters),
        setTimeframe,
        resetFilters,
    };
}

/**
 * Hook that returns filtered trades based on current filter state
 */
export function useFilteredTrades(): Trade[] {
    const trades = useDashboardStore((s) => s.trades);
    const filters = useDashboardStore((s) => s.filters);

    return useMemo(() => {
        const days = TIMEFRAME_DAYS[filters.timeframe];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return trades.filter((trade) => {
            if (filters.symbol !== 'all' && trade.symbol !== filters.symbol) return false;
            if (filters.orderType !== 'all' && trade.orderType !== filters.orderType) return false;
            if (filters.side !== 'all' && trade.side !== filters.side) return false;
            if (new Date(trade.entryTime) < cutoffDate) return false;
            return true;
        });
    }, [trades, filters]);
}
