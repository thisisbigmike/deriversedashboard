'use client';

import { motion } from 'framer-motion';
import { useDashboardStore } from '@/store';
import { useMetrics } from '@/hooks/useMetrics';
import { TradingJournal } from '@/components/dashboard/TradingJournal';
import { TradeHistory } from '@/components/dashboard/TradeHistory';

export default function JournalPage() {
    const isLoading = useDashboardStore((s) => s.isLoading);
    const journalEntries = useDashboardStore((s) => s.journalEntries);
    const { filteredTrades } = useMetrics();

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-[500px] bg-white/5 rounded-xl" />
                    <div className="h-[500px] bg-white/5 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TradingJournal entries={journalEntries} trades={filteredTrades} />
                <TradeHistory
                    trades={filteredTrades}
                    onAddNote={(id, note) => useDashboardStore.getState().updateTradeNote(id, note)}
                />
            </div>
        </motion.div>
    );
}
