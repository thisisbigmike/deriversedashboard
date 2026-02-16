// ─── Journal API ──────────────────────────────────────────────────────────────
// CRUD for journal entries. Works with both logged-in users and wallet-only users.
//
// GET    /api/journal?owner=<userId|walletAddress>         → list entries
// POST   /api/journal  { owner, tradeId, note, tags, sentiment, userId?, walletAddress? }
// PUT    /api/journal  { id, note, tags, sentiment }       → update entry
// DELETE /api/journal?id=<entryId>                         → delete entry

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// ─── GET: Fetch all journal entries for an owner ─────────────────────────────

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get('owner');
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
            whereClause = { userId: userId };
        } else if (walletAddress) {
            whereClause = {
                OR: [
                    { walletAddress: walletAddress },
                    { ownerIdentifier: walletAddress }
                ]
            };
        } else {
            whereClause = { ownerIdentifier: owner };
        }

        const entries = await prisma.journalEntry.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ success: true, data: entries });
    } catch (error) {
        console.error('Journal GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 });
    }
}

// ─── POST: Create or upsert a journal entry ─────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { owner, tradeId, note, tags, sentiment, userId, walletAddress } = body;

        if ((!owner && !userId && !walletAddress) || !tradeId) {
            return NextResponse.json(
                { error: 'Missing required fields: owner/userId/walletAddress, tradeId' },
                { status: 400 }
            );
        }

        const primaryOwner = owner || walletAddress || userId;

        // Upsert: if an entry already exists for this owner+trade, update it
        const entry = await prisma.journalEntry.upsert({
            where: {
                ownerIdentifier_tradeId: {
                    ownerIdentifier: primaryOwner,
                    tradeId: tradeId,
                },
            },
            update: {
                note: note || '',
                tags: tags || [],
                sentiment: sentiment || 'neutral',
            },
            create: {
                ownerIdentifier: owner,
                userId: userId || null,
                walletAddress: walletAddress || null,
                tradeId,
                note: note || '',
                tags: tags || [],
                sentiment: sentiment || 'neutral',
            },
        });

        return NextResponse.json({ success: true, data: entry });
    } catch (error) {
        console.error('Journal POST error:', error);
        return NextResponse.json({ error: 'Failed to save journal entry' }, { status: 500 });
    }
}

// ─── PUT: Update an existing entry by ID ─────────────────────────────────────

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, note, tags, sentiment } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing "id" field' }, { status: 400 });
        }

        const entry = await prisma.journalEntry.update({
            where: { id },
            data: {
                ...(note !== undefined && { note }),
                ...(tags !== undefined && { tags }),
                ...(sentiment !== undefined && { sentiment }),
            },
        });

        return NextResponse.json({ success: true, data: entry });
    } catch (error) {
        console.error('Journal PUT error:', error);
        return NextResponse.json({ error: 'Failed to update journal entry' }, { status: 500 });
    }
}

// ─── DELETE: Remove an entry by ID ───────────────────────────────────────────

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Missing "id" query parameter' }, { status: 400 });
    }

    try {
        await prisma.journalEntry.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Journal DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete journal entry' }, { status: 500 });
    }
}
