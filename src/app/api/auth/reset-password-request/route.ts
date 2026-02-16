// ─── Password Reset Request API ──────────────────────────────────────────────
// Handles requests to initiate the password reset process.

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generatePasswordResetToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // 1. Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Even if user doesn't exist, we return 200 to prevent email enumeration attacks
        // But for development/debugging, console log might be useful
        if (!user) {
            console.log(`Password reset requested for non-existent email: ${email}`);
            return NextResponse.json({ success: true, message: 'If an account exists, email sent.' });
        }

        if (!user.password) {
            // User exists but has no password (e.g. usage via OAuth only)
            // Ideally we should email them saying "You use Google login"
            // For now, let's just ignore or maybe log it.
            console.log(`Password reset requested for OAuth user: ${email}`);
            return NextResponse.json({ success: true, message: 'If an account exists, email sent.' });
        }

        // 2. Generate token
        const resetToken = await generatePasswordResetToken(email);

        // 3. Send email
        await sendPasswordResetEmail(email, resetToken.token);

        return NextResponse.json({ success: true, message: 'Email sent' });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('Password reset request error:', err.message);
        console.error('Stack:', err.stack);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
