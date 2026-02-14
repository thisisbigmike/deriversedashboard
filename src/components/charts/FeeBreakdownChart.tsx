'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FeeBreakdown } from '@/types';

interface FeeBreakdownChartProps {
    data: FeeBreakdown;
}

export function FeeBreakdownChart({ data }: FeeBreakdownChartProps) {
    const chartData = [
        { name: 'Taker Fees', value: data.taker, color: '#FF6B6B' },
        { name: 'Maker Fees', value: data.maker, color: '#4ECDC4' },
        { name: 'Funding Fees', value: data.funding, color: '#A855F7' },
    ].filter(d => d.value > 0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload || !payload.length) return null;

        return (
            <div className="liquid-glass rounded-lg p-2 shadow-xl">
                <div className="flex items-center gap-2">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: payload[0]?.payload?.color }}
                    />
                    <span className="text-xs text-white/70">{payload[0]?.name}:</span>
                    <span className="text-xs font-medium text-white">
                        ${payload[0]?.value?.toLocaleString()}
                    </span>
                </div>
            </div>
        );
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CustomLegend = ({ payload }: any) => (
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-2 sm:mt-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {payload?.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-1.5">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-[10px] sm:text-xs text-white/60">{entry.value}</span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col">
            <ResponsiveContainer width="100%" className="flex-1">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius="75%"
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1000}
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="rgba(10,10,20,0.6)"
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        content={<CustomLegend />}
                        verticalAlign="top"
                        align="center"
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="text-center pb-2">
                <span className="text-sm sm:text-lg font-bold text-white">${data.total.toLocaleString()}</span>
                <span className="text-[9px] sm:text-[10px] text-white/40 ml-1.5">Total Fees</span>
            </div>
        </div>
    );
}
