'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
    children: ReactNode;
    className?: string;
    gradient?: boolean;
    glow?: 'cyan' | 'green' | 'red' | 'purple' | 'none';
    hover?: boolean;
}

export function Card({
    children,
    className = '',
    gradient = false,
    glow = 'none',
    hover = true
}: CardProps) {
    const glowColors = {
        cyan: 'hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]',
        green: 'hover:shadow-[0_0_30px_rgba(0,255,136,0.15)]',
        red: 'hover:shadow-[0_0_30px_rgba(255,75,75,0.15)]',
        purple: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]',
        none: '',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`
        relative overflow-hidden rounded-xl
        liquid-glass
        ${hover ? glowColors[glow] : ''}
        ${gradient ? 'before:absolute before:inset-0 before:bg-gradient-to-br before:from-cyan-500/10 before:to-transparent before:pointer-events-none' : ''}
        ${className}
      `}
        >
            {children}
        </motion.div>
    );
}

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
    return (
        <div className={`p-4 border-b border-border ${className}`}>
            {children}
        </div>
    );
}

interface CardTitleProps {
    children: ReactNode;
    className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
    return (
        <h3 className={`text-sm font-medium text-muted-foreground ${className}`}>
            {children}
        </h3>
    );
}

interface CardContentProps {
    children: ReactNode;
    className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
    return (
        <div className={`p-4 ${className}`}>
            {children}
        </div>
    );
}

interface CardFooterProps {
    children: ReactNode;
    className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
    return (
        <div className={`p-4 ${className}`}>
            {children}
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    change?: number;
    icon?: ReactNode;
    glow?: 'cyan' | 'green' | 'red' | 'purple' | 'none';
}

export function StatCard({ title, value, subtitle, change, icon, glow = 'cyan' }: StatCardProps) {
    const isPositive = change && change > 0;
    const isNegative = change && change < 0;

    return (
        <Card glow={glow} className="p-4">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground">{subtitle}</p>
                    )}
                    {change !== undefined && (
                        <p className={`text-xs font-medium ${isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-muted-foreground'}`}>
                            {isPositive ? '+' : ''}{change}%
                        </p>
                    )}
                </div>
                {icon && (
                    <div className="p-2 rounded-lg bg-secondary/50">
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
}
