'use client';

import { motion } from 'framer-motion';
import { useDashboardStore } from '@/store';
import { useMetrics } from '@/hooks/useMetrics';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { PortfolioAnalysis } from '@/components/dashboard/PortfolioAnalysis';

export default function PortfolioPage() {
    const isLoading = useDashboardStore((s) => s.isLoading);
    const positions = useDashboardStore((s) => s.positions);
    const { stats, symbolStats } = useMetrics();

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-white/5 rounded-xl" />
                    ))}
                </div>
                <div className="h-[400px] bg-white/5 rounded-xl" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <StatsGrid stats={stats} />
            <PortfolioAnalysis symbolStats={symbolStats} portfolioStats={stats} />
        </motion.div>
    );
}
