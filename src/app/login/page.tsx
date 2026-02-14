"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Loader2, LogIn, ArrowRight } from "lucide-react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="relative w-full max-w-md">
            {/* Glass card */}
            <div className="liquid-glass rounded-3xl p-6 sm:p-8 shadow-2xl">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <img src="/logo.png" alt="Deriverse" className="w-16 h-16 rounded-2xl mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                        Welcome back
                    </h1>
                    <p className="text-muted-foreground">Sign in to your Deriverse account</p>
                </div>

                {/* Credentials Login Form */}
                <form onSubmit={handleCredentialsLogin} className="space-y-4 mb-6">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider pl-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-secondary/50 border border-border rounded-xl px-10 py-3 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground uppercase tracking-wider pl-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-secondary/50 border border-border rounded-xl px-10 py-3 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                            <input type="checkbox" className="rounded border-border bg-secondary/50 checked:bg-primary" />
                            Remember me
                        </label>
                        <Link href="/forgot-password" className="text-primary hover:text-primary/80 transition-colors">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full flex items-center justify-center gap-3 py-3 rounded-full bg-secondary/40 border border-primary/30 shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] hover:border-primary/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-8 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />

                        <LogIn className="w-5 h-5 text-primary group-hover:scale-110 transition-transform relative z-10" />

                        <span className="text-primary font-medium tracking-wide uppercase text-sm relative z-10">
                            {isLoading ? "Signing In..." : "Sign In"}
                        </span>

                        {isLoading && <Loader2 className="absolute right-4 w-5 h-5 animate-spin text-primary/50" />}
                    </button>
                </form>

                {/* Signup Link */}
                <p className="mt-6 text-center text-muted-foreground">
                    Don't have an account?{" "}
                    <Link
                        href="/register"
                        className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                        Sign up
                    </Link>
                </p>

                <Link
                    href="/dashboard"
                    className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 opacity-60 hover:opacity-100"
                >
                    Continue to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Footer Message */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-muted-foreground/50">
                        By connecting, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>


            {/* Footer */}
            <p className="mt-6 text-center text-muted-foreground text-sm">
                Secure authentication powered by NextAuth.js
            </p>


        </div >
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Suspense fallback={<div className="text-foreground">Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
