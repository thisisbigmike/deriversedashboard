# Deriverse Trading Analytics Dashboard

A professional trading analytics dashboard for [Deriverse](https://deriverse.io) — a Solana-based perpetual futures DEX.

## Features

- **PnL Tracking** — Cumulative P&L, drawdown analysis, daily breakdown
- **Trade Journal** — Annotate trades, tag strategies, track sentiment
- **Portfolio Analysis** — Symbol performance, win rates, volume metrics
- **Advanced Analytics** — Time-based heatmaps, Sharpe ratio, profit factor
- **Fee Breakdown** — Exact Deriverse fee calculations (maker/taker/funding)
- **Wallet Integration** — Connect Phantom, Solflare, or Ledger via Solana Wallet Adapter
- **Mock Data** — Realistic 90-day trade history for demo/development

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **State**: Zustand
- **Wallet**: Solana Wallet Adapter
- **Auth**: NextAuth v5

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values. For development, only `NEXT_PUBLIC_SOLANA_CLUSTER=devnet` is required.

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to view the dashboard.

## Project Structure

```
src/
├── app/dashboard/
│   ├── layout.tsx              # Dashboard shell (sidebar + header)
│   ├── page.tsx                # Overview — KPIs, charts, trade history
│   ├── journal/page.tsx        # Trade journal
│   ├── portfolio/page.tsx      # Portfolio analysis
│   └── analytics/page.tsx      # Deep analytics (heatmap, PnL, volume)
├── components/
│   ├── charts/                 # Recharts components (PnL, Volume, Fees, etc.)
│   ├── dashboard/              # StatsGrid, FilterBar, TradeHistory, etc.
│   ├── layout/                 # Sidebar, Header
│   └── wallet/                 # WalletProvider, WalletConnectButton
├── lib/
│   ├── deriverse/              # SDK layer (client, trades, positions, account)
│   ├── utils/                  # Fees, metrics, formatters
│   └── mockData.ts             # 90-day mock trade generator
├── hooks/                      # useDeriverseData, useMetrics, useFilters
├── store/                      # Zustand store
└── types/                      # TypeScript interfaces
```

## Deriverse Fee Structure

| Fee Type | Rate | Applies To |
|----------|------|------------|
| Taker | 0.05% (5 bps) | Market & Stop orders |
| Maker | -0.00625% (Rebate) | Limit orders (12.5% of base fee) |
| Funding | ~0.01% per 8h | Perpetual positions |

## Connecting to Devnet

1. Set `NEXT_PUBLIC_SOLANA_CLUSTER=devnet` in `.env.local`
2. Connect a wallet (Phantom, Solflare)
3. The dashboard will load mock data by default
4. When the real Deriverse SDK integration is complete, toggle `useMockData` off in the store

## License

MIT
# deriversedashboard
