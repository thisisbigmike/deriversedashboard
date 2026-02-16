// ─── Account Data Fetching ────────────────────────────────────────────────────
// Fetches the connected wallet's on-chain account data from Deriverse.

import type { AccountInfo } from '@/types';
import { getDeriverseEngine, setEngineSigner, connection } from './client';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export async function fetchAccountInfo(
    walletAddress: string | null
): Promise<AccountInfo | null> {
    if (!walletAddress) return null;

    try {
        const pubKey = new PublicKey(walletAddress);

        // 1. Fetch SOL wallet balance (always works, even without Deriverse account)
        const balanceLamports = await connection.getBalance(pubKey);
        const walletBalance = balanceLamports / LAMPORTS_PER_SOL;

        // 2. Try to fetch Deriverse protocol data via SDK
        let deposited = 0;
        let feeTier = 'Standard';

        try {
            const engine = await getDeriverseEngine();
            if (engine) {
                const signerOk = await setEngineSigner(walletAddress);

                if (signerOk) {
                    const clientData = await engine.getClientData();

                    // clientData.tokens is a Map<tokenId, { tokenId, amount }>
                    // Sum all token balances as deposited collateral
                    if (clientData && clientData.tokens) {
                        for (const [, tokenData] of clientData.tokens) {
                            deposited += tokenData.amount;
                        }
                    }

                    // Points / trade counts for fee tier estimation
                    if (clientData) {
                        const totalTrades = (clientData.spotTrades || 0) + (clientData.perpTrades || 0);
                        if (totalTrades > 1000) feeTier = 'VIP';
                        else if (totalTrades > 100) feeTier = 'Advanced';
                    }
                }
            }
        } catch (sdkErr) {
            console.warn('SDK client data fetch failed (wallet may not have a Deriverse account):', sdkErr);
        }

        const totalBalance = walletBalance + deposited;
        const marginUtilization = totalBalance > 0 ? deposited / totalBalance : 0;

        return {
            walletAddress,
            balance: Number(walletBalance.toFixed(4)),
            availableMargin: Number(deposited.toFixed(2)),
            usedMargin: 0, // Calculated from positions in the UI
            marginUtilization: Number(marginUtilization.toFixed(4)),
            feeTier,
            prepaymentBalance: 0,
            totalDeposited: Number(deposited.toFixed(2)),
            totalWithdrawn: 0,
        };
    } catch (error) {
        console.warn('Failed to fetch account info:', error);
        return null;
    }
}
