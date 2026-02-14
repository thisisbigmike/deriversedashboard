'use client';

import { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    ComposedChart,
    Bar
} from 'recharts';
import { DailyPnL } from '@/types';

interface PnLChartProps {
    data: DailyPnL[];
    showDrawdown?: boolean;
}

export function PnLChart({ data, showDrawdown = true }: PnLChartProps) {
    const chartData = useMemo(() => {
        return data.map(d => ({
            ...d,
            date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            drawdownNegative: -d.drawdown,
        }));
    }, [data]);

    const minPnL = Math.min(...data.map(d => d.cumulativePnl));
    const maxPnL = Math.max(...data.map(d => d.cumulativePnl));

    // Calculate the percentage where the value hits 0 for the gradient split
    const gradientOffset = () => {
        if (maxPnL <= 0) return 0;
        if (minPnL >= 0) return 1;
        return maxPnL / (maxPnL - minPnL);
    };

    const off = gradientOffset();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || !payload.length) return null;

        // Find the correct payload items by dataKey
        const pnlItem = payload.find((p: any) => p.dataKey === 'cumulativePnl');
        const drawdownItem = payload.find((p: any) => p.dataKey === 'drawdownNegative');

        return (
            <div className="bg-popover border border-border rounded-lg p-3 shadow-xl">
                <p className="text-xs text-muted-foreground mb-2">{label}</p>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span className="text-xs text-muted-foreground">Cumulative PnL:</span>
                        <span className={`text-xs font-medium ${pnlItem?.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            ${pnlItem?.value?.toLocaleString()}
                        </span>
                    </div>
                    {showDrawdown && drawdownItem && (
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-400" />
                            <span className="text-xs text-muted-foreground">Drawdown:</span>
                            <span className="text-xs font-medium text-red-400">
                                {Math.abs(drawdownItem.value || 0).toFixed(1)}%
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset={off} stopColor="#00F0FF" stopOpacity={0.4} />
                        <stop offset={off} stopColor="#FF4B4B" stopOpacity={0.4} />
                    </linearGradient>
                    <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF4B4B" stopOpacity={0} />
                        <stop offset="100%" stopColor="#FF4B4B" stopOpacity={0.3} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                    dy={10}
                />
                <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    domain={[Math.min(minPnL * 1.1, 0), Math.max(maxPnL * 1.1, 0)]}
                />
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    hide={true}
                    domain={['dataMin - 5', 0]}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />

                {showDrawdown && (
                    <Bar
                        yAxisId="right"
                        dataKey="drawdownNegative"
                        fill="#FF4B4B"
                        fillOpacity={0.15}
                        radius={[4, 4, 0, 0]}
                    />
                )}

                <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="cumulativePnl"
                    stroke={data[data.length - 1]?.cumulativePnl >= 0 ? '#00F0FF' : '#FF4B4B'}
                    strokeWidth={2}
                    fill="url(#pnlGradient)"
                    animationDuration={1000}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
}
