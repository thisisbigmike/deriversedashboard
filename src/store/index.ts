// ─── Zustand Store ────────────────────────────────────────────────────────────
// Central state management for the Deriverse trading dashboard

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
    // Data
    trades: Trade[];
    positions: Position[];
    account: AccountInfo | null;
    journalEntries: JournalEntry[];

    // Filters
    filters: FilterState;

    // UI
    sidebarOpen: boolean;
    useMockData: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions — Data
    setTrades: (trades: Trade[]) => void;
    setPositions: (positions: Position[]) => void;
    setAccount: (account: AccountInfo | null) => void;
    setJournalEntries: (entries: JournalEntry[]) => void;
    updateTradeNote: (tradeId: string, note: string) => void;

    // Actions — Filters
    setFilters: (filters: Partial<FilterState>) => void;
    setTimeframe: (timeframe: TimeframeValue) => void;
    resetFilters: () => void;

    // Actions — UI
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

export const useDashboardStore = create<DashboardStore>((set) => ({
    // Initial state
    trades: [],
    positions: [],
    account: null,
    journalEntries: [],
    filters: DEFAULT_FILTERS,
    sidebarOpen: false,
    useMockData: true,
    isLoading: true,
    error: null,

    // Actions — Data
    setTrades: (trades) => set({ trades }),
    setPositions: (positions) => set({ positions }),
    setAccount: (account) => set({ account }),
    setJournalEntries: (entries) => set({ journalEntries: entries }),

    updateTradeNote: (tradeId, note) =>
        set((state) => {
            // 1. Update the trade in the trades list
            const updatedTrades = state.trades.map((t) =>
                t.id === tradeId ? { ...t, notes: note } : t
            );

            // 2. Find or create a journal entry for this trade
            let updatedJournalEntries = [...state.journalEntries];
            const existingEntryIndex = updatedJournalEntries.findIndex(
                (e) => e.tradeId === tradeId
            );

            if (existingEntryIndex >= 0) {
                if (note.trim() === '') {
                    // If note is cleared, remove the journal entry? 
                    // Or just clear the note? Let's remove if empty to keep it clean.
                    updatedJournalEntries = updatedJournalEntries.filter((_, i) => i !== existingEntryIndex);
                } else {
                    // Update existing entry
                    updatedJournalEntries[existingEntryIndex] = {
                        ...updatedJournalEntries[existingEntryIndex],
                        note: note,
                        // Update sentiment based on simple keyword heuristic if not set? 
                        // For now keep existing sentiment or default.
                    };
                }
            } else if (note.trim() !== '') {
                // Create new journal entry
                const trade = state.trades.find((t) => t.id === tradeId);
                if (trade) {
                    const newEntry: JournalEntry = {
                        id: `journal-${Date.now()}`,
                        tradeId: trade.id,
                        note: note,
                        tags: trade.tags || [],
                        createdAt: new Date(),
                        sentiment: trade.pnl >= 0 ? 'positive' : 'negative',
                    };
                    updatedJournalEntries = [newEntry, ...updatedJournalEntries];
                }
            }

            return {
                trades: updatedTrades,
                journalEntries: updatedJournalEntries,
            };
        }),

    // Filter actions
    setFilters: (newFilters) =>
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
        })),
    setTimeframe: (timeframe) =>
        set((state) => ({
            filters: { ...state.filters, timeframe },
        })),
    resetFilters: () => set({ filters: DEFAULT_FILTERS }),

    // UI actions
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setUseMockData: (use) => set({ useMockData: use }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
}));
