// ─── Analytics Metric Calculations ────────────────────────────────────────────
// All pure functions. No side effects. Accept Trade[] and return computed data.

import type {
    Trade,
    DailyPnL,
    PortfolioStats,
    FeeBreakdown,
    VolumeData,
    HeatmapData,
    SymbolStats,
} from '@/types';

// ─── Daily PnL ───────────────────────────────────────────────────────────────

export function calculateDailyPnL(trades: Trade[], initialBalance: number = 0): DailyPnL[] {
    const dailyMap = new Map<string, { pnl: number; trades: number }>();

    for (const trade of trades) {
        const dateStr = trade.entryTime.toISOString().split('T')[0];
        const existing = dailyMap.get(dateStr) || { pnl: 0, trades: 0 };
        dailyMap.set(dateStr, {
            pnl: existing.pnl + trade.pnl,
            trades: existing.trades + 1,
        });
    }

    const sortedDates = Array.from(dailyMap.keys()).sort();
    let cumulativePnl = 0;

    // Equity tracking for Drawdown
    // If initialBalance is 0, we can't calculate meaningful % drawdown based on equity.
    // Fallback: assume a starting balance or just track PnL drawdown (standard but can be huge %).
    // Better fallback: default to 0 and handle division by zero.
    // Actually, usually standard DD is from High Water Mark of Equity.
    const startingEquity = initialBalance > 0 ? initialBalance : 0;
    let peakEquity = startingEquity;

    return sortedDates.map((date) => {
        const { pnl, trades: tradeCount } = dailyMap.get(date)!;
        cumulativePnl += pnl;

        const currentEquity = startingEquity + cumulativePnl;
        peakEquity = Math.max(peakEquity, currentEquity);

        let drawdown = 0;
        if (peakEquity > 0) {
            drawdown = ((peakEquity - currentEquity) / peakEquity) * 100;
        }

        // Normalize -0 to 0
        const formattedPnl = Math.abs(pnl) < 0.005 ? 0 : Number(pnl.toFixed(2));
        const formattedCumulative = Math.abs(cumulativePnl) < 0.005 ? 0 : Number(cumulativePnl.toFixed(2));

        return {
            date,
            pnl: formattedPnl,
            cumulativePnl: formattedCumulative,
            drawdown: Number(drawdown.toFixed(2)),
            trades: tradeCount,
        };
    });
}

// ─── Portfolio Statistics ────────────────────────────────────────────────────

export function calculatePortfolioStats(trades: Trade[], initialBalance: number = 0): PortfolioStats {
    if (trades.length === 0) {
        return {
            totalPnl: 0, totalPnlPercent: 0, winRate: 0,
            totalTrades: 0, winningTrades: 0, losingTrades: 0,
            avgWin: 0, avgLoss: 0, largestWin: 0, largestLoss: 0,
            avgTradeDuration: 0, totalVolume: 0, totalFees: 0,
            longRatio: 0, shortRatio: 0, profitFactor: 0,
            sharpeRatio: 0, maxDrawdown: 0,
        };
    }

    const winners = trades.filter((t) => t.pnl > 0);
    const losers = trades.filter((t) => t.pnl < 0);
    const longs = trades.filter((t) => t.side === 'LONG');

    const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
    const totalVolume = trades.reduce((s, t) => s + t.notional, 0);
    const totalFees = trades.reduce((s, t) => s + t.totalFees, 0);

    const grossProfit = winners.reduce((s, t) => s + t.pnl, 0);
    const grossLoss = Math.abs(losers.reduce((s, t) => s + t.pnl, 0));

    const avgWin = winners.length > 0
        ? grossProfit / winners.length
        : 0;
    const avgLoss = losers.length > 0
        ? grossLoss / losers.length
        : 0;

    const dailyPnL = calculateDailyPnL(trades, initialBalance);
    const maxDrawdown = dailyPnL.length > 0
        ? Math.max(...dailyPnL.map((d) => d.drawdown))
        : 0;

    // Sharpe ratio approximation: mean daily return / stddev of daily returns
    const sharpeRatio = calculateSharpeRatio(dailyPnL);

    return {
        totalPnl: Number(totalPnl.toFixed(2)),
        totalPnlPercent: Number(((totalPnl / Math.max(totalVolume * 0.1, 1)) * 100).toFixed(2)),
        winRate: Number(((winners.length / trades.length) * 100).toFixed(1)),
        totalTrades: trades.length,
        winningTrades: winners.length,
        losingTrades: losers.length,
        avgWin: Number(avgWin.toFixed(2)),
        avgLoss: Number(avgLoss.toFixed(2)),
        largestWin: winners.length > 0 ? Number(Math.max(...winners.map((t) => t.pnl)).toFixed(2)) : 0,
        largestLoss: losers.length > 0 ? Number(Math.min(...losers.map((t) => t.pnl)).toFixed(2)) : 0,
        avgTradeDuration: Number((trades.reduce((s, t) => s + t.duration, 0) / trades.length).toFixed(0)),
        totalVolume: Number(totalVolume.toFixed(2)),
        totalFees: Number(totalFees.toFixed(2)),
        longRatio: Number(((longs.length / trades.length) * 100).toFixed(1)),
        shortRatio: Number((((trades.length - longs.length) / trades.length) * 100).toFixed(1)),
        profitFactor: grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : (grossProfit > 0 ? 999 : 0),
        sharpeRatio: Number(sharpeRatio.toFixed(2)),
        maxDrawdown: Number(maxDrawdown.toFixed(2)),
    };
}

// ─── Sharpe Ratio ────────────────────────────────────────────────────────────

/**
 * Annualized Sharpe ratio from daily PnL data
 * sharpe = (mean daily return / stddev) × √252
 */
export function calculateSharpeRatio(dailyPnL: DailyPnL[]): number {
    if (dailyPnL.length < 2) return 0;

    const returns = dailyPnL.map((d) => d.pnl);
    const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
    const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / (returns.length - 1);
    const stddev = Math.sqrt(variance);

    if (stddev === 0) return 0;
    return (mean / stddev) * Math.sqrt(252); // annualized
}

// ─── Max Drawdown ────────────────────────────────────────────────────────────

export function calculateMaxDrawdown(dailyPnL: DailyPnL[]): number {
    if (dailyPnL.length === 0) return 0;
    return Math.max(...dailyPnL.map((d) => d.drawdown));
}

// ─── Fee Breakdown ───────────────────────────────────────────────────────────

export function calculateFeeBreakdown(trades: Trade[]): FeeBreakdown {
    const maker = trades.reduce((s, t) => s + t.makerFee, 0);
    const taker = trades.reduce((s, t) => s + t.takerFee, 0);
    const funding = trades.reduce((s, t) => s + t.fundingFee, 0);
    const total = maker + taker + funding;

    return {
        maker: Number(maker.toFixed(2)),
        taker: Number(taker.toFixed(2)),
        funding: Number(funding.toFixed(2)),
        total: Number(total.toFixed(2)),
    };
}

// ─── Volume Data ─────────────────────────────────────────────────────────────

export function calculateVolumeData(trades: Trade[]): VolumeData[] {
    const volumeMap = new Map<string, { volume: number; trades: number }>();

    for (const trade of trades) {
        const dateStr = trade.entryTime.toISOString().split('T')[0];
        const existing = volumeMap.get(dateStr) || { volume: 0, trades: 0 };
        volumeMap.set(dateStr, {
            volume: existing.volume + trade.notional,
            trades: existing.trades + 1,
        });
    }

    return Array.from(volumeMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({
            date,
            volume: Number(data.volume.toFixed(2)),
            trades: data.trades,
        }));
}

// ─── Heatmap Data ────────────────────────────────────────────────────────────

export function calculateHeatmapData(trades: Trade[]): HeatmapData[] {
    // Build a 7×24 grid (day × hour)
    const grid = new Map<string, { pnl: number; trades: number }>();

    for (const trade of trades) {
        const hour = trade.entryTime.getHours();
        const day = trade.entryTime.getDay();
        const key = `${day}-${hour}`;
        const existing = grid.get(key) || { pnl: 0, trades: 0 };
        grid.set(key, {
            pnl: existing.pnl + trade.pnl,
            trades: existing.trades + 1,
        });
    }

    const heatmap: HeatmapData[] = [];
    for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
            const data = grid.get(`${day}-${hour}`);
            if (data) {
                heatmap.push({
                    hour,
                    dayOfWeek: day,
                    pnl: Number(data.pnl.toFixed(2)),
                    trades: data.trades,
                });
            }
        }
    }

    return heatmap;
}

// ─── Symbol Statistics ───────────────────────────────────────────────────────

export function calculateSymbolStats(trades: Trade[]): SymbolStats[] {
    const symbolMap = new Map<string, Trade[]>();

    for (const trade of trades) {
        const existing = symbolMap.get(trade.symbol) || [];
        existing.push(trade);
        symbolMap.set(trade.symbol, existing);
    }

    return Array.from(symbolMap.entries())
        .map(([symbol, symbolTrades]) => ({
            symbol,
            trades: symbolTrades.length,
            pnl: Number(symbolTrades.reduce((s, t) => s + t.pnl, 0).toFixed(2)),
            winRate: Number(
                ((symbolTrades.filter((t) => t.pnl > 0).length / symbolTrades.length) * 100).toFixed(1)
            ),
            volume: Number(symbolTrades.reduce((s, t) => s + t.notional, 0).toFixed(2)),
        }))
        .sort((a, b) => b.pnl - a.pnl);
}
