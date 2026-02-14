'use client';

import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { VolumeData } from '@/types';

interface VolumeChartProps {
    data: VolumeData[];
}

export function VolumeChart({ data }: VolumeChartProps) {
    const chartData = useMemo(() => {
        return data.slice(-30).map(d => ({
            ...d,
            date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            volumeK: d.volume / 1000,
        }));
    }, [data]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || !payload.length) return null;

        return (
            <div className="bg-popover border border-border rounded-lg p-3 shadow-xl">
                <p className="text-xs text-muted-foreground mb-2">{label}</p>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-400" />
                        <span className="text-xs text-muted-foreground">Volume:</span>
                        <span className="text-xs font-medium text-foreground">
                            ${(payload[0]?.value * 1000)?.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span className="text-xs text-muted-foreground">Trades:</span>
                        <span className="text-xs font-medium text-foreground">
                            {payload[0]?.payload?.trades}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#A855F7" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#A855F7" stopOpacity={0.2} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                    dy={10}
                    interval="preserveStartEnd"
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                    tickFormatter={(value) => `$${value.toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                    dataKey="volumeK"
                    fill="url(#volumeGradient)"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
