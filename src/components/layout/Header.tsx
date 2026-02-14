'use client';

import { usePathname } from 'next/navigation';
import { LivePriceTicker } from '@/components/ui/LivePriceTicker';
import { WalletConnectButton } from '@/components/wallet/WalletConnectButton';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Menu } from 'lucide-react';

interface HeaderProps {
    onMenuToggle: () => void;
}

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
    '/dashboard': { title: 'Trading Overview', subtitle: 'Real-time analytics for your trading performance' },
    '/dashboard/journal': { title: 'Trade Journal', subtitle: 'Document and reflect on your trades' },
    '/dashboard/portfolio': { title: 'Portfolio Analysis', subtitle: 'Deep dive into your positions and results' },
    '/dashboard/analytics': { title: 'Advanced Analytics', subtitle: 'Time-based performance metrics' },
};

export function Header({ onMenuToggle }: HeaderProps) {
    const pathname = usePathname();
    const { title, subtitle } = ROUTE_TITLES[pathname] || ROUTE_TITLES['/dashboard'];

    return (
        <header className="h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 border-b border-white/5 bg-background/80 backdrop-blur-xl sticky top-0 z-30">
            {/* Left */}
            <div className="flex items-center gap-3 flex-shrink-0 min-w-0">
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                    <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">{title}</h1>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground hidden sm:block">{subtitle}</p>
                    )}
                </div>
            </div>

            {/* Center — Live Prices */}
            <div className="flex-1 justify-center px-4 hidden md:flex">
                <LivePriceTicker />
            </div>

            {/* Right — Wallet */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                <div className="hidden md:block">
                    <ThemeToggle />
                </div>
                <WalletConnectButton />
            </div>
        </header>
    );
}
