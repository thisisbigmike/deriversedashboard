// ─── Link Wallet API ────────────────────────────────────────────────────────
// Links a verified Solana wallet to the current user.
// Requires: { walletAddress, signature (base64), message }

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/db';
import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { walletAddress, signature, message, label } = body;

        if (!walletAddress || !signature || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Verify the signature
        try {
            const messageBytes = new TextEncoder().encode(message);
            const signatureBytes = Uint8Array.from(Buffer.from(signature, 'base64'));
            const publicKeyBytes = new PublicKey(walletAddress).toBytes();

            const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);

            if (!isValid) {
                return NextResponse.json({ error: 'Invalid signature verification failed' }, { status: 400 });
            }
        } catch (err) {
            console.error('Signature check error:', err);
            return NextResponse.json({ error: 'Invalid signature format' }, { status: 400 });
        }

        // 2. Check current link status
        const existingLink = await prisma.linkedWallet.findUnique({
            where: { walletAddress },
            include: { user: true }
        });

        if (existingLink) {
            if (existingLink.userId === session.user.id) {
                return NextResponse.json({ message: 'Wallet already linked correctly', success: true });
            } else {
                return NextResponse.json({ error: 'Wallet is already linked to another account' }, { status: 409 });
            }
        }

        // 3. Link the wallet
        const newLink = await prisma.linkedWallet.create({
            data: {
                userId: session.user.id,
                walletAddress,
                label: label || 'Wallet',
            }
        });

        // 4. Migrate orphan data (optional but recommended)
        // If there were trades/journals created by this wallet BEFORE linking,
        // we can now associate them with the user account.

        // Update trades
        await prisma.tradeRecord.updateMany({
            where: { ownerIdentifier: walletAddress, userId: null },
            data: { userId: session.user.id }
        });

        // Update journals
        await prisma.journalEntry.updateMany({
            where: { ownerIdentifier: walletAddress, userId: null },
            data: { userId: session.user.id }
        });

        return NextResponse.json({ success: true, data: newLink });

    } catch (error) {
        console.error('Wallet link error:', error);
        return NextResponse.json({ error: 'Internal server error during wallet linking' }, { status: 500 });
    }
}
