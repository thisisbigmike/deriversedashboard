// ─── Trade History Fetching ───────────────────────────────────────────────────
// Attempts to fetch real trade/order data from the Deriverse program via the SDK.
// Falls back to empty array for connected wallets (no mock confusion).

import type { Trade } from '@/types';
import { generateTrades } from '@/lib/mockData';
import { getDeriverseEngine, setEngineSigner } from './client';

export async function fetchTradeHistory(
    walletAddress: string | null,
    days: number = 90
): Promise<Trade[]> {
    // No wallet → generate mock trades for demo
    if (!walletAddress) return generateTrades(days);

    try {
        const engine = await getDeriverseEngine();
        if (!engine) {
            console.warn('Engine not available — returning empty trade history');
            return [];
        }

        const signerOk = await setEngineSigner(walletAddress);
        if (!signerOk) {
            console.warn('Could not set signer — returning empty trade history');
            return [];
        }

        // First, retrieve the client data to get the clientId for each instrument
        const clientData = await engine.getClientData();
        if (!clientData) {
            console.warn('No client data found — wallet may not have a Deriverse account');
            return [];
        }

        const trades: Trade[] = [];

        // Iterate over instruments the client has perp activity on
        if (clientData.perp) {
            for (const [instrId, perpClientData] of clientData.perp) {
                try {
                    const instrument = engine.instruments.get(instrId);
                    if (!instrument) continue;

                    const symbolName = `Token${instrument.header.assetTokenId}/Token${instrument.header.crncyTokenId}`;

                    // Get perp orders info — needs both instrId and clientId
                    const perpInfo = await engine.getClientPerpOrdersInfo({
                        instrId,
                        clientId: perpClientData.clientId,
                    });

                    if (!perpInfo) continue;

                    // If user has realized PnL or paid fees, create a summary entry
                    if (perpInfo.result !== 0 || perpInfo.fees > 0) {
                        const side = perpInfo.perps >= 0 ? 'LONG' : 'SHORT';
                        const now = new Date();

                        trades.push({
                            id: `perp-${instrId}-summary`,
                            symbol: symbolName,
                            side: side as 'LONG' | 'SHORT',
                            marketType: 'PERP',
                            entryPrice: perpInfo.cost !== 0 && perpInfo.perps !== 0
                                ? Math.abs(perpInfo.cost / perpInfo.perps)
                                : 0,
                            exitPrice: 0,
                            size: Math.abs(perpInfo.perps),
                            notional: Math.abs(perpInfo.funds),
                            pnl: perpInfo.result,
                            pnlPercent: perpInfo.cost !== 0
                                ? (perpInfo.result / Math.abs(perpInfo.cost)) * 100
                                : 0,
                            entryTime: now,
                            exitTime: now,
                            duration: 0,
                            orderType: 'MARKET',
                            makerFee: -perpInfo.rebates,
                            takerFee: perpInfo.fees,
                            fundingFee: perpInfo.fundingFunds,
                            totalFees: perpInfo.fees - perpInfo.rebates + perpInfo.fundingFunds,
                        });
                    }

                    // Get individual open orders (needs order book info from perpInfo)
                    if (perpInfo.bidsCount > 0 || perpInfo.asksCount > 0) {
                        const perpOrders = await engine.getClientPerpOrders({
                            instrId,
                            bidsCount: perpInfo.bidsCount,
                            asksCount: perpInfo.asksCount,
                            bidsEntry: perpInfo.bidsEntry,
                            asksEntry: perpInfo.asksEntry,
                        });

                        if (perpOrders) {
                            for (const bid of perpOrders.bids) {
                                trades.push({
                                    id: `perp-bid-${instrId}-${bid.orderId}`,
                                    symbol: symbolName,
                                    side: 'LONG',
                                    marketType: 'PERP',
                                    entryPrice: bid.sum && bid.qty ? bid.sum / bid.qty : 0,
                                    exitPrice: 0,
                                    size: bid.qty,
                                    notional: bid.sum,
                                    pnl: 0,
                                    pnlPercent: 0,
                                    entryTime: new Date(bid.time * 1000),
                                    exitTime: new Date(bid.time * 1000),
                                    duration: 0,
                                    orderType: 'LIMIT',
                                    makerFee: 0,
                                    takerFee: 0,
                                    fundingFee: 0,
                                    totalFees: 0,
                                    tags: ['open-order'],
                                });
                            }

                            for (const ask of perpOrders.asks) {
                                trades.push({
                                    id: `perp-ask-${instrId}-${ask.orderId}`,
                                    symbol: symbolName,
                                    side: 'SHORT',
                                    marketType: 'PERP',
                                    entryPrice: ask.sum && ask.qty ? ask.sum / ask.qty : 0,
                                    exitPrice: 0,
                                    size: ask.qty,
                                    notional: ask.sum,
                                    pnl: 0,
                                    pnlPercent: 0,
                                    entryTime: new Date(ask.time * 1000),
                                    exitTime: new Date(ask.time * 1000),
                                    duration: 0,
                                    orderType: 'LIMIT',
                                    makerFee: 0,
                                    takerFee: 0,
                                    fundingFee: 0,
                                    totalFees: 0,
                                    tags: ['open-order'],
                                });
                            }
                        }
                    }
                } catch (instrErr) {
                    console.debug(`No perp data for instrument ${instrId}:`, instrErr);
                }
            }
        }

        console.log(`✅ Fetched ${trades.length} trade entries from Deriverse for ${walletAddress}`);
        return trades.sort((a, b) => b.entryTime.getTime() - a.entryTime.getTime());

    } catch (error) {
        console.warn('Failed to fetch real trade history:', error);
        return [];
    }
}
