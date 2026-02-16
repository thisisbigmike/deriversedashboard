'use client';

import { motion } from 'framer-motion';
import { useDashboardStore } from '@/store';
import { useMetrics } from '@/hooks/useMetrics';
import { useFilters } from '@/hooks/useFilters';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { TradeHistory } from '@/components/dashboard/TradeHistory';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PnLChart } from '@/components/charts/PnLChart';
import { WinRateChart } from '@/components/charts/WinRateChart';
import { VolumeChart } from '@/components/charts/VolumeChart';
import { FeeBreakdownChart } from '@/components/charts/FeeBreakdownChart';


export default function DashboardOverview() {
    const isLoading = useDashboardStore((s) => s.isLoading);
    const triggerRefresh = useDashboardStore((s) => s.triggerRefresh);
    const { filters, setFilters } = useFilters();
    const { filteredTrades, dailyPnL, stats, feeBreakdown, volumeData } = useMetrics();

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >


            {/* Filter Bar */}
            <FilterBar
                filters={filters}
                onFilterChange={setFilters}
                onRefresh={triggerRefresh}
            />

            {/* Stats Grid */}
            <StatsGrid stats={stats} />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Cumulative PnL & Drawdown</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px] sm:h-[300px]">
                        <PnLChart data={dailyPnL} showDrawdown={true} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Win/Loss Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[200px] sm:h-[300px]">
                        <WinRateChart
                            wins={stats.winningTrades}
                            losses={stats.losingTrades}
                            winRate={stats.winRate}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Volume and Fee Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Trading Volume</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[180px] sm:h-[250px]">
                        <VolumeChart data={volumeData} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Fee Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[180px] sm:h-[250px]">
                        <FeeBreakdownChart data={feeBreakdown} />
                    </CardContent>
                </Card>
            </div>

            {/* Trade History */}
            <TradeHistory
                trades={filteredTrades}
                onAddNote={(id, note) => useDashboardStore.getState().updateTradeNote(id, note)}
            />
        </motion.div>
    );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-12 liquid-glass rounded-xl" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 liquid-glass rounded-xl" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-[300px] liquid-glass rounded-xl" />
                <div className="h-[300px] liquid-glass rounded-xl" />
            </div>
        </div>
    );
}
