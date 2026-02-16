// ─── Zustand Store ────────────────────────────────────────────────────────────
// Central state management for the Deriverse trading dashboard.
// Journal entries AND trade history are cloud-synced to PostgreSQL.

import { create } from 'zustand';
import type {
    Trade,
    Position,
    AccountInfo,
    FilterState,
    TimeframeValue,
    JournalEntry,
} from '@/types';

// ─── Store Shape ──────────────────────────────────────────────────────────────

interface DashboardStore {
    // ── Data ──
    trades: Trade[];
    positions: Position[];
    account: AccountInfo | null;
    journalEntries: JournalEntry[];

    // ── Owner Identity ──
    ownerIdentifier: string | null;
    userId: string | null;
    walletAddress: string | null;

    // ── Filters ──
    filters: FilterState;

    // ── UI ──
    sidebarOpen: boolean;
    useMockData: boolean;
    isLoading: boolean;
    error: string | null;
    refreshKey: number;

    // ── Actions: Data ──
    setTrades: (trades: Trade[]) => void;
    setPositions: (positions: Position[]) => void;
    setAccount: (account: AccountInfo | null) => void;
    setJournalEntries: (entries: JournalEntry[]) => void;
    setOwner: (owner: { ownerIdentifier: string; userId?: string | null; walletAddress?: string | null }) => void;
    updateTradeNote: (tradeId: string, note: string) => void;

    // ── Actions: Cloud Sync — Trades ──
    loadTradesFromCloud: () => Promise<Trade[]>;
    saveTradesToCloud: (trades: Trade[]) => Promise<void>;

    // ── Actions: Cloud Sync — Journal ──
    loadJournalFromCloud: () => Promise<void>;
    saveJournalEntryToCloud: (tradeId: string, note: string, tags?: string[], sentiment?: string) => Promise<void>;
    deleteJournalEntryFromCloud: (entryId: string) => Promise<void>;

    // ── Actions: Filters ──
    setFilters: (filters: Partial<FilterState>) => void;
    setTimeframe: (timeframe: TimeframeValue) => void;
    resetFilters: () => void;
    triggerRefresh: () => void;

    // ── Actions: UI ──
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    setUseMockData: (use: boolean) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

// ─── Default Filter State ─────────────────────────────────────────────────────

const DEFAULT_FILTERS: FilterState = {
    symbol: 'all',
    timeframe: '30D',
    orderType: 'all',
    side: 'all',
};

// ─── Store Creation ───────────────────────────────────────────────────────────

export const useDashboardStore = create<DashboardStore>((set, get) => ({
    // ── Initial State ──
    trades: [],
    positions: [],
    account: null,
    journalEntries: [],
    ownerIdentifier: null,
    userId: null,
    walletAddress: null,
    filters: DEFAULT_FILTERS,
    sidebarOpen: false,
    useMockData: true,
    isLoading: true,
    error: null,
    refreshKey: 0,

    // ═══════════════════════════════════════════════════════════════════════════
    // DATA SETTERS
    // ═══════════════════════════════════════════════════════════════════════════

    setTrades: (trades) => set({ trades }),
    setPositions: (positions) => set({ positions }),
    setAccount: (account) => set({ account }),
    setJournalEntries: (entries) => set({ journalEntries: entries }),

    setOwner: ({ ownerIdentifier, userId, walletAddress }) =>
        set({
            ownerIdentifier,
            userId: userId || null,
            walletAddress: walletAddress || null,
        }),

    updateTradeNote: (tradeId, note) => {
        const state = get();

        // 1. Update the trade's notes field
        const updatedTrades = state.trades.map((t) =>
            t.id === tradeId ? { ...t, notes: note } : t
        );

        // 2. Update or create journal entry locally
        let updatedJournalEntries = [...state.journalEntries];
        const existingIdx = updatedJournalEntries.findIndex((e) => e.tradeId === tradeId);
        const trade = state.trades.find((t) => t.id === tradeId);
        const sentiment = trade ? (trade.pnl >= 0 ? 'positive' : 'negative') : 'neutral';

        if (existingIdx >= 0) {
            if (note.trim() === '') {
                const entryId = updatedJournalEntries[existingIdx].id;
                updatedJournalEntries = updatedJournalEntries.filter((_, i) => i !== existingIdx);
                if (state.ownerIdentifier) get().deleteJournalEntryFromCloud(entryId);
            } else {
                updatedJournalEntries[existingIdx] = { ...updatedJournalEntries[existingIdx], note };
                if (state.ownerIdentifier) get().saveJournalEntryToCloud(tradeId, note, trade?.tags, sentiment);
            }
        } else if (note.trim() !== '' && trade) {
            const newEntry: JournalEntry = {
                id: `journal-${Date.now()}`,
                tradeId: trade.id,
                note,
                tags: trade.tags || [],
                createdAt: new Date(),
                sentiment,
            };
            updatedJournalEntries = [newEntry, ...updatedJournalEntries];
            if (state.ownerIdentifier) get().saveJournalEntryToCloud(tradeId, note, trade.tags, sentiment);
        }

        set({ trades: updatedTrades, journalEntries: updatedJournalEntries });
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // CLOUD SYNC — TRADES
    // ═══════════════════════════════════════════════════════════════════════════

    loadTradesFromCloud: async () => {
        const { ownerIdentifier, userId, walletAddress } = get();
        if (!ownerIdentifier && !userId && !walletAddress) return [];

        try {
            let query = '';
            if (userId) query = `userId=${encodeURIComponent(userId)}`;
            else if (walletAddress) query = `walletAddress=${encodeURIComponent(walletAddress)}`;
            else query = `owner=${encodeURIComponent(ownerIdentifier!)}`;

            const res = await fetch(`/api/trades?${query}`);
            if (!res.ok) return [];

            const json = await res.json();
            if (json.success && json.data) {
                const trades: Trade[] = json.data.map((row: any) => ({
                    id: row.tradeId,
                    symbol: row.symbol,
                    side: row.side,
                    marketType: row.marketType,
                    orderType: row.orderType,
                    entryPrice: row.entryPrice,
                    exitPrice: row.exitPrice,
                    size: row.size,
                    notional: row.notional,
                    pnl: row.pnl,
                    pnlPercent: row.pnlPercent,
                    entryTime: new Date(row.entryTime),
                    exitTime: new Date(row.exitTime),
                    duration: row.duration,
                    makerFee: row.makerFee,
                    takerFee: row.takerFee,
                    fundingFee: row.fundingFee,
                    totalFees: row.totalFees,
                    notes: row.notes || undefined,
                    tags: row.tags || [],
                }));
                return trades;
            }
            return [];
        } catch (err) {
            console.warn('Failed to load trades from cloud:', err);
            return [];
        }
    },

    saveTradesToCloud: async (trades) => {
        const { ownerIdentifier, userId, walletAddress } = get();
        if (!ownerIdentifier || trades.length === 0) return;

        try {
            await fetch('/api/trades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    owner: ownerIdentifier,
                    userId,
                    walletAddress,
                    trades,
                }),
            });
        } catch (err) {
            console.warn('Failed to save trades to cloud:', err);
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // CLOUD SYNC — JOURNAL
    // ═══════════════════════════════════════════════════════════════════════════

    loadJournalFromCloud: async () => {
        const { ownerIdentifier, userId, walletAddress } = get();
        if (!ownerIdentifier && !userId && !walletAddress) return;

        try {
            let query = '';
            if (userId) query = `userId=${encodeURIComponent(userId)}`;
            else if (walletAddress) query = `walletAddress=${encodeURIComponent(walletAddress)}`;
            else query = `owner=${encodeURIComponent(ownerIdentifier!)}`;

            const res = await fetch(`/api/journal?${query}`);
            if (!res.ok) return;

            const json = await res.json();
            if (json.success && json.data) {
                const entries: JournalEntry[] = json.data.map((row: any) => ({
                    id: row.id,
                    tradeId: row.tradeId,
                    note: row.note,
                    tags: row.tags || [],
                    createdAt: new Date(row.createdAt),
                    sentiment: row.sentiment || 'neutral',
                }));
                set({ journalEntries: entries });
            }
        } catch (err) {
            console.warn('Failed to load journal from cloud:', err);
        }
    },

    saveJournalEntryToCloud: async (tradeId, note, tags, sentiment) => {
        const { ownerIdentifier, userId, walletAddress } = get();
        if (!ownerIdentifier) return;

        try {
            const res = await fetch('/api/journal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    owner: ownerIdentifier,
                    tradeId,
                    note,
                    tags: tags || [],
                    sentiment: sentiment || 'neutral',
                    userId,
                    walletAddress,
                }),
            });

            if (res.ok) {
                const json = await res.json();
                if (json.success && json.data) {
                    // Update local entry with real DB id
                    set((state) => ({
                        journalEntries: state.journalEntries.map((e) =>
                            e.tradeId === tradeId ? { ...e, id: json.data.id } : e
                        ),
                    }));
                }
            }
        } catch (err) {
            console.warn('Failed to save journal entry to cloud:', err);
        }
    },

    deleteJournalEntryFromCloud: async (entryId) => {
        try {
            await fetch(`/api/journal?id=${encodeURIComponent(entryId)}`, { method: 'DELETE' });
        } catch (err) {
            console.warn('Failed to delete journal entry from cloud:', err);
        }
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // FILTERS
    // ═══════════════════════════════════════════════════════════════════════════

    setFilters: (newFilters) =>
        set((state) => ({ filters: { ...state.filters, ...newFilters } })),
    setTimeframe: (timeframe) =>
        set((state) => ({ filters: { ...state.filters, timeframe } })),
    resetFilters: () => set({ filters: DEFAULT_FILTERS }),
    triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),

    // ═══════════════════════════════════════════════════════════════════════════
    // UI
    // ═══════════════════════════════════════════════════════════════════════════

    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setUseMockData: (use) => set({ useMockData: use }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
}));
