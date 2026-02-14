import type { Trade } from '@/types';
import { generateTrades } from '@/lib/mockData';
import { getDeriverseEngine } from './client';
// @ts-ignore
import { PublicKey } from '@solana/web3.js';

export async function fetchTradeHistory(
    walletAddress: string | null,
    days: number = 90
): Promise<Trade[]> {
    if (!walletAddress) return generateTrades(days);

    try {
        const engine = getDeriverseEngine();
        if (!engine) throw new Error('Engine not initialized');

        // Example: Fetch spot orders (approx for trades)
        // In a real scenario, you might need to iterate over all markets or use an indexer
        // For now, we try to fetch from a known market or just use the client info
        // simpler for V1: fetch client history if available

        // This is a placeholder for the actual SDK method signature
        // const history = await engine.getClientHistory(new PublicKey(walletAddress));

        // Since V1 exact history method might differ, we'll wrap this safely
        // If SDK fails or returns empty, fallback to mock for now to keep UI working
        console.log('Fetching real trades for:', walletAddress);

        // TODO: Implement actual SDK call when types are confirmed
        // const trades = history.map(t => mapSdkTradeToAppTrade(t));
        // if (trades.length > 0) return trades;

        return generateTrades(days);
    } catch (error) {
        console.warn('Failed to fetch real trade history, using mock:', error);
        return generateTrades(days);
    }
}
