// ─── Main Data Fetching Hook ──────────────────────────────────────────────────
// Watches wallet connection state, fetches data, populates Zustand store.

'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useDashboardStore } from '@/store';
import { fetchTradeHistory } from '@/lib/deriverse/trades';
import { fetchOpenPositions } from '@/lib/deriverse/positions';
import { fetchAccountInfo } from '@/lib/deriverse/account';
import { generateJournalEntries, getGuestDemoData } from '@/lib/mockData';
import type { Trade, JournalEntry } from '@/types';

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
        useMockData,
        isLoading,
        error,
        refreshKey
    } = useDashboardStore();

    const { data: session } = useSession(); // Get logged-in user session

    // Determine the active storage key (Wallet takes priority over Auth)
    const storageKey = connected && publicKey
        ? `deriverse_data_wallet_${publicKey.toBase58()}`
        : session?.user?.email
            ? `deriverse_data_user_${session.user.email}`
            : null;

    // ─── Load Data Effect ─────────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            // If no user and no wallet, we might want to show empty or generic demo data
            // For now, if no key, we'll just return (or we could load a "guest" set)
            // If no user and no wallet, we load the guest demo data
            if (!storageKey) {
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

            try {
                // 1. Try to load from LocalStorage
                const cached = localStorage.getItem(storageKey);

                if (cached) {
                    const parsed = JSON.parse(cached);

                    // Restore dates (JSON.parse makes them strings)
                    const restoredTrades = parsed.trades.map((t: Omit<Trade, 'entryTime' | 'exitTime'> & { entryTime: string; exitTime: string }) => ({
                        ...t,
                        entryTime: new Date(t.entryTime),
                        exitTime: new Date(t.exitTime),
                    }));

                    const restoredEntries = parsed.journalEntries.map((e: Omit<JournalEntry, 'createdAt'> & { createdAt: string }) => ({
                        ...e,
                        createdAt: new Date(e.createdAt),
                    }));

                    if (!cancelled) {
                        setTrades(restoredTrades);
                        setPositions(parsed.positions);
                        setAccount(parsed.account);
                        setJournalEntries(restoredEntries);
                        setUseMockData(false); // We are using "persisted" data
                    }
                }

                // 2. Always fetch fresh data (Stale-While-Revalidate)
                // We keep the old data in the store briefly while fetching the new one.

                // 2. No cache? Initialize new data

                if (connected && publicKey) {
                    // case: NEW WALLET CONNECTION -> Generate Mock Data
                    const walletAddress = publicKey.toBase58();
                    const [newTrades, newPositions, newAccount] = await Promise.all([
                        fetchTradeHistory(walletAddress),
                        fetchOpenPositions(walletAddress),
                        fetchAccountInfo(walletAddress),
                    ]);

                    const newEntries = generateJournalEntries(newTrades);

                    if (!cancelled) {
                        setTrades(newTrades);
                        setPositions(newPositions);
                        setAccount(newAccount);
                        setJournalEntries(newEntries);
                        setUseMockData(false);

                        // Save immediately to establish the record
                        const initialData = {
                            trades: newTrades,
                            positions: newPositions,
                            account: newAccount,
                            journalEntries: newEntries
                        };
                        localStorage.setItem(storageKey, JSON.stringify(initialData));
                    }

                } else if (session?.user) {
                    // case: NEW USER SIGNUP -> Start EMPTY
                    if (!cancelled) {
                        setTrades([]);
                        setPositions([]);
                        setAccount(null);
                        setJournalEntries([]);
                        setUseMockData(false);

                        // Save empty state
                        localStorage.setItem(storageKey, JSON.stringify({
                            trades: [],
                            positions: [],
                            account: null,
                            journalEntries: []
                        }));
                    }
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

        return () => {
            cancelled = true;
        };
    }, [storageKey, connected, publicKey, session, setLoading, setError, setTrades, setPositions, setAccount, setJournalEntries, setUseMockData, refreshKey]);

    // ─── Auto-Save Effect ─────────────────────────────────────────────────────────
    // Whenever store data changes, verify if we have an active key and save it.
    // We need to subscribe to the store state.
    const trades = useDashboardStore(s => s.trades);
    const positions = useDashboardStore(s => s.positions);
    const account = useDashboardStore(s => s.account);
    const journalEntries = useDashboardStore(s => s.journalEntries);

    useEffect(() => {
        if (storageKey && !isLoading) {
            const dataToSave = {
                trades,
                positions,
                account,
                journalEntries
            };
            localStorage.setItem(storageKey, JSON.stringify(dataToSave));
        }
    }, [storageKey, trades, positions, account, journalEntries, isLoading]);

    return { isLoading, error, useMockData };
}
