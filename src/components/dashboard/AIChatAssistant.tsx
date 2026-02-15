'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    X,
    Send,
    Sparkles,
    Bot,
    User,
    Loader2,
    ChevronDown,
    Lightbulb,
    TrendingUp,
    BookOpen,
    Zap,
} from 'lucide-react';
import { useDashboardStore } from '@/store';
import { useMetrics } from '@/hooks/useMetrics';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isError?: boolean;
}

interface QuickPrompt {
    icon: React.ReactNode;
    label: string;
    prompt: string;
}

// ─── Quick Prompts ────────────────────────────────────────────────────────────

const QUICK_PROMPTS: QuickPrompt[] = [
    {
        icon: <TrendingUp className="w-3.5 h-3.5" />,
        label: 'Analyze my trades',
        prompt: 'Analyze my recent trading performance. What patterns do you see? What am I doing well and where can I improve?',
    },
    {
        icon: <BookOpen className="w-3.5 h-3.5" />,
        label: 'Journal insights',
        prompt: 'Review my journal entries and identify any emotional trading patterns or recurring themes.',
    },
    {
        icon: <Lightbulb className="w-3.5 h-3.5" />,
        label: 'Trading tips',
        prompt: 'Based on my portfolio stats, give me 3 specific tips to improve my trading strategy.',
    },
    {
        icon: <Zap className="w-3.5 h-3.5" />,
        label: 'Best trade',
        prompt: 'What was my best trade recently and what can I learn from it?',
    },
];

// ─── Markdown-like formatter ──────────────────────────────────────────────────

function formatMessage(text: string): string {
    return text
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Bullet points
        .replace(/^- (.*)/gm, '<span class="flex gap-2"><span class="text-cyan-400 mt-0.5">•</span><span>$1</span></span>')
        // Line breaks
        .replace(/\n/g, '<br />');
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AIChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showScrollDown, setShowScrollDown] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Wait until client-side mount for portal
    useEffect(() => {
        setMounted(true);
    }, []);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Get trading data for context
    const trades = useDashboardStore((s) => s.trades);
    const journalEntries = useDashboardStore((s) => s.journalEntries);
    const { stats } = useMetrics();

    // ─── Auto scroll ──────────────────────────────────────────────────────────

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleScroll = () => {
        if (!messagesContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100);
    };

    // ─── Send Message ─────────────────────────────────────────────────────────

    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: content.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Build trading context
            const tradingContext = {
                stats,
                recentTrades: trades.slice(0, 10).map((t) => ({
                    symbol: t.symbol,
                    side: t.side,
                    pnl: t.pnl,
                    pnlPercent: t.pnlPercent,
                    entryPrice: t.entryPrice,
                    exitPrice: t.exitPrice,
                    duration: t.duration,
                    notes: t.notes,
                })),
                journalEntries: journalEntries.slice(0, 5).map((e) => ({
                    note: e.note,
                    sentiment: e.sentiment,
                    tags: e.tags,
                })),
            };

            // Include conversation history for context
            const apiMessages = [...messages, userMessage].map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: apiMessages,
                    tradingContext,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to get response');
            }

            const assistantMessage: ChatMessage = {
                id: `msg-${Date.now() + 1}`,
                role: 'assistant',
                content: data.message,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            const friendlyMsg = error instanceof Error
                ? error.message
                : 'Something went wrong. Please try again.';

            const errorMessage: ChatMessage = {
                id: `msg-${Date.now() + 1}`,
                role: 'assistant',
                content: friendlyMsg,
                timestamp: new Date(),
                isError: true,
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const retryLastMessage = () => {
        // Find the last user message to retry
        const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
        if (lastUserMsg) {
            // Remove the error message that followed it
            setMessages((prev) => {
                const lastIdx = prev.length - 1;
                if (prev[lastIdx]?.isError) {
                    return prev.slice(0, lastIdx);
                }
                return prev;
            });
            // Re-send without adding a new user message (we kept the old one)
            sendMessage(lastUserMsg.content);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(inputValue);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    // Don't render until mounted (SSR safety for portal)
    if (!mounted) return null;

    return createPortal(
        <>
            {/* Floating Action Button */}
            <motion.button
                id="ai-chat-toggle"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`
                    w-14 h-14 rounded-2xl
                    flex items-center justify-center
                    shadow-lg shadow-cyan-500/20
                    transition-all duration-300 cursor-pointer
                    ${isOpen
                        ? 'bg-secondary/80 backdrop-blur-xl border border-border'
                        : 'hover:scale-110'
                    }
                `}
                style={{
                    position: 'fixed',
                    bottom: '1.5rem',
                    right: '1.5rem',
                    zIndex: 9999,
                    ...(!isOpen ? {
                        background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(0, 240, 255, 0.03) 50%, rgba(0, 200, 255, 0.08) 100%)',
                        backdropFilter: 'blur(24px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                        border: '1px solid rgba(0, 240, 255, 0.2)',
                        boxShadow: 'inset 0 1px 1px rgba(0, 240, 255, 0.15), inset 0 -1px 1px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.25), 0 0 20px rgba(0, 240, 255, 0.1)',
                    } : {}),
                }}
                whileHover={{ scale: isOpen ? 1 : 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle AI Assistant"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X className="w-5 h-5 text-foreground" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="relative"
                        >
                            <Sparkles className="w-6 h-6 text-cyan-400" />
                            {messages.length === 0 && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse" />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id="ai-chat-panel"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-8rem)]
                            flex flex-col rounded-2xl overflow-hidden
                            border border-border
                            shadow-2xl shadow-black/40"
                        style={{
                            position: 'fixed',
                            bottom: '6rem',
                            right: '1.5rem',
                            zIndex: 9999,
                            background: 'var(--liquid-bg)',
                            backdropFilter: 'blur(24px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-background/40">
                            <div className="relative">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-cyan-400" />
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-background" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-foreground">Deri AI</h3>
                                <p className="text-[10px] text-muted-foreground">Trading Assistant • Powered by Gemini</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div
                            ref={messagesContainerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
                        >
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/10 flex items-center justify-center mb-4">
                                        <Sparkles className="w-8 h-8 text-cyan-400" />
                                    </div>
                                    <h4 className="text-base font-semibold text-foreground mb-1">
                                        Hey, I&apos;m Deri! 👋
                                    </h4>
                                    <p className="text-xs text-muted-foreground mb-6 max-w-[260px]">
                                        Your AI trading assistant. Ask me about your trades, portfolio, or get strategy insights.
                                    </p>

                                    {/* Quick Prompts */}
                                    <div className="grid grid-cols-2 gap-2 w-full">
                                        {QUICK_PROMPTS.map((prompt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => sendMessage(prompt.prompt)}
                                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left
                                                    bg-secondary/30 border border-border
                                                    hover:bg-secondary/50 hover:border-cyan-500/20
                                                    transition-all duration-200 group cursor-pointer"
                                            >
                                                <span className="text-muted-foreground group-hover:text-cyan-400 transition-colors">
                                                    {prompt.icon}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
                                                    {prompt.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        {/* Avatar */}
                                        <div className={`
                                            w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5
                                            ${msg.isError
                                                ? 'bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/15'
                                                : msg.role === 'assistant'
                                                    ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/15'
                                                    : 'bg-secondary/50 border border-border'
                                            }
                                        `}>
                                            {msg.role === 'assistant'
                                                ? <Bot className={`w-3.5 h-3.5 ${msg.isError ? 'text-amber-400' : 'text-cyan-400'}`} />
                                                : <User className="w-3.5 h-3.5 text-muted-foreground" />
                                            }
                                        </div>

                                        {/* Bubble */}
                                        <div className={`
                                            max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed
                                            ${msg.isError
                                                ? 'bg-amber-500/10 border border-amber-500/20 text-foreground rounded-tl-md'
                                                : msg.role === 'user'
                                                    ? 'bg-cyan-500/15 border border-cyan-500/15 text-foreground rounded-tr-md'
                                                    : 'bg-secondary/40 border border-border text-foreground rounded-tl-md'
                                            }
                                        `}>
                                            <div
                                                className="[&>strong]:font-semibold [&>strong]:text-cyan-400 [&>em]:italic [&>em]:text-muted-foreground"
                                                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                                            />
                                            {msg.isError && (
                                                <button
                                                    onClick={retryLastMessage}
                                                    disabled={isLoading}
                                                    className="mt-2 text-[11px] text-amber-400 hover:text-amber-300
                                                        font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                                                >
                                                    ↻ Tap to retry
                                                </button>
                                            )}
                                            <span className="block text-[9px] text-muted-foreground mt-1.5 opacity-60">
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            )}

                            {/* Loading indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-2.5"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/15 flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-3.5 h-3.5 text-cyan-400" />
                                    </div>
                                    <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-secondary/40 border border-border">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Scroll to bottom button */}
                        <AnimatePresence>
                            {showScrollDown && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={scrollToBottom}
                                    className="absolute bottom-20 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full
                                        bg-secondary/80 backdrop-blur border border-border
                                        flex items-center justify-center
                                        hover:bg-secondary transition-colors cursor-pointer"
                                >
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* Input */}
                        <div className="px-4 py-3 border-t border-border bg-background/40">
                            <div className="flex items-end gap-2">
                                <textarea
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask Deri anything..."
                                    rows={1}
                                    className="flex-1 resize-none bg-secondary/30 border border-border rounded-xl
                                        px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground
                                        focus:outline-none focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/10
                                        transition-all max-h-24"
                                    style={{
                                        height: 'auto',
                                        minHeight: '40px',
                                    }}
                                    onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto';
                                        target.style.height = Math.min(target.scrollHeight, 96) + 'px';
                                    }}
                                />
                                <button
                                    onClick={() => sendMessage(inputValue)}
                                    disabled={!inputValue.trim() || isLoading}
                                    className={`
                                        flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                                        transition-all duration-200 cursor-pointer
                                        ${inputValue.trim() && !isLoading
                                            ? 'liquid-glass-cyan text-cyan-400 hover:text-cyan-300'
                                            : 'bg-secondary/30 border border-border text-muted-foreground cursor-not-allowed'
                                        }
                                    `}
                                >
                                    {isLoading
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <Send className="w-4 h-4" />
                                    }
                                </button>
                            </div>
                            <p className="text-[9px] text-muted-foreground/50 text-center mt-2">
                                Deri provides insights for educational purposes only. Not financial advice.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>,
        document.body
    );
}
