// ─── Gemini AI Chat API Route ─────────────────────────────────────────────────
// Streams responses from Google Gemini, contextualized with user trading data.
// Includes exponential backoff retry for rate-limit (429) errors.

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are **Deri**, the AI trading assistant for the Deriverse Analytics Dashboard — a Solana-based perpetual futures trading platform.

## Your Role
You are a smart, friendly, and concise trading coach. You help users understand their trading performance, spot patterns, and improve their strategy.

## Your Capabilities
- Analyze trade history (entries, exits, PnL, win rate, duration, fees)
- Review journal entries and spot emotional trading patterns
- Provide portfolio insights (risk, allocation, performance)
- Explain trading concepts in simple terms
- Give actionable, data-driven suggestions

## Response Style
- Be concise but insightful — aim for 2-4 short paragraphs max
- Use emojis sparingly for friendliness (1-2 per response)
- When referencing data, cite specific numbers
- Format with markdown for clarity (bold key insights, use bullet points)
- If the user hasn't shared trading data, give general tips and encourage them to connect their wallet
- Never give financial advice — always say "this is for educational purposes"
- Be encouraging, not judgmental about losses

## Important Context
- The platform is Deriverse (Solana perpetual futures DEX)
- Fees: Taker fee 0.05%, Maker rebate -0.02%, Funding rate variable
- Supported pairs include SOL-PERP, BTC-PERP, ETH-PERP, and others
- Users trade using USDC as collateral`;

// ─── Retry helper with exponential backoff ────────────────────────────────────

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 2000; // 2 seconds

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendWithRetry(
    chat: ReturnType<ReturnType<GoogleGenerativeAI['getGenerativeModel']>['startChat']>,
    message: string
) {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const result = await chat.sendMessage(message);
            return result.response.text();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            const errorMsg = lastError.message.toLowerCase();

            // Only retry on rate-limit (429) or server errors (5xx)
            const isRetryable =
                errorMsg.includes('429') ||
                errorMsg.includes('too many requests') ||
                errorMsg.includes('quota') ||
                errorMsg.includes('resource exhausted') ||
                errorMsg.includes('500') ||
                errorMsg.includes('503') ||
                errorMsg.includes('overloaded');

            if (!isRetryable || attempt === MAX_RETRIES - 1) {
                throw lastError;
            }

            // Exponential backoff: 2s, 4s, 8s …
            const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
            console.warn(
                `Gemini API rate-limited (attempt ${attempt + 1}/${MAX_RETRIES}). Retrying in ${delay}ms…`
            );
            await sleep(delay);
        }
    }

    throw lastError ?? new Error('All retries exhausted');
}

// ─── Friendly error classifier ────────────────────────────────────────────────

function classifyError(error: Error): { message: string; status: number } {
    const msg = error.message.toLowerCase();

    if (msg.includes('429') || msg.includes('too many requests') || msg.includes('quota') || msg.includes('resource exhausted')) {
        return {
            message:
                'Deri is taking a quick breather! 🧘 The API rate limit has been reached. Please wait a minute and try again.',
            status: 429,
        };
    }
    if (msg.includes('api key') || msg.includes('permission') || msg.includes('403')) {
        return {
            message:
                'There seems to be an issue with the API key. Please check your GEMINI_API_KEY in .env.local.',
            status: 403,
        };
    }
    if (msg.includes('not found') || msg.includes('404')) {
        return {
            message: 'The AI model could not be found. The API may be temporarily unavailable.',
            status: 404,
        };
    }
    if (msg.includes('500') || msg.includes('503') || msg.includes('overloaded')) {
        return {
            message:
                'The AI service is experiencing high demand. Please try again in a moment. ⏳',
            status: 503,
        };
    }

    return {
        message: 'Something went wrong reaching the AI. Please try again.',
        status: 500,
    };
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        const { messages, tradingContext } = await request.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Gemini API key not configured. Add GEMINI_API_KEY to your .env.local file.' },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // Build context string from trading data
        let contextBlock = '';
        if (tradingContext) {
            const parts: string[] = [];

            if (tradingContext.stats) {
                const s = tradingContext.stats;
                parts.push(`## Portfolio Stats
- Total PnL: $${s.totalPnl?.toFixed(2)} (${s.totalPnlPercent?.toFixed(2)}%)
- Win Rate: ${(s.winRate * 100)?.toFixed(1)}%
- Total Trades: ${s.totalTrades}
- Winning: ${s.winningTrades} | Losing: ${s.losingTrades}
- Avg Win: $${s.avgWin?.toFixed(2)} | Avg Loss: $${s.avgLoss?.toFixed(2)}
- Largest Win: $${s.largestWin?.toFixed(2)} | Largest Loss: $${s.largestLoss?.toFixed(2)}
- Profit Factor: ${s.profitFactor?.toFixed(2)}
- Sharpe Ratio: ${s.sharpeRatio?.toFixed(2)}
- Max Drawdown: ${(s.maxDrawdown * 100)?.toFixed(2)}%
- Total Volume: $${s.totalVolume?.toFixed(2)}
- Total Fees: $${s.totalFees?.toFixed(2)}
- Long Ratio: ${(s.longRatio * 100)?.toFixed(1)}% | Short Ratio: ${(s.shortRatio * 100)?.toFixed(1)}%`);
            }

            if (tradingContext.recentTrades?.length) {
                const tradesStr = tradingContext.recentTrades
                    .slice(0, 10)
                    .map((t: { symbol: string; side: string; pnl: number; pnlPercent: number; entryPrice: number; exitPrice: number; duration: number; notes?: string }) =>
                        `  - ${t.symbol} ${t.side}: PnL $${t.pnl.toFixed(2)} (${t.pnlPercent.toFixed(2)}%), Entry $${t.entryPrice.toFixed(2)} → Exit $${t.exitPrice.toFixed(2)}, Duration ${t.duration}min${t.notes ? ` | Note: "${t.notes}"` : ''}`
                    )
                    .join('\n');
                parts.push(`## Recent Trades (last 10)\n${tradesStr}`);
            }

            if (tradingContext.journalEntries?.length) {
                const journalStr = tradingContext.journalEntries
                    .slice(0, 5)
                    .map((e: { note: string; sentiment: string; tags?: string[] }) =>
                        `  - [${e.sentiment}] "${e.note}"${e.tags?.length ? ` (tags: ${e.tags.join(', ')})` : ''}`
                    )
                    .join('\n');
                parts.push(`## Recent Journal Entries\n${journalStr}`);
            }

            if (parts.length > 0) {
                contextBlock = `\n\n---\n# User's Current Trading Data\n${parts.join('\n\n')}`;
            }
        }

        // Build conversation history for Gemini
        const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: `System instructions: ${SYSTEM_PROMPT}${contextBlock}\n\nAcknowledge you understand and are ready to help.` }] },
                { role: 'model', parts: [{ text: 'Understood! I\'m Deri, your Deriverse trading assistant. I\'m ready to help analyze your trades and provide insights. What would you like to know?' }] },
                ...history,
            ],
        });

        const lastMessage = messages[messages.length - 1].content;

        // Send with automatic retry on rate-limit errors
        const text = await sendWithRetry(chat, lastMessage);

        return NextResponse.json({ message: text });
    } catch (error) {
        console.error('Gemini API error:', error);

        const classified = classifyError(
            error instanceof Error ? error : new Error(String(error))
        );

        return NextResponse.json(
            { error: classified.message },
            { status: classified.status }
        );
    }
}
