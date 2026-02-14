// ─── Computed Metrics Hook ────────────────────────────────────────────────────
// Derives analytics from trade data in the Zustand store.

'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store';
import {
    calculateDailyPnL,
    calculatePortfolioStats,
    calculateFeeBreakdown,
    calculateVolumeData,
    calculateHeatmapData,
    calculateSymbolStats,
} from '@/lib/utils/metrics';
import { useFilteredTrades } from './useFilters';

export function useMetrics() {
    const account = useDashboardStore((s) => s.account);
    const filteredTrades = useFilteredTrades();

    const initialBalance = useMemo(() => {
        if (!account) return 0;
        const totalPeriodPnL = filteredTrades.reduce((sum, t) => sum + t.pnl, 0);
        return account.balance - totalPeriodPnL;
    }, [account, filteredTrades]);

    const dailyPnL = useMemo(() => calculateDailyPnL(filteredTrades, initialBalance), [filteredTrades, initialBalance]);
    const stats = useMemo(() => calculatePortfolioStats(filteredTrades, initialBalance), [filteredTrades, initialBalance]);
    const feeBreakdown = useMemo(() => calculateFeeBreakdown(filteredTrades), [filteredTrades]);
    const volumeData = useMemo(() => calculateVolumeData(filteredTrades), [filteredTrades]);
    const heatmapData = useMemo(() => calculateHeatmapData(filteredTrades), [filteredTrades]);
    const symbolStats = useMemo(() => calculateSymbolStats(filteredTrades), [filteredTrades]);

    return {
        filteredTrades,
        dailyPnL,
        stats,
        feeBreakdown,
        volumeData,
        heatmapData,
        symbolStats,
    };
}
