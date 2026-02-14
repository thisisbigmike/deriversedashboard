"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface SignOutButtonProps {
    variant?: "icon" | "full";
    className?: string;
}

export default function SignOutButton({
    variant = "full",
    className = "",
}: SignOutButtonProps) {
    const handleSignOut = () => {
        signOut({ callbackUrl: "/login" });
    };

    if (variant === "icon") {
        return (
            <button
                onClick={handleSignOut}
                className={`p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors ${className}`}
                title="Sign out"
            >
                <LogOut className="w-5 h-5" />
            </button>
        );
    }

    return (
        <button
            onClick={handleSignOut}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors ${className}`}
        >
            <LogOut className="w-5 h-5" />
            <span>Sign out</span>
        </button>
    );
}
