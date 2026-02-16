// ─── Main Data Fetching Hook ──────────────────────────────────────────────────
// Watches wallet / session state → fetches on-chain data → merges with cloud
// trade history → loads journal entries from the database.
//
// Data flow:
//   1. Set the owner identity on the store
//   2. Fetch fresh on-chain data (trades, positions, account) from Deriverse SDK
//   3. Load previously saved trades from the cloud database
//   4. Merge: on-chain trades override cloud trades (by tradeId), cloud-only
//      trades are preserved (e.g. old closed trades no longer on-chain)
//   5. Save the merged set back to the cloud
//   6. Load journal entries from the cloud

'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useDashboardStore } from '@/store';
import { fetchTradeHistory } from '@/lib/deriverse/trades';
import { fetchOpenPositions } from '@/lib/deriverse/positions';
import { fetchAccountInfo } from '@/lib/deriverse/account';
import { getGuestDemoData } from '@/lib/mockData';
import type { Trade } from '@/types';

export function useDeriverseData() {
    const { publicKey, connected } = useWallet();
    const {
        setTrades,
        setPositions,
        setAccount,
        setJournalEntries,
        setLoading,
        setError,
        setUseMockData,
        setOwner,
        loadTradesFromCloud,
        saveTradesToCloud,
        loadJournalFromCloud,
        useMockData,
        isLoading,
        error,
        refreshKey
    } = useDashboardStore();

    const { data: session } = useSession();

    // Determine owner identity (wallet takes priority)
    const ownerIdentifier = connected && publicKey
        ? publicKey.toBase58()
        : session?.user?.id || null;

    const userId = session?.user?.id || null;
    const walletAddress = connected && publicKey ? publicKey.toBase58() : null;

    // ─── Load Data Effect ─────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            // ── Guest mode ──
            if (!ownerIdentifier) {
                const guestData = getGuestDemoData();
                if (!cancelled) {
                    setTrades(guestData.trades);
                    setPositions(guestData.positions);
                    setAccount(guestData.account);
                    setJournalEntries(guestData.journalEntries);
                    setUseMockData(true);
                    setLoading(false);
                }
                return;
            }

            setLoading(true);
            setError(null);

            // Clear potential guest data immediately to prevent bleeding into authenticated state
            setTrades([]);
            setPositions([]);
            setAccount(null);
            setJournalEntries([]);
            setUseMockData(false);

            // Set owner identity so cloud sync knows who we are
            setOwner({ ownerIdentifier, userId, walletAddress });

            try {
                if (connected && publicKey) {
                    // ── Wallet connected: fetch on-chain + merge with cloud ──
                    const walletAddr = publicKey.toBase58();

                    // Fetch fresh on-chain data and cloud trades in parallel
                    const [onChainTrades, onChainPositions, onChainAccount, cloudTrades] =
                        await Promise.all([
                            fetchTradeHistory(walletAddr),
                            fetchOpenPositions(walletAddr),
                            fetchAccountInfo(walletAddr),
                            loadTradesFromCloud(),
                        ]);

                    if (cancelled) return;

                    // Merge: on-chain trades take priority, cloud-only trades are kept
                    const mergedTrades = mergeTrades(onChainTrades, cloudTrades);

                    setTrades(mergedTrades);
                    setPositions(onChainPositions);
                    setAccount(onChainAccount);
                    setUseMockData(false);

                    // Save merged trades to cloud (background, fire & forget)
                    saveTradesToCloud(mergedTrades);

                    // Load journal entries from cloud
                    await loadJournalFromCloud();

                } else if (session?.user) {
                    // ── Email login only (no wallet) ──
                    // Load any previously saved trades + journal from cloud
                    const cloudTrades = await loadTradesFromCloud();

                    if (cancelled) return;

                    setTrades(cloudTrades);
                    setPositions([]);
                    setAccount(null);
                    setUseMockData(false);

                    await loadJournalFromCloud();
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Failed to load data');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadData();

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ownerIdentifier, connected, publicKey, session, refreshKey]);

    return { isLoading, error, useMockData };
}

// ─── Merge Helper ─────────────────────────────────────────────────────────────
// On-chain trades override cloud trades with the same ID.
// Cloud-only trades (old closed trades no longer on-chain) are preserved.

function mergeTrades(onChain: Trade[], cloud: Trade[]): Trade[] {
    const tradeMap = new Map<string, Trade>();

    // Start with cloud trades (lower priority)
    for (const t of cloud) {
        tradeMap.set(t.id, t);
    }

    // Override with on-chain trades (higher priority = latest data)
    for (const t of onChain) {
        tradeMap.set(t.id, t);
    }

    // Sort by entryTime descending (newest first)
    return Array.from(tradeMap.values()).sort(
        (a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
    );
}
