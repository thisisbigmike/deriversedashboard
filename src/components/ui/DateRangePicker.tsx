'use client';

import { TimeframeOption } from '@/types';

const TIMEFRAMES: TimeframeOption[] = [
    { label: '7D', value: '7D', days: 7 },
    { label: '30D', value: '30D', days: 30 },
    { label: '90D', value: '90D', days: 90 },
    { label: 'ALL', value: 'ALL', days: 365 },
];

interface DateRangePickerProps {
    value: TimeframeOption['value'];
    onChange: (value: TimeframeOption['value']) => void;
    className?: string;
}

export function DateRangePicker({ value, onChange, className = '' }: DateRangePickerProps) {
    return (
        <div className={`flex items-center gap-1 p-1 rounded-lg bg-secondary/50 border border-border ${className}`}>
            {TIMEFRAMES.map((tf) => (
                <button
                    key={tf.value}
                    onClick={() => onChange(tf.value)}
                    className={`
            px-3 py-1.5 rounded-md text-xs font-medium
            transition-all duration-200
            ${value === tf.value
                            ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-black shadow-lg shadow-cyan-500/25'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        }
          `}
                >
                    {tf.label}
                </button>
            ))}
        </div>
    );
}
