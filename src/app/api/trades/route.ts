// ─── Trades API ──────────────────────────────────────────────────────────────
// Persists trade history to the cloud database so it's accessible on any device.
//
// GET  /api/trades?owner=<userId|walletAddress>      → list all trades
// POST /api/trades  { owner, trades[], userId?, walletAddress? }  → bulk upsert

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// ─── GET: Fetch all trades for an owner ──────────────────────────────────────

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get('owner'); // Legacy/Fallback
    const userId = searchParams.get('userId');
    const walletAddress = searchParams.get('walletAddress');

    if (!owner && !userId && !walletAddress) {
        return NextResponse.json(
            { error: 'Missing identity parameter (userId, walletAddress, or owner)' },
            { status: 400 }
        );
    }

    try {
        let whereClause: any = {};

        if (userId) {
            // If we have a userId, fetch ALL trades belonging to this user
            // (including those from linked wallets)
            whereClause = { userId: userId };
        } else if (walletAddress) {
            // If only wallet, fetch by wallet address
            whereClause = {
                OR: [
                    { walletAddress: walletAddress },
                    { ownerIdentifier: walletAddress }
                ]
            };
        } else {
            whereClause = { ownerIdentifier: owner };
        }

        const trades = await prisma.tradeRecord.findMany({
            where: whereClause,
            orderBy: { entryTime: 'desc' },
        });

        return NextResponse.json({ success: true, data: trades });
    } catch (error) {
        console.error('Trades GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
    }
}

// ─── POST: Bulk upsert trades ────────────────────────────────────────────────
// Accepts an array of trades and upserts each one by ownerIdentifier + tradeId.
// This is idempotent — calling it twice with the same data won't duplicate.

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { owner, trades, userId, walletAddress } = body;

        // We need at least one identifier and trades array
        if ((!owner && !userId && !walletAddress) || !trades || !Array.isArray(trades)) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Default owner if not provided but we have other IDs
        const primaryOwner = owner || walletAddress || userId;

        // Upsert each trade (update if exists, create if new)
        const results = await Promise.allSettled(
            trades.map((trade: any) =>
                prisma.tradeRecord.upsert({
                    where: {
                        ownerIdentifier_tradeId: {
                            ownerIdentifier: primaryOwner, // Keep using ownerIdentifier as unique key part
                            tradeId: trade.id,
                        },
                    },
                    update: {
                        symbol: trade.symbol,
                        side: trade.side,
                        marketType: trade.marketType,
                        orderType: trade.orderType,
                        entryPrice: trade.entryPrice,
                        exitPrice: trade.exitPrice,
                        size: trade.size,
                        notional: trade.notional,
                        pnl: trade.pnl,
                        pnlPercent: trade.pnlPercent,
                        entryTime: new Date(trade.entryTime),
                        exitTime: new Date(trade.exitTime),
                        duration: trade.duration,
                        makerFee: trade.makerFee || 0,
                        takerFee: trade.takerFee || 0,
                        fundingFee: trade.fundingFee || 0,
                        totalFees: trade.totalFees || 0,
                        notes: trade.notes || null,
                        tags: trade.tags || [],
                    },
                    create: {
                        ownerIdentifier: owner,
                        userId: userId || null,
                        walletAddress: walletAddress || null,
                        tradeId: trade.id,
                        symbol: trade.symbol,
                        side: trade.side,
                        marketType: trade.marketType,
                        orderType: trade.orderType,
                        entryPrice: trade.entryPrice,
                        exitPrice: trade.exitPrice,
                        size: trade.size,
                        notional: trade.notional,
                        pnl: trade.pnl,
                        pnlPercent: trade.pnlPercent,
                        entryTime: new Date(trade.entryTime),
                        exitTime: new Date(trade.exitTime),
                        duration: trade.duration,
                        makerFee: trade.makerFee || 0,
                        takerFee: trade.takerFee || 0,
                        fundingFee: trade.fundingFee || 0,
                        totalFees: trade.totalFees || 0,
                        notes: trade.notes || null,
                        tags: trade.tags || [],
                    },
                })
            )
        );

        const saved = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.filter((r) => r.status === 'rejected').length;

        return NextResponse.json({
            success: true,
            saved,
            failed,
            total: trades.length,
        });
    } catch (error) {
        console.error('Trades POST error:', error);
        return NextResponse.json({ error: 'Failed to save trades' }, { status: 500 });
    }
}
