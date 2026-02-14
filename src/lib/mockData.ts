// ─── Mock Data Generator ──────────────────────────────────────────────────────
// Produces 90 days of realistic trade history using correct Deriverse fee formulas.
// Falls back automatically when wallet is not connected.
// Can be toggled off when a real wallet connects.

import type { Trade, JournalEntry } from '@/types';
import { calculateTotalFees } from '@/lib/utils/fees';

// ─── Constants ────────────────────────────────────────────────────────────────

const SYMBOLS = ['SOL/USDC', 'BTC/USDC', 'ETH/USDC'];
const MARKET_TYPES = ['PERP', 'PERP', 'PERP', 'SPOT'] as const; // weighted toward perps
const ORDER_TYPES: ('MARKET' | 'LIMIT' | 'STOP')[] = ['MARKET', 'LIMIT', 'STOP'];
const SIDES: ('LONG' | 'SHORT')[] = ['LONG', 'SHORT'];
const TAGS = ['breakout', 'reversal', 'scalp', 'swing', 'news', 'trend', 'range'];
const SENTIMENTS: ('positive' | 'negative' | 'neutral')[] = ['positive', 'negative', 'neutral'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const random = (min: number, max: number) => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.floor(random(min, max));
const randomChoice = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ─── Base Price Lookup ────────────────────────────────────────────────────────

function getBasePrice(symbol: string): number {
  if (symbol.startsWith('BTC')) return random(45000, 55000);
  if (symbol.startsWith('ETH')) return random(2800, 3500);
  if (symbol.startsWith('SOL')) return random(120, 180);
  return random(5, 50);
}

// ─── Single Trade Generator ──────────────────────────────────────────────────

function generateTrade(id: number, baseDate: Date): Trade {
  const symbol = randomChoice(SYMBOLS);
  const side = randomChoice(SIDES);
  const marketType = randomChoice(MARKET_TYPES);
  const orderType = randomChoice(ORDER_TYPES);
  const entryPrice = getBasePrice(symbol);

  // Realistic PnL distribution: slight negative skew (not all winners)
  // ~45% probability of profit, ~55% loss
  const edge = Math.random() < 0.45 ? 1 : -1;
  const magnitude = random(0.002, 0.06);
  const priceChange = edge * magnitude * entryPrice;

  const exitPrice = side === 'LONG'
    ? entryPrice + priceChange
    : entryPrice - priceChange;

  const size = symbol.startsWith('BTC')
    ? random(0.01, 0.5)
    : symbol.startsWith('ETH')
      ? random(0.1, 5)
      : random(1, 50);

  const notional = size * entryPrice;
  const pnl = (exitPrice - entryPrice) * size * (side === 'LONG' ? 1 : -1);
  const pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100 * (side === 'LONG' ? 1 : -1);

  const entryTime = new Date(baseDate);
  entryTime.setHours(randomInt(0, 23), randomInt(0, 59));
  const duration = randomInt(5, 720); // 5 minutes to 12 hours
  const exitTime = new Date(entryTime.getTime() + duration * 60000);

  // Calculate fees using exact Deriverse formulas
  const fees = calculateTotalFees(size, entryPrice, orderType, duration);

  return {
    id: `trade-${id}`,
    symbol,
    side,
    marketType,
    entryPrice: Number(entryPrice.toFixed(2)),
    exitPrice: Number(exitPrice.toFixed(2)),
    size: Number(size.toFixed(4)),
    notional: Number(notional.toFixed(2)),
    pnl: Number(pnl.toFixed(2)),
    pnlPercent: Number(pnlPercent.toFixed(2)),
    entryTime,
    exitTime,
    duration,
    orderType,
    makerFee: fees.makerFee,
    takerFee: fees.takerFee,
    fundingFee: fees.fundingFee,
    totalFees: fees.totalFees,
    notes: Math.random() > 0.7 ? `Trade note for ${symbol}` : undefined,
    tags: Math.random() > 0.5 ? [randomChoice(TAGS), randomChoice(TAGS)] : undefined,
  };
}

// ─── Generate Full Trade History ─────────────────────────────────────────────

export function generateTrades(days: number = 90): Trade[] {
  const trades: Trade[] = [];
  const now = new Date();
  let id = 1;

  for (let d = days; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    const tradesPerDay = randomInt(2, 8);

    for (let t = 0; t < tradesPerDay; t++) {
      trades.push(generateTrade(id++, date));
    }
  }

  return trades.sort((a, b) => b.entryTime.getTime() - a.entryTime.getTime());
}

// ─── Journal Entry Generator ─────────────────────────────────────────────────

export function generateJournalEntries(trades: Trade[]): JournalEntry[] {
  return trades
    .filter(() => Math.random() > 0.6)
    .slice(0, 20)
    .map((trade, index) => ({
      id: `journal-${index}`,
      tradeId: trade.id,
      note: trade.pnl > 0
        ? `Good entry on ${trade.symbol}. ${randomChoice([
          'Followed the plan perfectly.',
          'Great risk management.',
          'Patience paid off.',
          'Clean setup, clean execution.',
        ])}`
        : `Lesson learned on ${trade.symbol}. ${randomChoice([
          'Entered too early.',
          'Should have waited for confirmation.',
          'Position size was too large.',
          'Ignored the stop loss level.',
        ])}`,
      tags: [randomChoice(TAGS), randomChoice(TAGS)],
      createdAt: trade.exitTime,
      sentiment: trade.pnl > 0 ? 'positive' : trade.pnl < 0 ? 'negative' : 'neutral' as const,
    }));
}

// ─── Guest Demo Data ──────────────────────────────────────────────────────────

export function getGuestDemoData() {
  const now = new Date();
  const trades: Trade[] = [];
  const journalEntries: JournalEntry[] = [];

  // Trade 1: BTC Long (Big Win - Breakout)
  const t1Entry = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2); // 2 days ago
  const t1Exit = new Date(t1Entry.getTime() + 1000 * 60 * 180); // 3 hour trade

  trades.push({
    id: 'demo-trade-1',
    symbol: 'BTC/USDC',
    side: 'LONG',
    marketType: 'PERP',
    entryPrice: 48500.00,
    exitPrice: 51200.00,
    size: 0.5,
    notional: 24250.00,
    pnl: 1350.00,
    pnlPercent: 5.57,
    entryTime: t1Entry,
    exitTime: t1Exit,
    duration: 180,
    orderType: 'MARKET',
    makerFee: 0,
    takerFee: 12.12,
    fundingFee: 5.50,
    totalFees: 17.62,
    notes: 'Perfect breakout setup on the 4H timeframe.',
    tags: ['breakout', 'trend'],
  });

  journalEntries.push({
    id: 'demo-journal-1',
    tradeId: 'demo-trade-1',
    note: 'Waited for the confirmation candle above resistance. Good volume on breakout. Trailed stop loss to lock in profits.',
    tags: ['breakout', 'discipline'],
    createdAt: t1Exit,
    sentiment: 'positive',
  });

  // Trade 2: SOL Short (Small Loss - Chop)
  const t2Entry = new Date(now.getTime() - 1000 * 60 * 60 * 12); // 12 hours ago
  const t2Exit = new Date(t2Entry.getTime() + 1000 * 60 * 45); // 45 min trade

  trades.push({
    id: 'demo-trade-2',
    symbol: 'SOL/USDC',
    side: 'SHORT',
    marketType: 'PERP',
    entryPrice: 145.20,
    exitPrice: 146.50,
    size: 50,
    notional: 7260.00,
    pnl: -65.00,
    pnlPercent: -0.89,
    entryTime: t2Entry,
    exitTime: t2Exit,
    duration: 45,
    orderType: 'LIMIT',
    makerFee: -1.45, // Rebate
    takerFee: 0,
    fundingFee: 0.50,
    totalFees: -0.95,
    notes: 'Got chopped out in a range.',
    tags: ['scalp', 'range'],
  });

  journalEntries.push({
    id: 'demo-journal-2',
    tradeId: 'demo-trade-2',
    note: 'Market was ranging, should have waited for a clearer direction. Cut the loss early as per plan.',
    tags: ['range', 'discipline'],
    createdAt: t2Exit,
    sentiment: 'neutral',
  });

  // Trade 3: ETH Long (Win - Trend Follow)
  const t3Entry = new Date(now.getTime() - 1000 * 60 * 60 * 4); // 4 hours ago
  const t3Exit = new Date(t3Entry.getTime() + 1000 * 60 * 120); // 2 hour trade

  trades.push({
    id: 'demo-trade-3',
    symbol: 'ETH/USDC',
    side: 'LONG',
    marketType: 'PERP',
    entryPrice: 3250.00,
    exitPrice: 3380.00,
    size: 4.5,
    notional: 14625.00,
    pnl: 585.00,
    pnlPercent: 4.00,
    entryTime: t3Entry,
    exitTime: t3Exit,
    duration: 120,
    orderType: 'MARKET',
    makerFee: 0,
    takerFee: 7.31,
    fundingFee: 2.10,
    totalFees: 9.41,
    notes: 'ETH strength relative to BTC.',
    tags: ['trend', 'impulse'],
  });

  journalEntries.push({
    id: 'demo-journal-3',
    tradeId: 'demo-trade-3',
    note: 'ETH/BTC pair was breaking out, took the long on ETH. Smooth ride up.',
    tags: ['trend', 'good-execution'],
    createdAt: t3Exit,
    sentiment: 'positive',
  });

  // Trade 4: PERP Short (Loss - Failed Reversal)
  const t4Entry = new Date(now.getTime() - 1000 * 60 * 30); // 30 mins ago
  const t4Exit = new Date(now.getTime() - 1000 * 60 * 5); // 5 mins ago

  trades.push({
    id: 'demo-trade-4',
    symbol: 'BTC/USDC',
    side: 'SHORT',
    marketType: 'PERP',
    entryPrice: 51500.00,
    exitPrice: 51850.00,
    size: 0.2,
    notional: 10300.00,
    pnl: -70.00,
    pnlPercent: -0.68,
    entryTime: t4Entry,
    exitTime: t4Exit,
    duration: 25,
    orderType: 'STOP',
    makerFee: 0,
    takerFee: 5.15,
    fundingFee: 0,
    totalFees: 5.15,
    notes: 'Tried to catch the top, got stopped.',
    tags: ['counter-trend', 'stop-loss'],
  });

  // No journal entry for trade 4 to simulate real behavior (not everything is journaled)

  return {
    trades: trades.sort((a, b) => b.entryTime.getTime() - a.entryTime.getTime()),
    positions: [],
    account: null,
    journalEntries: journalEntries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  };
}
