import crypto from "crypto";
import prisma from "@/lib/db";

// Generate a cryptographically secure token
function generateToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

// Create verification token for email verification
export async function generateVerificationToken(email: string) {
    const token = generateToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Delete any existing tokens for this email
    await prisma.verificationToken.deleteMany({
        where: { identifier: email },
    });

    // Create new token
    const verificationToken = await prisma.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires,
        },
    });

    return verificationToken;
}

// Verify email verification token
export async function verifyEmailToken(token: string) {
    const verificationToken = await prisma.verificationToken.findUnique({
        where: { token },
    });

    if (!verificationToken) {
        return { success: false, error: "Invalid token" };
    }

    if (verificationToken.expires < new Date()) {
        // Delete expired token
        await prisma.verificationToken.delete({
            where: { token },
        });
        return { success: false, error: "Token has expired" };
    }

    // Mark user as verified
    await prisma.user.update({
        where: { email: verificationToken.identifier },
        data: { emailVerified: new Date() },
    });

    // Delete used token
    await prisma.verificationToken.delete({
        where: { token },
    });

    return { success: true, email: verificationToken.identifier };
}

// Generate password reset token
export async function generatePasswordResetToken(email: string) {
    const token = generateToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
        where: { email },
    });

    // Create new token
    const resetToken = await prisma.passwordResetToken.create({
        data: {
            email,
            token,
            expires,
        },
    });

    return resetToken;
}

// Verify password reset token
export async function verifyPasswordResetToken(token: string) {
    const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
    });

    if (!resetToken) {
        return { success: false, error: "Invalid token" };
    }

    if (resetToken.expires < new Date()) {
        // Delete expired token
        await prisma.passwordResetToken.delete({
            where: { token },
        });
        return { success: false, error: "Token has expired" };
    }

    return { success: true, email: resetToken.email };
}

// Delete password reset token after use
export async function deletePasswordResetToken(token: string) {
    await prisma.passwordResetToken.delete({
        where: { token },
    });
}
