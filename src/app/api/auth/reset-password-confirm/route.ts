// ─── Password Reset Confirm API ──────────────────────────────────────────────
// Handles verifying the reset token and updating the user's password.

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyPasswordResetToken } from '@/lib/tokens';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: 'Token and new password required' }, { status: 400 });
        }

        // 1. Verify token
        const resetToken = await verifyPasswordResetToken(token);

        if (!resetToken || !resetToken.success) {
            return NextResponse.json({ error: resetToken?.error || 'Invalid or expired token' }, { status: 400 });
        }

        const email = resetToken.email;

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Update user password
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        // 4. Delete token
        await prisma.passwordResetToken.delete({
            where: { token },
        });

        return NextResponse.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password reset confirm error:', error);
        return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }
}
