// ─── Solscan API Proxy ───────────────────────────────────────────────────────
// Proxies Solscan requests through the server to keep the API key private.
// GET /api/solscan?address=WALLET&type=transactions|defi|transfers|deriverse

import { NextRequest, NextResponse } from 'next/server';
import {
    fetchSolscanTransactions,
    fetchSolscanDefiActivities,
    fetchSolscanTransfers,
    fetchDeriverseTransactions,
} from '@/lib/solscan';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    const type = searchParams.get('type') || 'deriverse';
    const limit = parseInt(searchParams.get('limit') || '40', 10);

    if (!address) {
        return NextResponse.json(
            { error: 'Missing "address" query parameter' },
            { status: 400 }
        );
    }

    try {
        let data;

        switch (type) {
            case 'transactions':
                data = await fetchSolscanTransactions(address, limit);
                break;
            case 'defi':
                data = await fetchSolscanDefiActivities(address, limit);
                break;
            case 'transfers':
                data = await fetchSolscanTransfers(address, limit);
                break;
            case 'deriverse':
            default:
                data = await fetchDeriverseTransactions(address, limit);
                break;
        }

        return NextResponse.json({
            success: true,
            data,
            count: data.length,
            type,
        });
    } catch (error) {
        console.error('Solscan proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch Solscan data' },
            { status: 500 }
        );
    }
}
