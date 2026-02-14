'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCryptoPrices } from '@/context/CryptoPriceContext';
import { formatPrice, formatPercentChange } from '@/lib/cryptoPrices';
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';

const DISPLAY_ORDER = ['BTC-PERP', 'ETH-PERP', 'SOL-PERP'];

const SYMBOL_ICONS: Record<string, string> = {
    'BTC-PERP': 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
    'ETH-PERP': 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    'SOL-PERP': 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png',
};

export function LivePriceTicker() {
    const { prices, isLoading, error, lastUpdated, refresh } = useCryptoPrices();

    if (isLoading) {
        return (
            <div className="flex items-center gap-4 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                {DISPLAY_ORDER.slice(0, 3).map((symbol) => (
                    <div key={symbol} className="flex items-center gap-2 animate-pulse">
                        <div className="w-6 h-6 bg-white/10 rounded-full" />
                        <div className="space-y-1">
                            <div className="w-16 h-3 bg-white/10 rounded" />
                            <div className="w-12 h-2 bg-white/10 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400">
                <AlertCircle size={16} />
                <span className="text-sm">Unable to load prices</span>
                <button
                    onClick={refresh}
                    className="ml-2 hover:text-red-300 transition-colors"
                >
                    <RefreshCw size={14} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1">
            {/* Price ticker */}
            <div className="flex items-center gap-3 px-3 py-1 bg-white/5 rounded-xl border border-white/10">
                <AnimatePresence mode="popLayout">
                    {DISPLAY_ORDER.map((symbol) => {
                        const quote = prices[symbol];
                        if (!quote) return null;

                        const isPositive = quote.percent_change_24h >= 0;

                        return (
                            <motion.div
                                key={symbol}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="flex items-center gap-2 px-2 py-0.5 rounded-lg hover:bg-white/5 transition-colors cursor-default"
                            >
                                {/* Symbol icon */}
                                <div className="w-6 h-6 flex items-center justify-center rounded-full overflow-hidden bg-white/10">
                                    <img 
                                        src={SYMBOL_ICONS[symbol]} 
                                        alt={symbol}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Price info */}
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs font-medium text-white/70">
                                            {symbol.replace('-PERP', '')}
                                        </span>
                                        <motion.span
                                            key={quote.price}
                                            initial={{ scale: 1.1, color: isPositive ? '#22c55e' : '#ef4444' }}
                                            animate={{ scale: 1, color: '#ffffff' }}
                                            transition={{ duration: 0.3 }}
                                            className="text-sm font-semibold text-white"
                                        >
                                            {formatPrice(quote.price)}
                                        </motion.span>
                                    </div>
                                    <div className={`flex items-center gap-0.5 text-xs ${isPositive ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                        {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                        <span>{formatPercentChange(quote.percent_change_24h)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Refresh button & timestamp */}
            <button
                onClick={refresh}
                className="p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
                title={lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Refresh prices'}
            >
                <RefreshCw size={14} />
            </button>
        </div>
    );
}
