// ─── Deriverse Fee Calculations ───────────────────────────────────────────────
//
// Deriverse fee structure:
//   Taker fee:  0.10% (10 bps) of notional value
//   Maker fee:  0.02% ( 2 bps) of notional value
//   Funding:    8-hour funding rate × position notional
//
// Notional = size × price
// ──────────────────────────────────────────────────────────────────────────────

/** Taker fee rate: 5 basis points (0.05%) - Example from docs (Governance parameter) */
export const TAKER_FEE_RATE = 0.0005;

/** Maker rebate ratio: 12.5% of base fee (hardcoded at launch) */
export const MAKER_REBATE_RATIO = 0.125;

/** Maker fee rate: Negative value (rebate) */
export const MAKER_FEE_RATE = -1 * (TAKER_FEE_RATE * MAKER_REBATE_RATIO);

/** Default 8-hour funding rate (annualized ~2.6%, realistic for perps) */
export const DEFAULT_FUNDING_RATE = 0.0001;

/**
 * Calculate notional value of a trade
 * notional = size × price
 */
export function calculateNotional(size: number, price: number): number {
    return size * price;
}

/**
 * Calculate taker fee: 0.10% of notional
 * Applies to MARKET and STOP orders
 */
export function calculateTakerFee(size: number, price: number): number {
    const notional = calculateNotional(size, price);
    return Number((notional * TAKER_FEE_RATE).toFixed(6));
}

/**
 * Calculate maker fee: 0.02% of notional
 * Applies to LIMIT orders (providing liquidity)
 */
export function calculateMakerFee(size: number, price: number): number {
    const notional = calculateNotional(size, price);
    return Number((notional * MAKER_FEE_RATE).toFixed(6));
}

/**
 * Calculate funding fee for a position held across a funding interval
 * funding = fundingRate × notional × intervals
 *
 * @param size        Position size
 * @param price       Entry or mark price
 * @param fundingRate Per-interval funding rate (default: 0.01%)
 * @param intervals   Number of 8-hour intervals held (default: 1)
 */
export function calculateFundingFee(
    size: number,
    price: number,
    fundingRate: number = DEFAULT_FUNDING_RATE,
    intervals: number = 1
): number {
    const notional = calculateNotional(size, price);
    return Number((notional * fundingRate * intervals).toFixed(6));
}

/**
 * Calculate total fees for a trade based on order type
 *
 * - MARKET / STOP orders → taker fee + funding
 * - LIMIT orders → maker fee + funding
 */
export function calculateTotalFees(
    size: number,
    price: number,
    orderType: 'MARKET' | 'LIMIT' | 'STOP',
    durationMinutes: number = 0,
    fundingRate: number = DEFAULT_FUNDING_RATE
): { makerFee: number; takerFee: number; fundingFee: number; totalFees: number } {
    const isTaker = orderType === 'MARKET' || orderType === 'STOP';
    const makerFee = isTaker ? 0 : calculateMakerFee(size, price);
    const takerFee = isTaker ? calculateTakerFee(size, price) : 0;

    // Funding intervals: each 8 hours (480 minutes)
    const fundingIntervals = Math.floor(durationMinutes / 480);
    const fundingFee = fundingIntervals > 0
        ? calculateFundingFee(size, price, fundingRate, fundingIntervals)
        : 0;

    const totalFees = Number((makerFee + takerFee + fundingFee).toFixed(6));

    return { makerFee, takerFee, fundingFee, totalFees };
}
