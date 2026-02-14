'use client';

import { Select } from '@/components/ui/Select';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { Button } from '@/components/ui/Button';
import { FilterState, TimeframeOption } from '@/types';
import { Download, RefreshCw } from 'lucide-react';

interface FilterBarProps {
    filters: FilterState;
    onFilterChange: (filters: Partial<FilterState>) => void;
    onRefresh: () => void;
}

const SYMBOL_OPTIONS = [
    { value: 'all', label: 'All Symbols' },
    { value: 'BTC-PERP', label: 'BTC-PERP' },
    { value: 'ETH-PERP', label: 'ETH-PERP' },
    { value: 'SOL-PERP', label: 'SOL-PERP' },
    { value: 'ARB-PERP', label: 'ARB-PERP' },
    { value: 'AVAX-PERP', label: 'AVAX-PERP' },
];

const ORDER_TYPE_OPTIONS = [
    { value: 'all', label: 'All Orders' },
    { value: 'MARKET', label: 'Market' },
    { value: 'LIMIT', label: 'Limit' },
    { value: 'STOP', label: 'Stop' },
];

const SIDE_OPTIONS = [
    { value: 'all', label: 'All Sides' },
    { value: 'LONG', label: 'Long Only' },
    { value: 'SHORT', label: 'Short Only' },
];

export function FilterBar({ filters, onFilterChange, onRefresh }: FilterBarProps) {
    return (
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl liquid-glass">
            {/* Symbol Filter */}
            <div className="flex flex-col gap-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Symbol</label>
                <Select
                    options={SYMBOL_OPTIONS}
                    value={filters.symbol}
                    onChange={(value) => onFilterChange({ symbol: value })}
                    className="w-40"
                />
            </div>

            {/* Order Type Filter */}
            <div className="flex flex-col gap-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Order Type</label>
                <Select
                    options={ORDER_TYPE_OPTIONS}
                    value={filters.orderType}
                    onChange={(value) => onFilterChange({ orderType: value })}
                    className="w-32"
                />
            </div>

            {/* Side Filter */}
            <div className="flex flex-col gap-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Side</label>
                <Select
                    options={SIDE_OPTIONS}
                    value={filters.side}
                    onChange={(value) => onFilterChange({ side: value })}
                    className="w-32"
                />
            </div>

            {/* Date Range */}
            <div className="flex flex-col gap-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Time Range</label>
                <DateRangePicker
                    value={filters.timeframe}
                    onChange={(value) => onFilterChange({ timeframe: value as TimeframeOption['value'] })}
                />
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Actions */}
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onRefresh} icon={<RefreshCw className="w-4 h-4" />}>
                    Refresh
                </Button>
            </div>
        </div>
    );
}
