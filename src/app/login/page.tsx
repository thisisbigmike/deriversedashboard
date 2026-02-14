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
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Welcome back
                    </h1>
                    <p className="text-gray-400">Sign in to your Deriverse account</p>
                </div>

                {/* Credentials Login Form */}
                <form onSubmit={handleCredentialsLogin} className="space-y-4 mb-6">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs text-white/40 uppercase tracking-wider pl-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-white/40 uppercase tracking-wider pl-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-10 py-3 text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <label className="flex items-center gap-2 text-white/60 cursor-pointer">
                            <input type="checkbox" className="rounded border-white/10 bg-white/5 checked:bg-cyan-500" />
                            Remember me
                        </label>
                        <Link href="/forgot-password" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full flex items-center justify-center gap-3 py-3 rounded-full bg-black/40 border border-cyan-500/30 shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] hover:border-cyan-500/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-8 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors" />

                        <LogIn className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform relative z-10" />

                        <span className="text-cyan-400 font-medium tracking-wide uppercase text-sm relative z-10">
                            {isLoading ? "Signing In..." : "Sign In"}
                        </span>

                        {isLoading && <Loader2 className="absolute right-4 w-5 h-5 animate-spin text-cyan-400/50" />}
                    </button>
                </form>

                {/* Signup Link */}
                <p className="mt-6 text-center text-gray-400">
                    Don't have an account?{" "}
                    <Link
                        href="/register"
                        className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                    >
                        Sign up
                    </Link>
                </p>

                <Link
                    href="/dashboard"
                    className="mt-6 text-sm text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2 opacity-60 hover:opacity-100"
                >
                    Continue to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Footer Message */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-white/30">
                        By connecting, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>


            {/* Footer */}
            <p className="mt-6 text-center text-gray-600 text-sm">
                Secure authentication powered by NextAuth.js
            </p>


        </div >
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#1c1c1e] to-[#1a1a1a] px-4">
            {/* Animated background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
            </div>

            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
