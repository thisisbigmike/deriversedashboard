'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import {
    LayoutDashboard,
    BookOpen,
    PieChart,
    BarChart3,
    Settings,
    HelpCircle,
    TrendingUp,
    User,
    LogIn,
    X,
} from 'lucide-react';
import SignOutButton from '@/components/auth/SignOutButton';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const MAIN_NAV = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'journal', label: 'Trade Journal', icon: BookOpen, href: '/dashboard/journal' },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart, href: '/dashboard/portfolio' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
];

const SECONDARY_NAV = [
    { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
    { id: 'help', label: 'Help', icon: HelpCircle, href: '/dashboard' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { publicKey } = useWallet();

    const truncatedWallet = publicKey
        ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
        : '';

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
         fixed left-0 top-0 bottom-0 w-64 bg-sidebar/95 backdrop-blur-xl
         border-r border-border z-50 flex flex-col
         transition-transform duration-300 ease-in-out
         ${isOpen ? 'translate-x-0' : '-translate-x-full'}
         lg:translate-x-0
       `}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Deriverse" className="w-8 h-8 rounded-lg" />
                        <div>
                            <h1 className="text-base font-bold text-foreground" style={{ fontFamily: 'var(--font-geist)' }}>Deriverse</h1>
                            <p className="text-[10px] text-muted-foreground">Analytics Dashboard</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Nav */}
                <nav className="p-4 space-y-1 flex-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 px-3">Main Menu</p>
                    {MAIN_NAV.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                onClick={onClose}
                                className={`
                   w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                   text-sm font-medium transition-all duration-200
                   ${active
                                        ? 'bg-gradient-to-r from-[#00d4aa]/20 to-transparent text-[#00d4aa] border-l-2 border-[#00d4aa]'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                    }
                 `}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Secondary Nav */}
                <nav className="p-4 space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3 px-3">Support</p>
                    {SECONDARY_NAV.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                onClick={onClose}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200"
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Wallet indicator */}
                {truncatedWallet && (
                    <div className="px-6 pb-2">
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
                            {truncatedWallet}
                        </div>
                    </div>
                )}

                {/* Theme Toggle (Mobile Only) */}
                <div className="px-6 pb-4 md:hidden">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-white/5">
                        <span className="text-sm font-medium text-muted-foreground">Theme</span>
                        <ThemeToggle />
                    </div>
                </div>

                {/* User Section */}
                {session?.user ? (
                    <div className="p-4 border-t border-border">
                        <div className="flex items-center gap-3 px-3 py-2">
                            {session.user.image ? (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || 'User'}
                                    className="w-8 h-8 rounded-full ring-2 ring-[#00d4aa]/30"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-[#00d4aa] flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {session.user.name || 'User'}
                                </p>
                                <p className="text-[10px] text-muted-foreground truncate">
                                    {session.user.email}
                                </p>
                            </div>
                            <SignOutButton variant="icon" />
                        </div>
                    </div>
                ) : (
                    <div className="p-4 border-t border-border">
                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl
                 bg-primary/10 border border-primary/20
                 text-sm font-medium text-primary
                 hover:bg-primary/20 hover:text-primary-foreground
                 transition-all duration-300"
                        >
                            <LogIn className="w-4 h-4" />
                            Sign in
                        </Link>
                    </div>
                )}
            </aside>
        </>
    );
}
