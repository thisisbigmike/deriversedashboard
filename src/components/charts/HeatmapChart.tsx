'use client';

import { useMemo } from 'react';
import { HeatmapData } from '@/types';
import { motion } from 'framer-motion';

interface HeatmapChartProps {
    data: HeatmapData[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = ['00', '04', '08', '12', '16', '20'];

export function HeatmapChart({ data }: HeatmapChartProps) {
    const { grid, maxPnl, minPnl } = useMemo(() => {
        const grid: (HeatmapData | null)[][] = Array(7).fill(null).map(() =>
            Array(24).fill(null)
        );

        let maxPnl = 0;
        let minPnl = 0;

        data.forEach(d => {
            grid[d.dayOfWeek][d.hour] = d;
            maxPnl = Math.max(maxPnl, d.pnl);
            minPnl = Math.min(minPnl, d.pnl);
        });

        return { grid, maxPnl, minPnl };
    }, [data]);

    const getColor = (pnl: number) => {
        if (pnl === 0) return 'rgba(255,255,255,0.05)';
        if (pnl > 0) {
            const intensity = Math.min(pnl / maxPnl, 1);
            return `rgba(0, 255, 136, ${0.2 + intensity * 0.6})`;
        } else {
            const intensity = Math.min(Math.abs(pnl) / Math.abs(minPnl), 1);
            return `rgba(255, 75, 75, ${0.2 + intensity * 0.6})`;
        }
    };

    return (
        <div className="w-full space-y-2 overflow-x-auto">
            <div className="min-w-[500px]">
                {/* Hour labels */}
                <div className="flex items-center pl-10 gap-0">
                    {HOURS.map((hour, idx) => (
                        <div
                            key={hour}
                            className="text-[10px] text-muted-foreground"
                            style={{
                                width: `${100 / 6}%`,
                                paddingLeft: idx === 0 ? 0 : '4px'
                            }}
                        >
                            {hour}:00
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="space-y-1">
                    {grid.map((row, dayIndex) => (
                        <div key={dayIndex} className="flex items-center gap-1">
                            {/* Day label */}
                            <div className="w-8 text-[10px] text-muted-foreground text-right pr-2">
                                {DAYS[dayIndex]}
                            </div>

                            {/* Cells */}
                            <div className="flex-1 flex gap-[2px]">
                                {row.map((cell, hourIndex) => (
                                    <motion.div
                                        key={hourIndex}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: (dayIndex * 24 + hourIndex) * 0.002 }}
                                        className="flex-1 h-5 rounded-sm cursor-pointer group relative"
                                        style={{ backgroundColor: getColor(cell?.pnl || 0) }}
                                    >
                                        {/* Tooltip */}
                                        {cell && cell.trades > 0 && (
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                                <div className="bg-popover border border-border rounded-lg p-2 shadow-xl whitespace-nowrap">
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {DAYS[dayIndex]} {hourIndex}:00
                                                    </p>
                                                    <p className={`text-xs font-medium ${cell.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {cell.pnl >= 0 ? '+' : ''}${cell.pnl.toLocaleString()}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground/80">{cell.trades} trades</p>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-red-500/60" />
                        <span className="text-[10px] text-muted-foreground">Loss</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-secondary" />
                        <span className="text-[10px] text-muted-foreground">No trades</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-emerald-500/60" />
                        <span className="text-[10px] text-muted-foreground">Profit</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
