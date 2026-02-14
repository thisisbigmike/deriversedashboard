'use client';

import { useState } from 'react';
import { Trade } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge, SideBadge, PnLBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    ExternalLink,
    Clock,
    Tag,
    Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
// import { useSession, signIn } from 'next-auth/react'; // Session check removed for open journaling
import { useDashboardStore } from '@/store';
import { ExportModal } from './ExportModal';

interface TradeHistoryProps {
    trades: Trade[];
    onAddNote: (tradeId: string, note: string) => void;
}

const ITEMS_PER_PAGE = 10;

export function TradeHistory({ trades, onAddNote }: TradeHistoryProps) {
    // const { data: session } = useSession();
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedTrade, setExpandedTrade] = useState<string | null>(null);
    const [noteText, setNoteText] = useState('');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [isExportOpen, setIsExportOpen] = useState(false);

    // Get journal entries from store for export
    const journalEntries = useDashboardStore(s => s.journalEntries);

    const totalPages = Math.ceil(trades.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const visibleTrades = trades.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    };

    return (
        <>
            <div className="liquid-glass rounded-2xl overflow-hidden border border-border">
                <div className="p-6 border-b border-border flex flex-row items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-foreground mb-1">Trade History</h3>
                        <p className="text-xs text-muted-foreground">Your recent trading activity</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border"
                            onClick={() => setIsExportOpen(true)}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        <Badge variant="outline" className="bg-secondary/20 border-border text-muted-foreground">
                            {trades.length} trades
                        </Badge>
                    </div>
                </div>

                <div className="w-full">
                    {/* Table Header - hidden on mobile */}
                    <div className="hidden md:grid grid-cols-8 gap-4 px-6 py-4 border-b border-border bg-muted/20">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Date</span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Symbol</span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Side</span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Entry</span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Exit</span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Size</span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">PnL</span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Actions</span>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-border">
                        {visibleTrades.map((trade) => (
                            <div key={trade.id} className="group transition-all duration-200">
                                {/* Mobile Card Row */}
                                <div
                                    className="md:hidden px-4 py-4 hover:bg-muted/50 cursor-pointer"
                                    onClick={() => setExpandedTrade(expandedTrade === trade.id ? null : trade.id)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1 h-8 rounded-full ${trade.pnl >= 0 ? 'bg-emerald-500/50' : 'bg-red-500/50'}`} />
                                            <div>
                                                <span className="text-sm font-medium text-foreground block">{trade.symbol}</span>
                                                <span className="text-[10px] text-muted-foreground">{formatDate(trade.entryTime)}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <PnLBadge value={trade.pnl} />
                                            <SideBadge side={trade.side} className="mt-1 scale-90 origin-right" />
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop Table Row */}
                                <div
                                    className={`hidden md:grid grid-cols-8 gap-4 px-6 py-4 items-center hover:bg-muted/30 cursor-pointer border-l-2 border-transparent hover:border-cyan-500/50 transition-all ${expandedTrade === trade.id ? 'bg-muted/30 border-l-cyan-500' : ''}`}
                                    onClick={() => setExpandedTrade(expandedTrade === trade.id ? null : trade.id)}
                                >
                                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                                        {formatDate(trade.entryTime)}
                                    </span>
                                    <span className="text-sm font-medium text-foreground">{trade.symbol}</span>
                                    <div><SideBadge side={trade.side} /></div>
                                    <span className="text-xs text-muted-foreground font-mono">${trade.entryPrice.toLocaleString()}</span>
                                    <span className="text-xs text-muted-foreground font-mono">${trade.exitPrice.toLocaleString()}</span>
                                    <span className="text-xs text-muted-foreground font-mono">{trade.size.toFixed(4)}</span>
                                    <div><PnLBadge value={trade.pnl} /></div>
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandedTrade(trade.id);
                                            }}
                                            title="View Details"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {expandedTrade === trade.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden bg-background/20"
                                        >
                                            <div className="px-6 py-6 border-t border-border space-y-6">
                                                {/* Trade Details Grid */}
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Order Type</span>
                                                        <Badge variant="outline" className="bg-secondary/20 border-border">{trade.orderType}</Badge>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Duration</span>
                                                        <div className="flex items-center gap-1.5 text-xs text-foreground">
                                                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                                                            {formatDuration(trade.duration)}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Fees</span>
                                                        <span className="text-xs text-foreground font-mono">${trade.totalFees.toFixed(2)}</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Return</span>
                                                        <span className={`text-xs font-bold ${trade.pnlPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                            {trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Notes Section - Redesigned */}
                                                <div className="space-y-3 pt-4 border-t border-border">
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="w-3.5 h-3.5 text-cyan-400" />
                                                        <span className="text-xs font-medium text-foreground">Journal Notes</span>
                                                    </div>

                                                    {trade.notes && editingNoteId !== trade.id ? (
                                                        <div className="group relative bg-muted/20 rounded-xl p-4 border border-border hover:border-border/80 transition-colors">
                                                            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                                                {trade.notes}
                                                            </p>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                                                onClick={() => {
                                                                    setEditingNoteId(trade.id);
                                                                    setNoteText(trade.notes || '');
                                                                }}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col gap-3">
                                                            <textarea
                                                                value={noteText}
                                                                onChange={(e) => setNoteText(e.target.value)}
                                                                placeholder={editingNoteId === trade.id ? "Edit your note..." : "Write your thoughts on this trade..."}
                                                                className="w-full h-24 px-4 py-3 rounded-xl bg-background/50 border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500/50 resize-none font-handwriting leading-relaxed"
                                                                style={{ backgroundImage: 'linear-gradient(transparent 95%, rgba(128,128,128,0.05) 95%)', backgroundSize: '100% 24px', lineHeight: '24px' }}
                                                                autoFocus={editingNoteId === trade.id}
                                                            />
                                                            <div className="flex justify-end gap-2">
                                                                {editingNoteId === trade.id && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => {
                                                                            setEditingNoteId(null);
                                                                            setNoteText('');
                                                                        }}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/20"
                                                                    onClick={() => {
                                                                        onAddNote(trade.id, noteText);
                                                                        setNoteText('');
                                                                        setEditingNoteId(null);
                                                                        toast.success('Note saved');
                                                                    }}
                                                                >
                                                                    Save Note
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
                        <span className="text-xs text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="h-8 w-8 p-0 rounded-lg hover:bg-muted"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="h-8 w-8 p-0 rounded-lg hover:bg-muted"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <ExportModal
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                trades={trades}
                journalEntries={journalEntries}
            />
        </>
    );
}
