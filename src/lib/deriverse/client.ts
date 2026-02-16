// ─── Deriverse Engine Client ─────────────────────────────────────────────────
// Creates a singleton Engine instance from @deriverse/kit.
// The SDK uses @solana/kit (v2) internally, but we also keep a legacy
// @solana/web3.js Connection for balance queries until full migration.

import { Connection, PublicKey } from '@solana/web3.js';
import { Engine, PROGRAM_ID as DEFAULT_PROGRAM_ID } from '@deriverse/kit';

// ─── Environment-driven configuration ────────────────────────────────────────

const RPC_ENDPOINT =
    process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com';

const PROGRAM_ID =
    process.env.NEXT_PUBLIC_DERIVERSE_PROGRAM_ID || 'CDESjex4EDBKLwx9ZPzVbjiHEHatasb5fhSJZMzNfvw2';

// ─── Legacy web3.js helpers (for SOL balance, etc.) ──────────────────────────

export const connection = new Connection(RPC_ENDPOINT, 'confirmed');

// Robust initialization of programId to prevent build failures ("Non-base58 character")
let pId: PublicKey;
try {
    pId = new PublicKey(PROGRAM_ID);
} catch (err) {
    console.warn(`Invalid NEXT_PUBLIC_DERIVERSE_PROGRAM_ID ("${PROGRAM_ID}"), falling back to default.`);
    pId = new PublicKey('CDESjex4EDBKLwx9ZPzVbjiHEHatasb5fhSJZMzNfvw2');
}
export const programId = pId;

// ─── Deriverse Engine (singleton) ────────────────────────────────────────────
// The Engine class from @deriverse/kit expects an @solana/kit `Rpc` object,
// NOT a @solana/web3.js `Connection`.
// Due to potential version mismatches between the app's @solana/kit and
// the SDK's bundled copy, we dynamically import createSolanaRpc from the
// SDK's own transitive dep, or use `any` casts for type safety.

let engine: Engine | null = null;
let engineInitPromise: Promise<boolean> | null = null;

/**
 * Returns a fully-initialized Deriverse Engine instance.
 * The first call triggers `engine.initialize()` which fetches root state,
 * tokens, instruments, etc. from the chain. Subsequent calls return the
 * cached instance.
 */
export async function getDeriverseEngine(): Promise<Engine | null> {
    if (engine) return engine;

    try {
        // Dynamically import createSolanaRpc to avoid type brand conflicts
        // between the app's @solana/kit and the SDK's bundled version.
        const { createSolanaRpc } = await import('@solana/kit');
        const rpc = createSolanaRpc(RPC_ENDPOINT);

        const e = new Engine(rpc as any, {
            programId: PROGRAM_ID as any,
            version: 1,
            commitment: 'confirmed' as any,
            uiNumbers: true,
        });

        // Initialize fetches root state, tokens, and instruments from chain.
        // Cache the promise so concurrent callers don't double-init.
        if (!engineInitPromise) {
            engineInitPromise = e.initialize();
        }
        const ok = await engineInitPromise;

        if (!ok) {
            console.warn('Deriverse Engine initialized but returned false — program may not be deployed on this cluster.');
            engineInitPromise = null;
            return null;
        }

        engine = e;
        console.log(
            `✅ Deriverse Engine initialized (program: ${PROGRAM_ID}, rpc: ${RPC_ENDPOINT})`
        );
        return engine;
    } catch (error) {
        console.error('Failed to initialize Deriverse Engine:', error);
        engineInitPromise = null;
        return null;
    }
}

/**
 * Set the signer (connected wallet) on the engine so that
 * client-specific queries like getClientData() work.
 */
export async function setEngineSigner(walletAddress: string): Promise<boolean> {
    try {
        const e = await getDeriverseEngine();
        if (!e) return false;

        await e.setSigner(walletAddress as any);
        console.log(`✅ Engine signer set to ${walletAddress}`);
        return true;
    } catch (error) {
        console.warn('Failed to set engine signer:', error);
        return false;
    }
}
