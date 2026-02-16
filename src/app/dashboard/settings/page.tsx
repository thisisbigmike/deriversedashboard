'use client';

import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Settings, Wallet, User, Shield, Bell } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { WalletLinker } from '@/components/dashboard/WalletLinker';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export default function SettingsPage() {
    const { data: session } = useSession();
    const { publicKey, connected } = useWallet();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 max-w-3xl"
        >
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                    <Settings className="w-6 h-6 text-cyan-400" />
                    Settings
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your account, wallet connections, and preferences.
                </p>
            </div>

            {/* ─── Account Section ──────────────────────────────────────────── */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <User className="w-4 h-4 text-cyan-400" />
                        Account
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {session?.user ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-4 p-3 rounded-xl bg-secondary/20 border border-border">
                                {session.user.image ? (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || 'User'}
                                        className="w-12 h-12 rounded-full ring-2 ring-cyan-500/30"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        {session.user.name || 'User'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {session.user.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            You are not signed in. Sign in to manage your account.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* ─── Wallet Linking Section ───────────────────────────────────── */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Wallet className="w-4 h-4 text-cyan-400" />
                        Wallet Connection
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-xs text-muted-foreground">
                        Link your Solana wallet to your account so your trading history syncs across devices.
                    </p>
                    <WalletLinker />

                    {/* Current connection status */}
                    {connected && publicKey && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/10 border border-border">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs text-muted-foreground">
                                Connected: <span className="font-mono text-foreground">{publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}</span>
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ─── Appearance Section ───────────────────────────────────────── */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Bell className="w-4 h-4 text-cyan-400" />
                        Appearance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border">
                        <div>
                            <p className="text-sm font-medium text-foreground">Theme</p>
                            <p className="text-xs text-muted-foreground">Toggle between light and dark mode</p>
                        </div>
                        <ThemeToggle />
                    </div>
                </CardContent>
            </Card>

            {/* ─── Security Section ─────────────────────────────────────────── */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Shield className="w-4 h-4 text-cyan-400" />
                        Security
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border">
                        <div>
                            <p className="text-sm font-medium text-foreground">Password</p>
                            <p className="text-xs text-muted-foreground">Change your account password</p>
                        </div>
                        <a
                            href="/forgot-password"
                            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                        >
                            Reset Password
                        </a>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
