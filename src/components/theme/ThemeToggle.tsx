"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { setTheme, theme } = useTheme();
    // Avoid hydration mismatch
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                <Monitor className="h-5 w-5" />
                <span className="sr-only">Toggle theme</span>
            </button>
        );
    }

    return (
        <div className="flex items-center bg-secondary/50 rounded-full p-1 border border-border">
            <button
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-full transition-all duration-200 ${theme === "light"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                title="Light Mode"
            >
                <Sun className="h-4 w-4" />
                <span className="sr-only">Light</span>
            </button>

            <button
                onClick={() => setTheme("system")}
                className={`p-1.5 rounded-full transition-all duration-200 ${theme === "system"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                title="System Theme"
            >
                <Monitor className="h-4 w-4" />
                <span className="sr-only">System</span>
            </button>

            <button
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-full transition-all duration-200 ${theme === "dark"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                title="Dark Mode"
            >
                <Moon className="h-4 w-4" />
                <span className="sr-only">Dark</span>
            </button>
        </div>
    );
}
