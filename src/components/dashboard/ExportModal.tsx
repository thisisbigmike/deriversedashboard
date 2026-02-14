'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, FileSpreadsheet, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Trade, JournalEntry } from '@/types';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    trades: Trade[];
    journalEntries: JournalEntry[];
}

type ExportType = 'trades' | 'journal' | 'both';

export function ExportModal({ isOpen, onClose, trades, journalEntries }: ExportModalProps) {
    const [exportType, setExportType] = useState<ExportType>('trades');
    const [isExporting, setIsExporting] = useState(false);

    const generateCSV = (data: any[], headers: string[]) => {
        const csvContent = [
            headers.join(','),
            ...data.map(row =>
                headers.map(fieldName => {
                    const value = row[fieldName] ?? '';
                    // Escape quotes and wrap in quotes if contains comma
                    const stringValue = String(value).replace(/"/g, '""');
                    return `"${stringValue}"`;
                }).join(',')
            )
        ].join('\n');

        return csvContent;
    };

    const downloadFile = (content: string, fileName: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);

        // Simulate a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));

        const timestamp = new Date().toISOString().split('T')[0];

        if (exportType === 'trades' || exportType === 'both') {
            const tradeHeaders = ['date', 'symbol', 'side', 'type', 'size', 'entryPrice', 'exitPrice', 'pnl', 'pnlPercent', 'fees', 'notes'];
            const tradeData = trades.map(t => ({
                date: new Date(t.entryTime).toLocaleString(),
                symbol: t.symbol,
                side: t.side,
                type: t.marketType,
                size: t.size,
                entryPrice: t.entryPrice,
                exitPrice: t.exitPrice,
                pnl: t.pnl.toFixed(2),
                pnlPercent: t.pnlPercent.toFixed(2) + '%',
                fees: t.totalFees.toFixed(2),
                notes: t.notes || ''
            }));

            const csv = generateCSV(tradeData, tradeHeaders);
            downloadFile(csv, `deriverse_trades_${timestamp}.csv`);
        }

        if (exportType === 'journal' || exportType === 'both') {
            const journalHeaders = ['date', 'tradeId', 'sentiment', 'tags', 'note'];
            const journalData = journalEntries.map(j => ({
                date: new Date(j.createdAt).toLocaleString(),
                tradeId: j.tradeId,
                sentiment: j.sentiment,
                tags: j.tags?.join('; ') || '',
                note: j.note
            }));

            const csv = generateCSV(journalData, journalHeaders);
            // Small delay if downloading both to ensure browser handles it
            if (exportType === 'both') await new Promise(r => setTimeout(r, 500));
            downloadFile(csv, `deriverse_journal_${timestamp}.csv`);
        }

        setIsExporting(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-md liquid-glass rounded-2xl p-6 shadow-2xl border border-white/10"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-white">Export Data</h3>
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full hover:bg-white/10">
                            <X className="w-5 h-5 text-white/60" />
                        </Button>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div
                            onClick={() => setExportType('trades')}
                            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${exportType === 'trades' ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                        >
                            <div className="flex items-center gap-3">
                                <FileSpreadsheet className={`w-5 h-5 ${exportType === 'trades' ? 'text-cyan-400' : 'text-white/60'}`} />
                                <div>
                                    <p className="text-sm font-medium text-white">Transaction History</p>
                                    <p className="text-xs text-white/40">Export all executed trades as CSV</p>
                                </div>
                            </div>
                            {exportType === 'trades' && <Check className="w-5 h-5 text-cyan-400" />}
                        </div>

                        <div
                            onClick={() => setExportType('journal')}
                            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${exportType === 'journal' ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                        >
                            <div className="flex items-center gap-3">
                                <FileText className={`w-5 h-5 ${exportType === 'journal' ? 'text-cyan-400' : 'text-white/60'}`} />
                                <div>
                                    <p className="text-sm font-medium text-white">Journal</p>
                                    <p className="text-xs text-white/40">Export your trading notes and tags</p>
                                </div>
                            </div>
                            {exportType === 'journal' && <Check className="w-5 h-5 text-cyan-400" />}
                        </div>

                        <div
                            onClick={() => setExportType('both')}
                            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${exportType === 'both' ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    <FileSpreadsheet className={`w-5 h-5 ${exportType === 'both' ? 'text-cyan-400' : 'text-white/60'}`} />
                                    <FileText className={`w-5 h-5 ${exportType === 'both' ? 'text-cyan-400' : 'text-white/60'}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Both Information</p>
                                    <p className="text-xs text-white/40">Download separate files for both</p>
                                </div>
                            </div>
                            {exportType === 'both' && <Check className="w-5 h-5 text-cyan-400" />}
                        </div>
                    </div>

                    <Button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        {isExporting ? (
                            <span className="animate-pulse">Preparing files...</span>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                Download Export
                            </>
                        )}
                    </Button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
