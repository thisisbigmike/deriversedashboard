// ─── Formatting Utilities ─────────────────────────────────────────────────────
// Currency, date, percentage, and address formatters for the dashboard

/**
 * Format a number as USD currency
 * formatCurrency(1234.5)  → "$1,234.50"
 * formatCurrency(-500)    → "-$500.00"
 */
export function formatCurrency(value: number, decimals: number = 2): string {
    const abs = Math.abs(value);
    const formatted = abs.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
    return value < 0 ? `-$${formatted}` : `$${formatted}`;
}

/**
 * Format a number as a percentage with sign
 * formatPercent(12.345) → "+12.35%"
 * formatPercent(-5.1)   → "-5.10%"
 */
export function formatPercent(value: number, decimals: number = 2): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format a Date as a readable string
 * formatDate(date) → "Feb 10, 05:39 PM"
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    }) + ', ' + d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format duration in minutes to human-readable
 * formatDuration(135) → "2h 15m"
 * formatDuration(45)  → "45m"
 * formatDuration(1500) → "1d 1h"
 */
export function formatDuration(minutes: number): string {
    if (minutes < 60) return `${Math.round(minutes)}m`;

    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = Math.round(minutes % 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
}

/**
 * Format a number with appropriate precision
 * formatNumber(0.001234) → "0.0012"
 * formatNumber(1234.5)   → "1,234.50"
 */
export function formatNumber(value: number, decimals?: number): string {
    const d = decimals ?? (Math.abs(value) < 1 ? 4 : 2);
    return value.toLocaleString('en-US', {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
    });
}
