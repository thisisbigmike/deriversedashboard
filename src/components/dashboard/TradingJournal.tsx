'use client';

import { JournalEntry, Trade } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
    MessageCircle,
    Tag,
    Calendar,
    ThumbsUp,
    ThumbsDown,
    Minus,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface TradingJournalProps {
    entries: JournalEntry[];
    trades: Trade[];
}

const ITEMS_PER_PAGE = 10;

export function TradingJournal({ entries, trades }: TradingJournalProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(entries.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const visibleEntries = entries.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const getTradeForEntry = (entry: JournalEntry) => {
        return trades.find(t => t.id === entry.tradeId);
    };

    const getSentimentIcon = (sentiment: JournalEntry['sentiment']) => {
        switch (sentiment) {
            case 'positive':
                return <ThumbsUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
            case 'negative':
                return <ThumbsDown className="w-4 h-4 text-red-500 dark:text-red-400" />;
            default:
                return <Minus className="w-4 h-4 text-muted-foreground" />;
        }
    };

    const getSentimentColor = (sentiment: JournalEntry['sentiment']) => {
        switch (sentiment) {
            case 'positive':
                return 'border-emerald-500/30 bg-emerald-500/5';
            case 'negative':
                return 'border-red-500/30 bg-red-500/5';
            default:
                return 'border-border bg-secondary/20';
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    Trading Journal
                </CardTitle>
                <span className="text-xs text-muted-foreground">{entries.length} entries</span>
            </CardHeader>

            <CardContent className="space-y-4">
                {entries.length === 0 ? (
                    <div className="text-center py-8">
                        <MessageCircle className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No journal entries yet</p>
                        <p className="text-xs text-muted-foreground/80">Add notes to your trades to see them here</p>
                    </div>
                ) : (
                    visibleEntries.map((entry, index) => {
                        const trade = getTradeForEntry(entry);
                        return (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`p-4 rounded-xl border ${getSentimentColor(entry.sentiment)}`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {getSentimentIcon(entry.sentiment)}
                                        {trade && (
                                            <span className="text-sm font-medium text-foreground">{trade.symbol}</span>
                                        )}
                                        {trade && (
                                            <Badge variant={trade.pnl >= 0 ? 'success' : 'danger'}>
                                                {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(entry.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </div>
                                </div>

                                {/* Note Content */}
                                <p className="text-sm text-foreground leading-relaxed mb-3">
                                    {entry.note}
                                </p>

                                {/* Tags */}
                                {entry.tags && entry.tags.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-3 h-3 text-muted-foreground" />
                                        {entry.tags.map((tag, idx) => (
                                            <Badge key={idx} variant="default" size="sm">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })
                )}
            </CardContent>

            {/* Pagination */}
            {entries.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-6 py-4 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                        Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, entries.length)} of {entries.length}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            icon={<ChevronLeft className="w-4 h-4" />}
                        >
                            Prev
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            icon={<ChevronRight className="w-4 h-4" />}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
