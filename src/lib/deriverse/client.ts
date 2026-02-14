import { Connection, PublicKey } from '@solana/web3.js';
// @ts-ignore - types might be missing initially
import { DeriverseEngine } from '@deriverse/kit';

// Deriverse Devnet Configuration
const PROGRAM_ID = 'CDESjex4EDBKLwx9ZPzVbjiHEHatasb5fhSJZMzNfvw2';
const RPC_ENDPOINT = 'https://api.devnet.solana.com';

// Singleton instance
let engine: any = null;

export function getDeriverseEngine() {
    if (engine) return engine;

    try {
        const connection = new Connection(RPC_ENDPOINT, 'confirmed');
        const programId = new PublicKey(PROGRAM_ID);

        engine = new DeriverseEngine(connection, programId);
        console.log('Deriverse Engine initialized');
    } catch (error) {
        console.error('Failed to initialize Deriverse Engine:', error);
        // Return a mock or null if initialization fails to prevent app crash
        return null;
    }

    return engine;
}

export const connection = new Connection(RPC_ENDPOINT, 'confirmed');
export const programId = new PublicKey(PROGRAM_ID);
