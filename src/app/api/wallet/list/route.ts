// ─── List Linked Wallets API ────────────────────────────────────────────────
// Returns all wallets linked to the current user.

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const wallets = await prisma.linkedWallet.findMany({
            where: { userId: session.user.id },
            orderBy: { verifiedAt: 'desc' },
        });

        return NextResponse.json({ success: true, data: wallets });
    } catch (error) {
        console.error('List wallets error:', error);
        return NextResponse.json({ error: 'Failed to fetch linked wallets' }, { status: 500 });
    }
}
