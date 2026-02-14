'use client';

import { SymbolStats, PortfolioStats } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    PieChart
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PortfolioAnalysisProps {
    symbolStats: SymbolStats[];
    portfolioStats: PortfolioStats;
}

export function PortfolioAnalysis({ symbolStats, portfolioStats }: PortfolioAnalysisProps) {
    const sortedSymbols = [...symbolStats].sort((a, b) => b.volume - a.volume);
    const totalVolume = symbolStats.reduce((sum, s) => sum + s.volume, 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Symbol Performance */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <PieChart className="w-4 h-4 text-purple-400" />
                        Symbol Performance
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                    {sortedSymbols.map((symbol, index) => {
                        const volumePercent = (symbol.volume / totalVolume) * 100;
                        const isProfit = symbol.pnl >= 0;

                        return (
                            <motion.div
                                key={symbol.symbol}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                            >
                                {/* Symbol Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-foreground">{symbol.symbol}</span>
                                        <Badge variant={isProfit ? 'success' : 'danger'} size="sm">
                                            {symbol.winRate.toFixed(0)}% WR
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{symbol.trades} trades</span>
                                        <span>•</span>
                                        <span>${(symbol.volume / 1000).toFixed(1)}K vol</span>
                                    </div>
                                </div>

                                {/* PnL */}
                                <div className="text-right">
                                    <div className={`flex items-center gap-1 text-sm font-medium ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {isProfit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                        {isProfit ? '+' : ''}${symbol.pnl.toLocaleString()}
                                    </div>
                                </div>

                                {/* Volume Bar */}
                                <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${volumePercent}%` }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </CardContent>
            </Card>

            {/* Portfolio Summary */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-cyan-400" />
                        Portfolio Summary
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Total Value */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Total Profit/Loss</p>
                        <div className="flex items-center gap-2">
                            {portfolioStats.totalPnl >= 0 ? (
                                <TrendingUp className="w-6 h-6 text-emerald-400" />
                            ) : (
                                <TrendingDown className="w-6 h-6 text-red-400" />
                            )}
                            <span className={`text-xl sm:text-3xl font-bold ${portfolioStats.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {portfolioStats.totalPnl >= 0 ? '+' : ''}${portfolioStats.totalPnl.toLocaleString()}
                            </span>
                        </div>
                        <p className={`text-sm mt-1 ${portfolioStats.totalPnlPercent >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                            {portfolioStats.totalPnlPercent >= 0 ? '+' : ''}{portfolioStats.totalPnlPercent}% return
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Total Volume</p>
                            <p className="text-sm sm:text-lg font-semibold text-foreground">${(portfolioStats.totalVolume / 1000000).toFixed(2)}M</p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Total Fees</p>
                            <p className="text-sm sm:text-lg font-semibold text-foreground">${portfolioStats.totalFees.toLocaleString()}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Sharpe Ratio</p>
                            <p className="text-sm sm:text-lg font-semibold text-foreground">{portfolioStats.sharpeRatio}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Profit Factor</p>
                            <p className="text-sm sm:text-lg font-semibold text-foreground">{portfolioStats.profitFactor}</p>
                        </div>
                    </div>

                    {/* Long/Short Split */}
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Position Bias</p>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden flex">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${portfolioStats.longRatio}%` }}
                                    transition={{ duration: 0.5 }}
                                    className="h-full bg-emerald-500"
                                />
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${portfolioStats.shortRatio}%` }}
                                    transition={{ duration: 0.5 }}
                                    className="h-full bg-red-500"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs">
                            <span className="text-emerald-400">{portfolioStats.longRatio.toFixed(0)}% Long</span>
                            <span className="text-red-400">{portfolioStats.shortRatio.toFixed(0)}% Short</span>
                        </div>
                    </div>

                    {/* Largest Trades */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-[10px] text-emerald-400/70 uppercase tracking-wider mb-1">Largest Win</p>
                            <p className="text-sm sm:text-lg font-semibold text-emerald-400">+${portfolioStats.largestWin.toLocaleString()}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <p className="text-[10px] text-red-400/70 uppercase tracking-wider mb-1">Largest Loss</p>
                            <p className="text-sm sm:text-lg font-semibold text-red-400">${portfolioStats.largestLoss.toLocaleString()}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
