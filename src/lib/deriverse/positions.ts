// ─── Position Fetching ────────────────────────────────────────────────────────
// Fetches real open positions from Deriverse via the SDK.

import type { Position, MarginHealth } from '@/types';
import { getDeriverseEngine, setEngineSigner } from './client';

export async function fetchOpenPositions(
    walletAddress: string | null
): Promise<Position[]> {
    if (!walletAddress) return [];

    try {
        const engine = await getDeriverseEngine();
        if (!engine) return [];

        const signerOk = await setEngineSigner(walletAddress);
        if (!signerOk) return [];

        const positions: Position[] = [];

        // getClientData() returns which instruments the user has perp activity on
        const clientData = await engine.getClientData();
        if (!clientData || !clientData.perp) return [];

        // Iterate over instrument IDs the client has perp positions in
        for (const [instrId, perpClientData] of clientData.perp) {
            try {
                // Need both instrId and the clientId from the perp data
                const perpInfo = await engine.getClientPerpOrdersInfo({
                    instrId,
                    clientId: perpClientData.clientId,
                });

                if (!perpInfo || perpInfo.perps === 0) continue; // No active position

                const instrument = engine.instruments.get(instrId);
                if (!instrument) continue;

                const symbol = `Token${instrument.header.assetTokenId}/Token${instrument.header.crncyTokenId}`;
                const side = perpInfo.perps > 0 ? 'LONG' : 'SHORT';
                const size = Math.abs(perpInfo.perps);
                const cost = Math.abs(perpInfo.cost);
                const entryPrice = size > 0 ? cost / size : 0;

                // Use the instrument's last perp price as mark price
                const markPrice = instrument.header.perpLastPx || entryPrice;
                const notional = size * markPrice;

                // Unrealized PnL
                const unrealizedPnl = side === 'LONG'
                    ? (markPrice - entryPrice) * size
                    : (entryPrice - markPrice) * size;
                const unrealizedPnlPercent = cost > 0
                    ? (unrealizedPnl / cost) * 100
                    : 0;

                // Leverage from mask (first byte)
                const leverage = (perpInfo.mask & 0xFF) || 1;

                // Margin = notional / leverage
                const margin = notional / leverage;

                // Liquidation price estimate
                const liquidationPrice = side === 'LONG'
                    ? entryPrice * (1 - 1 / leverage)
                    : entryPrice * (1 + 1 / leverage);

                positions.push({
                    id: `perp-pos-${instrId}`,
                    symbol,
                    side: side as 'LONG' | 'SHORT',
                    marketType: 'PERP',
                    entryPrice: Number(entryPrice.toFixed(6)),
                    markPrice: Number(markPrice.toFixed(6)),
                    size: Number(size.toFixed(6)),
                    notional: Number(notional.toFixed(2)),
                    unrealizedPnl: Number(unrealizedPnl.toFixed(2)),
                    unrealizedPnlPercent: Number(unrealizedPnlPercent.toFixed(2)),
                    margin: Number(margin.toFixed(2)),
                    leverage,
                    liquidationPrice: Number(liquidationPrice.toFixed(6)),
                    openedAt: new Date(),
                });
            } catch (instrErr) {
                console.debug(`Error fetching position for instrument ${instrId}:`, instrErr);
            }
        }

        console.log(`✅ Fetched ${positions.length} open positions from Deriverse`);
        return positions;

    } catch (error) {
        console.warn('Failed to fetch real positions:', error);
        return [];
    }
}

export function getMarginHealth(
    positions: Position[],
    availableMargin: number
): MarginHealth {
    const usedMargin = positions.reduce((s, p) => s + p.margin, 0);
    const maintenanceMargin = usedMargin * 0.5;
    const total = availableMargin + usedMargin;
    const ratio = total > 0 ? availableMargin / total : 1;

    let status: MarginHealth['status'] = 'healthy';
    if (ratio < 0.1) status = 'liquidation';
    else if (ratio < 0.25) status = 'danger';
    else if (ratio < 0.5) status = 'warning';

    return {
        ratio: Number(ratio.toFixed(4)),
        status,
        availableMargin: Number(availableMargin.toFixed(2)),
        usedMargin: Number(usedMargin.toFixed(2)),
        maintenanceMargin: Number(maintenanceMargin.toFixed(2)),
    };
}
