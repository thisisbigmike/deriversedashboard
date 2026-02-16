# Deriverse Trading Analytics Dashboard

A professional trading analytics dashboard for [Deriverse](https://deriverse.io) — a Solana-based perpetual futures DEX. Built with Next.js 16, featuring live crypto prices, an AI-powered assistant, and a liquid glass UI.

---

## ✨ Features

### Core Analytics
- **PnL Tracking** — Cumulative P&L curves, drawdown analysis, daily breakdown
- **Trade Journal** — Annotate trades, tag strategies, track sentiment
- **Portfolio Analysis** — Symbol performance, win rates, volume metrics
- **Advanced Analytics** — Time-based heatmaps, Sharpe ratio, profit factor
- **Fee Breakdown** — Exact Deriverse fee calculations (maker/taker/funding)

### Live Data
- **Live Price Ticker** — Real-time crypto prices via CoinGecko API
- **Wallet Integration** — Connect Phantom, Solflare, or Ledger via Solana Wallet Adapter
- **Data Export** — Export trade history and analytics

### AI & Auth
- **AI Chat Assistant** — Gemini-powered floating assistant for trading insights
- **Authentication** — Email/password, Google OAuth, and Twitter OAuth via NextAuth v5
- **Password Reset** — Email-based reset flow powered by Resend
- **Guest Demo Mode** — Full dashboard access with demo data for unauthenticated users

### Design
- **Liquid Glass UI** — Modern glassmorphism aesthetic with subtle animations
- **Dark / Light Themes** — Full theme support via `next-themes`
- **Responsive** — Optimized for mobile, tablet, and desktop viewports

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **UI** | Radix UI, Lucide Icons, Framer Motion |
| **Charts** | Recharts 3 |
| **State** | Zustand |
| **Auth** | NextAuth v5 (beta) with Prisma Adapter |
| **Database** | PostgreSQL (Neon serverless) |
| **ORM** | Prisma 7 |
| **Wallet** | Solana Wallet Adapter |
| **AI** | Google Gemini (Generative AI SDK) |
| **Email** | Resend |
| **Hosting** | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (or any PostgreSQL instance)
- (Optional) Google/Twitter OAuth credentials
- (Optional) [Resend](https://resend.com) API key for email
- (Optional) [Gemini API key](https://aistudio.google.com/apikey) for the AI assistant

### 1. Clone & Install

```bash
git clone https://github.com/thisisbigmike/deriversedashboard.git
cd deriversedashboard
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# ─── Solana ───────────────────────────────────────────────────────────────────
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
NEXT_PUBLIC_DERIVERSE_PROGRAM_ID=CDESjex4EDBKLwx9ZPzVbjiHEHatasb5fhSJZMzNfvw2

# ─── Authentication ──────────────────────────────────────────────────────────
AUTH_SECRET=          # openssl rand -base64 32
AUTH_GOOGLE_ID=       # Google OAuth client ID
AUTH_GOOGLE_SECRET=   # Google OAuth client secret
AUTH_TWITTER_ID=      # Twitter OAuth client ID
AUTH_TWITTER_SECRET=  # Twitter OAuth client secret

# ─── Database ────────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"

# ─── Email ───────────────────────────────────────────────────────────────────
RESEND_API_KEY=       # For password reset emails

# ─── AI Assistant ────────────────────────────────────────────────────────────
GEMINI_API_KEY=       # Google Gemini API key
```

> **Minimum for development:** Only `DATABASE_URL` and `AUTH_SECRET` are required. The dashboard will run in guest/demo mode without OAuth or email configured.

### 3. Set Up the Database

```bash
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📁 Project Structure

```
├── middleware.ts                   # Route protection & redirects
├── prisma/
│   └── schema.prisma              # Database schema (User, Account, Session, etc.)
└── src/
    ├── auth.ts                    # NextAuth v5 configuration
    ├── auth.config.ts             # Auth providers (Google, Twitter, Credentials)
    ├── app/
    │   ├── layout.tsx             # Root layout (providers, fonts, metadata)
    │   ├── page.tsx               # Landing / redirect
    │   ├── globals.css            # Global styles & design tokens
    │   ├── login/                 # Login page
    │   ├── register/              # Registration page
    │   ├── dashboard/
    │   │   ├── layout.tsx         # Dashboard shell (sidebar + header)
    │   │   ├── page.tsx           # Overview — KPIs, charts, trade history
    │   │   ├── journal/           # Trade journal page
    │   │   ├── portfolio/         # Portfolio analysis page
    │   │   └── analytics/         # Deep analytics (heatmap, PnL, volume)
    │   └── api/
    │       ├── ai/                # Gemini AI chat endpoint
    │       ├── auth/              # NextAuth API routes & registration
    │       └── crypto/            # Live price proxy (CoinGecko)
    ├── components/
    │   ├── auth/                  # AuthProvider, SignOutButton
    │   ├── charts/                # PnLChart, VolumeChart, HeatmapChart, etc.
    │   ├── dashboard/             # StatsGrid, FilterBar, TradeHistory, etc.
    │   │   └── AIChatAssistant    # Floating AI chat (React Portal)
    │   ├── layout/                # Sidebar, Header
    │   ├── theme/                 # Theme toggle & provider
    │   ├── ui/                    # Button, Card, Badge, Select, LivePriceTicker
    │   └── wallet/                # WalletProvider, WalletConnectButton
    ├── hooks/                     # useDeriverseData, useMetrics, useFilters
    ├── lib/
    │   ├── db.ts                  # Prisma client (Neon serverless adapter)
    │   ├── email.ts               # Resend email templates
    │   ├── cryptoPrices.ts        # CoinGecko price fetching
    │   ├── mockData.ts            # 90-day mock trade generator + guest demo
    │   ├── mockPrices.ts          # Fallback price data
    │   ├── tokens.ts              # Supported token definitions
    │   ├── deriverse/             # SDK layer (client, trades, positions, account)
    │   └── utils/                 # Fees, metrics, formatters
    ├── store/                     # Zustand store
    └── types/                     # TypeScript interfaces
```

---

## 💰 Deriverse Fee Structure

| Fee Type | Rate | Applies To |
|----------|------|------------|
| Taker | 0.05% (5 bps) | Market & Stop orders |
| Maker | −0.00625% (Rebate) | Limit orders (12.5% of base fee) |
| Funding | ~0.01% per 8h | Perpetual positions |

---

## 🔌 API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/*` | Various | NextAuth v5 auth endpoints |
| `/api/auth/register` | POST | Email/password registration |
| `/api/crypto` | GET | Proxied live crypto prices (CoinGecko) |
| `/api/ai` | POST | Gemini AI chat completions |

---

## 🌐 Deployment

The app is optimized for **Vercel**:

```bash
npm run build   # Runs: prisma generate && next build
```

Set all environment variables in the Vercel dashboard. The middleware is Edge-compatible (no heavy dependencies in the Edge bundle).

---

## 🗄️ Database

The app uses **Neon serverless PostgreSQL** via Prisma 7 with the `@prisma/adapter-neon` driver adapter.

**Models:**
- `User` — Credentials & OAuth users
- `Account` — OAuth provider accounts
- `Session` — User sessions
- `VerificationToken` — Email verification
- `PasswordResetToken` — Password reset flow

Run migrations:
```bash
npx prisma db push        # Sync schema to database
npx prisma studio         # Visual database browser
```

---

