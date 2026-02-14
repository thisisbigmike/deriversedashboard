'use client';

import React, { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Wallet, ChevronDown, Copy, LogOut, Check } from 'lucide-react';

export function WalletConnectButton() {
    const { publicKey, disconnect, connecting, connected } = useWallet();
    const { setVisible } = useWalletModal();
    const [showDropdown, setShowDropdown] = useState(false);
    const [copied, setCopied] = useState(false);

    const truncatedAddress = publicKey
        ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
        : '';

    const fullAddress = publicKey?.toBase58() || '';

    const handleCopy = useCallback(async () => {
        if (fullAddress) {
            await navigator.clipboard.writeText(fullAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [fullAddress]);

    const handleDisconnect = useCallback(() => {
        disconnect();
        setShowDropdown(false);
    }, [disconnect]);

    const openModal = useCallback(() => {
        setVisible(true);
    }, [setVisible]);

    // Connected state - show address with dropdown
    if (connected && publicKey) {
        return (
            <div className="relative">
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl
                        liquid-glass-cyan
                        text-sm font-medium text-cyan-300
                        hover:text-white
                        transition-all duration-300"
                >
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span>{truncatedAddress}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menu */}
                {showDropdown && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowDropdown(false)}
                        />

                        {/* Dropdown */}
                        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl 
                            liquid-glass
                            shadow-xl shadow-black/50 z-50 overflow-hidden">

                            {/* Address display */}
                            <div className="px-4 py-3 border-b border-white/5">
                                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                                    Connected Wallet
                                </p>
                                <p className="text-sm text-white font-mono truncate">
                                    {truncatedAddress}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="p-2">
                                <button
                                    onClick={handleCopy}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                                        text-sm text-white/70 hover:text-white hover:bg-white/5
                                        transition-all duration-150"
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 text-green-400" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                    {copied ? 'Copied!' : 'Copy Address'}
                                </button>

                                <button
                                    onClick={handleDisconnect}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                                        text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10
                                        transition-all duration-150"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Disconnect
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Connecting state
    if (connecting) {
        return (
            <button
                disabled
                className="flex items-center gap-2 px-4 py-2 rounded-xl
                    liquid-glass
                    text-sm font-medium text-white/50
                    cursor-not-allowed opacity-60"
            >
                <div className="w-4 h-4 border-2 border-white/30 border-t-cyan-400 rounded-full animate-spin" />
                Connecting...
            </button>
        );
    }

    // Disconnected state - show connect button
    return (
        <button
            onClick={openModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                liquid-glass-cyan
                text-sm font-medium text-cyan-300
                hover:text-white
                transition-all duration-300"
        >
            <Wallet className="w-4 h-4" />
            Select Wallet
        </button>
    );
}
