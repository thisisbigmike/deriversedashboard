
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

// Copy of logic from src/lib/tokens.ts but simplified
async function generateLink() {
    const users = await prisma.user.findMany();

    if (users.length === 0) {
        console.log('No users found.');
        return;
    }

    console.log('Generating reset links for users:');

    for (const user of users) {
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Delete existing
        await prisma.passwordResetToken.deleteMany({ where: { email: user.email } });

        // Create new
        await prisma.passwordResetToken.create({
            data: {
                email: user.email,
                token,
                expires
            }
        });

        const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
        console.log(`\nEmail: ${user.email}`);
        console.log(`Reset Link: ${resetUrl}`);
    }
}

generateLink()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
