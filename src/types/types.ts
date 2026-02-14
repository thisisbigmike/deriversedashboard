// Trading Analytics Dashboard Types

export interface Trade {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  size: number;
  pnl: number;
  pnlPercent: number;
  entryTime: Date;
  exitTime: Date;
  duration: number; // in minutes
  fees: number;
  orderType: 'MARKET' | 'LIMIT' | 'STOP';
  notes?: string;
  tags?: string[];
}

export interface DailyPnL {
  date: string;
  pnl: number;
  cumulativePnl: number;
  drawdown: number;
  trades: number;
}

export interface PortfolioStats {
  totalPnl: number;
  totalPnlPercent: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  avgTradeDuration: number;
  totalVolume: number;
  totalFees: number;
  longRatio: number;
  shortRatio: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export interface FeeBreakdown {
  maker: number;
  taker: number;
  funding: number;
  total: number;
}

export interface VolumeData {
  date: string;
  volume: number;
  trades: number;
}

export interface HeatmapData {
  hour: number;
  dayOfWeek: number;
  pnl: number;
  trades: number;
}

export interface SymbolStats {
  symbol: string;
  trades: number;
  pnl: number;
  winRate: number;
  volume: number;
}

export interface TimeframeOption {
  label: string;
  value: '7D' | '30D' | '90D' | 'ALL';
  days: number;
}

export interface FilterState {
  symbol: string;
  timeframe: TimeframeOption['value'];
  orderType: string;
  side: string;
}

export interface JournalEntry {
  id: string;
  tradeId: string;
  note: string;
  tags: string[];
  createdAt: Date;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface DashboardSection {
  id: string;
  label: string;
  icon: string;
}
