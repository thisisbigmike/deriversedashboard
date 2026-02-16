// ─── Solscan API Integration ──────────────────────────────────────────────────
// Fetches indexed transaction history from Solscan's Pro API v2.
// This supplements the on-chain SDK data with parsed, human-readable
// transaction history that includes past (closed) trades.
//
// Free tier: 10M computing units/month, 1K requests/min
// Docs: https://pro-api.solscan.io/pro-api-docs/v2.0

const SOLSCAN_API_BASE = 'https://pro-api.solscan.io/v2.0';

function getSolscanHeaders(): HeadersInit {
    const apiKey = process.env.SOLSCAN_API_KEY || '';
    return {
        'accept': 'application/json',
        'token': apiKey,
    };
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SolscanTransaction {
    txHash: string;
    blockTime: number;
    status: string;
    fee: number;
    signer: string[];
    parsedInstruction: {
        programId: string;
        type: string;
        data?: Record<string, unknown>;
    }[];
}

export interface SolscanDefiActivity {
    blockId: number;
    transId: string;
    blockTime: number;
    activityType: string; // e.g. "ACTIVITY_AGG_TOKEN_SWAP", "ACTIVITY_TOKEN_ADD_LIQ"
    fromAddress: string;
    toAddress: string;
    platform: string;
    sources: string[];
    tokenAddress?: string;
    tokenDecimals?: number;
    amount?: number;
    routers?: {
        token1: string;
        token1Decimals: number;
        amount1: number;
        token2: string;
        token2Decimals: number;
        amount2: number;
    }[];
}

export interface SolscanTransfer {
    transId: string;
    blockTime: number;
    fromAddress: string;
    toAddress: string;
    tokenAddress: string;
    tokenDecimals: number;
    amount: number;
    flow: 'in' | 'out';
}

// ─── Account Transactions ────────────────────────────────────────────────────

/**
 * Fetch recent transactions for a wallet address.
 * Returns parsed transaction data from Solscan's index.
 */
export async function fetchSolscanTransactions(
    walletAddress: string,
    limit: number = 40
): Promise<SolscanTransaction[]> {
    try {
        const url = `${SOLSCAN_API_BASE}/account/transactions?address=${walletAddress}&page_size=${limit}`;
        const res = await fetch(url, { headers: getSolscanHeaders() });

        if (!res.ok) {
            console.warn(`Solscan transactions API returned ${res.status}`);
            return [];
        }

        const json = await res.json();
        if (!json.success || !json.data) return [];

        return json.data as SolscanTransaction[];
    } catch (error) {
        console.warn('Failed to fetch Solscan transactions:', error);
        return [];
    }
}

// ─── DeFi Activities ─────────────────────────────────────────────────────────

/**
 * Fetch DeFi-specific activities (swaps, liquidity, trades) for a wallet.
 * This is the most useful endpoint for a trading dashboard — it returns
 * parsed swap/trade activities with token amounts and platforms.
 */
export async function fetchSolscanDefiActivities(
    walletAddress: string,
    limit: number = 40
): Promise<SolscanDefiActivity[]> {
    try {
        const url = `${SOLSCAN_API_BASE}/account/defi/activities?address=${walletAddress}&page_size=${limit}`;
        const res = await fetch(url, { headers: getSolscanHeaders() });

        if (!res.ok) {
            console.warn(`Solscan DeFi activities API returned ${res.status}`);
            return [];
        }

        const json = await res.json();
        if (!json.success || !json.data) return [];

        return json.data as SolscanDefiActivity[];
    } catch (error) {
        console.warn('Failed to fetch Solscan DeFi activities:', error);
        return [];
    }
}

// ─── Token Transfers ─────────────────────────────────────────────────────────

/**
 * Fetch token transfer history for a wallet (deposits/withdrawals).
 */
export async function fetchSolscanTransfers(
    walletAddress: string,
    limit: number = 40
): Promise<SolscanTransfer[]> {
    try {
        const url = `${SOLSCAN_API_BASE}/account/transfer?address=${walletAddress}&page_size=${limit}`;
        const res = await fetch(url, { headers: getSolscanHeaders() });

        if (!res.ok) {
            console.warn(`Solscan transfers API returned ${res.status}`);
            return [];
        }

        const json = await res.json();
        if (!json.success || !json.data) return [];

        return json.data as SolscanTransfer[];
    } catch (error) {
        console.warn('Failed to fetch Solscan transfers:', error);
        return [];
    }
}

// ─── Deriverse-Filtered Activities ───────────────────────────────────────────

const DERIVERSE_PROGRAM_ID =
    process.env.NEXT_PUBLIC_DERIVERSE_PROGRAM_ID || 'CDESjex4EDBKLwx9ZPzVbjiHEHatasb5fhSJZMzNfvw2';

/**
 * Fetch transactions that specifically interacted with the Deriverse program.
 * Filters the general transaction list to only include Deriverse activity.
 */
export async function fetchDeriverseTransactions(
    walletAddress: string,
    limit: number = 40
): Promise<SolscanTransaction[]> {
    const allTxns = await fetchSolscanTransactions(walletAddress, limit);

    // Filter to only transactions that include the Deriverse program
    return allTxns.filter(tx =>
        tx.parsedInstruction?.some(ix => ix.programId === DERIVERSE_PROGRAM_ID)
    );
}
