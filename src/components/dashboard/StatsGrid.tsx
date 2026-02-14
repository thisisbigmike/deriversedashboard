'use client';

import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Clock,
    Target,
    Activity,
    Percent,
    BarChart2
} from 'lucide-react';
import { StatCard } from '@/components/ui/Card';
import { PortfolioStats } from '@/types';

interface StatsGridProps {
    stats: PortfolioStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
    const formatCurrency = (value: number) => {
        const absValue = Math.abs(value);
        if (absValue >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
        if (absValue >= 1000) return `$${(value / 1000).toFixed(1)}K`;
        return `$${value.toFixed(2)}`;
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        if (minutes < 1440) return `${(minutes / 60).toFixed(1)}h`;
        return `${(minutes / 1440).toFixed(1)}d`;
    };

    const statsData = [
        {
            title: 'Total PnL',
            value: formatCurrency(stats.totalPnl),
            change: stats.totalPnlPercent,
            icon: <DollarSign className="w-5 h-5 text-cyan-400" />,
            glow: stats.totalPnl >= 0 ? 'green' as const : 'red' as const,
        },
        {
            title: 'Win Rate',
            value: `${stats.winRate}%`,
            subtitle: `${stats.winningTrades}W / ${stats.losingTrades}L`,
            icon: <Target className="w-5 h-5 text-emerald-400" />,
            glow: 'green' as const,
        },
        {
            title: 'Total Trades',
            value: stats.totalTrades.toString(),
            subtitle: `${stats.longRatio.toFixed(0)}% Long / ${stats.shortRatio.toFixed(0)}% Short`,
            icon: <Activity className="w-5 h-5 text-purple-400" />,
            glow: 'purple' as const,
        },
        {
            title: 'Profit Factor',
            value: stats.profitFactor.toFixed(2),
            subtitle: 'Gross Profit / Gross Loss',
            icon: <BarChart2 className="w-5 h-5 text-cyan-400" />,
            glow: 'cyan' as const,
        },
        {
            title: 'Avg Win',
            value: formatCurrency(stats.avgWin),
            icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
            glow: 'green' as const,
        },
        {
            title: 'Avg Loss',
            value: formatCurrency(stats.avgLoss),
            icon: <TrendingDown className="w-5 h-5 text-red-400" />,
            glow: 'red' as const,
        },
        {
            title: 'Avg Duration',
            value: formatDuration(stats.avgTradeDuration),
            icon: <Clock className="w-5 h-5 text-amber-400" />,
            glow: 'cyan' as const,
        },
        {
            title: 'Max Drawdown',
            value: `${stats.maxDrawdown.toFixed(1)}%`,
            icon: <Percent className="w-5 h-5 text-red-400" />,
            glow: 'red' as const,
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statsData.map((stat, index) => (
                <StatCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    subtitle={stat.subtitle}
                    change={stat.change}
                    icon={stat.icon}
                    glow={stat.glow}
                />
            ))}
        </div>
    );
}
