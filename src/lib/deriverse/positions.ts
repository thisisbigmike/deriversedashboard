import type { Position, MarginHealth } from '@/types';
import { getDeriverseEngine } from './client';
// @ts-ignore
import { PublicKey } from '@solana/web3.js';

export async function fetchOpenPositions(
    walletAddress: string | null
): Promise<Position[]> {
    if (!walletAddress) return [];

    try {
        const engine = getDeriverseEngine();
        if (!engine) return [];

        // Check if engine is ready
        // v1 SDK usually exposes client positions via `clientData`
        // const clientData = await engine.getClientData(new PublicKey(walletAddress));

        // if (clientData && clientData.positions) {
        //     return clientData.positions.map(p => mapSdkPositionToAppPosition(p));
        // }

        console.log('Fetching real positions for:', walletAddress);
        return [];

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
