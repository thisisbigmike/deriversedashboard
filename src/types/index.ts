// ─── Deriverse Trading Analytics — Type Definitions ───────────────────────────

// ─── Trade Types ──────────────────────────────────────────────────────────────

export type TradeSide = 'LONG' | 'SHORT';
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP';
export type MarketType = 'PERP' | 'SPOT';

export interface Trade {
    id: string;
    symbol: string;
    side: TradeSide;
    marketType: MarketType;
    entryPrice: number;
    exitPrice: number;
    size: number;
    notional: number; // size × entry price
    pnl: number;
    pnlPercent: number;
    entryTime: Date;
    exitTime: Date;
    duration: number; // minutes
    orderType: OrderType;
    // Separate fee fields — exact Deriverse fee breakdown
    makerFee: number;
    takerFee: number;
    fundingFee: number;
    totalFees: number;
    notes?: string;
    tags?: string[];
}

// ─── Position Types ───────────────────────────────────────────────────────────

export interface Position {
    id: string;
    symbol: string;
    side: TradeSide;
    marketType: MarketType;
    entryPrice: number;
    markPrice: number;
    size: number;
    notional: number;
    unrealizedPnl: number;
    unrealizedPnlPercent: number;
    margin: number;
    leverage: number;
    liquidationPrice: number;
    openedAt: Date;
}

// ─── Account Types ────────────────────────────────────────────────────────────

export interface AccountInfo {
    walletAddress: string;
    balance: number;        // USDC balance
    availableMargin: number;
    usedMargin: number;
    marginUtilization: number; // 0-1
    feeTier: string;
    prepaymentBalance: number;
    totalDeposited: number;
    totalWithdrawn: number;
}

export interface MarginHealth {
    ratio: number;      // 0-1, higher = healthier
    status: 'healthy' | 'warning' | 'danger' | 'liquidation';
    availableMargin: number;
    usedMargin: number;
    maintenanceMargin: number;
}

// ─── Analytics Types ──────────────────────────────────────────────────────────

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

// ─── Filter & UI Types ───────────────────────────────────────────────────────

export type TimeframeValue = '7D' | '30D' | '90D' | 'ALL';

export interface TimeframeOption {
    label: string;
    value: TimeframeValue;
    days: number;
}

export interface FilterState {
    symbol: string;
    timeframe: TimeframeValue;
    orderType: string;
    side: string;
}

// ─── Journal Types ────────────────────────────────────────────────────────────

export interface JournalEntry {
    id: string;
    tradeId: string;
    note: string;
    tags: string[];
    createdAt: Date;
    sentiment: 'positive' | 'negative' | 'neutral';
}

// ─── Config Types ─────────────────────────────────────────────────────────────

export interface DeriverseConfig {
    rpcEndpoint: string;
    cluster: 'devnet' | 'mainnet-beta';
    programId: string;
}

export interface DashboardSection {
    id: string;
    label: string;
    icon: string;
    href: string;
}

// ─── Crypto Price Types ───────────────────────────────────────────────────────

export interface CryptoQuote {
    symbol: string;
    name: string;
    price: number;
    percent_change_1h: number;
    percent_change_24h: number;
    percent_change_7d: number;
    market_cap: number;
    volume_24h: number;
    last_updated: string;
}

export interface CryptoPriceResponse {
    data: Record<string, CryptoQuote>;
    timestamp: number;
    cached: boolean;
    stale?: boolean;
}

