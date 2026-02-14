'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface WinRateChartProps {
    wins: number;
    losses: number;
    winRate: number;
}

export function WinRateChart({ wins, losses, winRate }: WinRateChartProps) {
    const data = [
        { name: 'Wins', value: wins, color: '#00FF88' },
        { name: 'Losses', value: losses, color: '#FF4B4B' },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload || !payload.length) return null;

        return (
            <div className="bg-popover border border-border rounded-lg p-2 shadow-xl">
                <div className="flex items-center gap-2">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: payload[0]?.payload?.color }}
                    />
                    <span className="text-xs text-muted-foreground">{payload[0]?.name}:</span>
                    <span className="text-xs font-medium text-foreground">{payload[0]?.value}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="relative w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="85%"
                        paddingAngle={3}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1000}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="transparent"
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl sm:text-3xl font-bold text-foreground">{winRate.toFixed(0)}%</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground">Win Rate</span>
            </div>
        </div>
    );
}
