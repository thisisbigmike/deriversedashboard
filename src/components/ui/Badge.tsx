'use client';

import { ReactNode } from 'react';

interface BadgeProps {
    children: ReactNode;
    variant?: 'success' | 'danger' | 'warning' | 'info' | 'default' | 'outline';
    size?: 'sm' | 'md';
    className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
    const variants = {
        success: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30 dark:text-emerald-400',
        danger: 'bg-red-500/20 text-red-500 border-red-500/30 dark:text-red-400',
        warning: 'bg-amber-500/20 text-amber-500 border-amber-500/30 dark:text-amber-400',
        info: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30 dark:text-cyan-400',
        default: 'bg-secondary/50 text-secondary-foreground border-border',
        outline: 'border border-border text-muted-foreground bg-transparent',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
    };

    return (
        <span
            className={`
        inline-flex items-center gap-1
        font-medium rounded-full border
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
        >
            {children}
        </span>
    );
}

interface PnLBadgeProps {
    value: number;
    showIcon?: boolean;
    size?: 'sm' | 'md';
}

export function PnLBadge({ value, showIcon = true, size = 'sm' }: PnLBadgeProps) {
    const isPositive = value > 0;
    const isNegative = value < 0;

    return (
        <Badge variant={isPositive ? 'success' : isNegative ? 'danger' : 'default'} size={size}>
            {showIcon && (isPositive ? '↑' : isNegative ? '↓' : '•')}
            {isPositive ? '+' : ''}{value.toFixed(2)}
        </Badge>
    );
}

interface SideBadgeProps {
    side: 'LONG' | 'SHORT';
    size?: 'sm' | 'md';
    className?: string;
}

export function SideBadge({ side, size = 'sm', className }: SideBadgeProps) {
    return (
        <Badge variant={side === 'LONG' ? 'success' : 'danger'} size={size} className={className}>
            {side}
        </Badge>
    );
}
