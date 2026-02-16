'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Wallet, Check, AlertCircle, Loader2 } from 'lucide-react';

export function WalletLinker() {
    const { data: session } = useSession();
    const { publicKey, signMessage, connected } = useWallet();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isAlreadyLinked, setIsAlreadyLinked] = useState(false);
    const [checking, setChecking] = useState(false);

    // Check if current wallet is already linked
    useEffect(() => {
        if (session?.user && connected && publicKey) {
            setChecking(true);
            fetch('/api/wallet/list')
                .then(res => res.json())
                .then(json => {
                    if (json.success && Array.isArray(json.data)) {
                        const linked = json.data.some((w: any) => w.walletAddress === publicKey.toBase58());
                        setIsAlreadyLinked(linked);
                    }
                })
                .catch(console.error)
                .finally(() => setChecking(false));
        } else {
            setIsAlreadyLinked(false);
        }
    }, [session, connected, publicKey]);

    const handleLinkWallet = async () => {
        if (!connected || !publicKey || !signMessage || !session?.user) return;

        setLoading(true);
        setStatus(null);

        try {
            const messageStr = `Verify wallet ownership for Deriverse Dashboard: ${publicKey.toBase58()}`;
            const messageBytes = new TextEncoder().encode(messageStr);

            // Request signature from wallet
            const signatureBytes = await signMessage(messageBytes);
            const signatureBase64 = Buffer.from(signatureBytes).toString('base64');

            // Send to API
            const res = await fetch('/api/wallet/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: publicKey.toBase58(),
                    signature: signatureBase64,
                    message: messageStr,
                    label: 'Main Wallet',
                }),
            });

            const json = await res.json();

            if (!res.ok) {
                if (res.status === 409) {
                    throw new Error('This wallet is already linked to another account.');
                }
                throw new Error(json.error || 'Failed to link wallet');
            }

            setStatus({ type: 'success', message: 'Wallet linked successfully!' });
            setIsAlreadyLinked(true);
        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to link wallet' });
        } finally {
            setLoading(false);
        }
    };

    if (!session?.user) return null; // Only for logged-in users

    // If wallet is connected AND already linked, we don't need to show the prompt (maybe compact)
    if (connected && isAlreadyLinked) {
        return (
            <Card className="max-w-md w-full border-emerald-500/20 bg-emerald-500/5">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <Check className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-emerald-500">Wallet Linked</p>
                            <p className="text-xs text-muted-foreground font-mono">
                                {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-md w-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Wallet className="w-4 h-4 text-primary" />
                    Link Connected Wallet
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                    Link wallet to access history on any device.
                </p>

                {!connected ? (
                    <div className="p-3 rounded-lg bg-secondary/20 border border-border text-center">
                        <p className="text-xs text-muted-foreground">Please connect wallet first</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 rounded bg-secondary/10 border border-border">
                            <span className="text-xs font-mono text-muted-foreground truncate max-w-[150px]">
                                {publicKey?.toBase58()}
                            </span>
                        </div>

                        <Button
                            onClick={handleLinkWallet}
                            disabled={loading || checking}
                            size="sm"
                            className="w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Link Wallet'
                            )}
                        </Button>
                    </div>
                )}

                {status && (
                    <div className={`p-2 rounded text-xs flex items-center gap-2 ${status.type === 'success'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                        {status.type === 'success' ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {status.message}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
