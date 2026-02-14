import type { AccountInfo } from '@/types';
import { getDeriverseEngine, connection } from './client';
// @ts-ignore
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export async function fetchAccountInfo(
    walletAddress: string | null
): Promise<AccountInfo | null> {
    if (!walletAddress) return null;

    try {
        const engine = getDeriverseEngine();
        const pubKey = new PublicKey(walletAddress);

        // 1. Fetch Wallet Balance (SOL for now, usually USDC for Deriverse)
        const balanceLamports = await connection.getBalance(pubKey);
        const walletBalance = balanceLamports / LAMPORTS_PER_SOL;

        // 2. Fetch Protocol Balance (Deposited Collateral)
        // const clientData = await engine.getClientData(pubKey);
        // const deposited = clientData ? clientData.collateral : 0;

        const deposited = 0; // Default until SDK typings are ready

        const totalBalance = walletBalance + deposited;
        // In a real app, 'balance' often refers to total equity (wallet + deposited) or just wallet.
        // We'll treat 'balance' as wallet balance and 'totalDeposited' as protocol balance.

        return {
            walletAddress,
            balance: Number(walletBalance.toFixed(4)), // Show SOL balance for devnet verification
            availableMargin: Number(deposited.toFixed(2)), // Only deposited is usable for margin usually
            usedMargin: 0, // Calculated from positions
            marginUtilization: 0,
            feeTier: 'Standard',
            prepaymentBalance: 0,
            totalDeposited: Number(deposited.toFixed(2)),
            totalWithdrawn: 0,
        };

    } catch (error) {
        console.warn('Failed to fetch real account info:', error);
        return null;
    }
}
