import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
    prismaCreatedAt: number | undefined
}

// Max age for cached client in dev (5 minutes) to prevent stale WebSocket connections
const MAX_CLIENT_AGE_MS = 5 * 60 * 1000

function createPrismaClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL!
    const adapter = new PrismaNeon({ connectionString })
    return new PrismaClient({ adapter })
}

function getPrismaClient(): PrismaClient {
    const now = Date.now()

    // In development, recycle the client if it's too old (prevents stale WebSocket)
    if (process.env.NODE_ENV !== 'production') {
        if (globalForPrisma.prisma && globalForPrisma.prismaCreatedAt) {
            const age = now - globalForPrisma.prismaCreatedAt
            if (age > MAX_CLIENT_AGE_MS) {
                globalForPrisma.prisma.$disconnect().catch(() => { })
                globalForPrisma.prisma = undefined
                globalForPrisma.prismaCreatedAt = undefined
            }
        }
    }

    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = createPrismaClient()
        globalForPrisma.prismaCreatedAt = now
    }

    return globalForPrisma.prisma
}

export const prisma = getPrismaClient()

export default prisma

