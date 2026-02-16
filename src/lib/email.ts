import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.APP_URL || "http://localhost:3000";

// Check for valid API key (Resend keys start with "re_")
const HAS_VALID_KEY = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith("re_");

// Only skip sending if we don't have a valid key
const SHOULD_LOG_ONLY = !HAS_VALID_KEY;

export async function sendVerificationEmail(email: string, token: string) {
    const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

    if (SHOULD_LOG_ONLY) {
        console.log("\n========== EMAIL (LOG MODE) ==========");
        console.log(`To: ${email}`);
        console.log(`Subject: Verify your email address`);
        console.log(`Verify URL: ${verifyUrl}`);
        console.log("=======================================\n");
        return { success: true };
    }

    try {
        const result = await resend.emails.send({
            from: "Deriverse <onboarding@resend.dev>",
            to: email,
            subject: "Verify your email address",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #8b5cf6;">Deriverse</h1>
                    </div>
                    <h2 style="color: #1f2937;">Verify your email address</h2>
                    <p style="color: #4b5563; font-size: 16px;">
                        Thanks for signing up! Please click the button below to verify your email address.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verifyUrl}" 
                           style="background: linear-gradient(to right, #8b5cf6, #06b6d4); 
                                  color: white; 
                                  padding: 14px 28px; 
                                  text-decoration: none; 
                                  border-radius: 8px;
                                  font-weight: bold;
                                  display: inline-block;">
                            Verify Email
                        </a>
                    </div>
                    <p style="color: #9ca3af; font-size: 14px;">
                        If you didn't create an account, you can safely ignore this email.
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
                        This link will expire in 24 hours.
                    </p>
                </div>
            `,
        });
        console.log("Email sent successfully:", result);
        return { success: true };
    } catch (error) {
        console.error("Failed to send verification email:", error);
        // In case of error, log the URL so user can still verify manually
        console.log(`\n[FALLBACK] Verification URL: ${verifyUrl}\n`);
        return { success: false, error };
    }
}

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${APP_URL}/reset-password?token=${token}`;

    if (SHOULD_LOG_ONLY) {
        console.log("\n========== EMAIL (LOG MODE) ==========");
        console.log(`To: ${email}`);
        console.log(`Subject: Reset your password`);
        console.log(`Reset URL: ${resetUrl}`);
        console.log("=======================================\n");
        return { success: true };
    }
    try {
        const result = await resend.emails.send({
            from: "Deriverse <onboarding@resend.dev>",
            to: email,
            subject: "Reset your password",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #8b5cf6;">Deriverse</h1>
                    </div>
                    <h2 style="color: #1f2937;">Reset your password</h2>
                    <p style="color: #4b5563; font-size: 16px;">
                        We received a request to reset your password. Click the button below to create a new password.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background: linear-gradient(to right, #8b5cf6, #06b6d4); 
                                  color: white; 
                                  padding: 14px 28px; 
                                  text-decoration: none; 
                                  border-radius: 8px;
                                  font-weight: bold;
                                  display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #9ca3af; font-size: 14px;">
                        If you didn't request a password reset, you can safely ignore this email.
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
                        This link will expire in 1 hour.
                    </p>
                </div>
            `,
        });
        console.log("Password reset email sent successfully:", result);
        return { success: true };
    } catch (error) {
        console.error("Failed to send password reset email:", error);
        // In case of error, log the URL so user can still reset manually
        console.log(`\n[FALLBACK] Reset URL: ${resetUrl}\n`);
        return { success: false, error };
    }
}

