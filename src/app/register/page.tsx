"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Loader2, User, ArrowRight } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Client-side validation
        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Registration failed");
                return;
            }

            // Redirect to login on success
            router.push("/login?registered=true");
        } catch {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">

            <div className="relative w-full max-w-md">
                {/* Glass card */}
                <div className="liquid-glass rounded-3xl p-6 sm:p-8 shadow-2xl">
                    {/* Logo/Brand */}
                    <div className="text-center mb-8">
                        <img src="/logo.png" alt="Deriverse" className="w-16 h-16 rounded-2xl mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-foreground mb-2">
                            Create an account
                        </h1>
                        <p className="text-muted-foreground">Join Deriverse and start trading</p>
                    </div>

                    {/* Registration Form */}
                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                    className="w-full pl-11 pr-12 py-3 bg-secondary/50 border border-border rounded-xl text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground/80">
                                Must be at least 8 characters
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-border rounded-xl text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex items-center justify-center gap-3 py-3 rounded-full bg-secondary/40 border border-primary/30 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:border-primary/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-8 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />

                            <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform relative z-10" />

                            <span className="text-primary font-medium tracking-wide uppercase text-sm relative z-10">
                                {isLoading ? "Creating Account..." : "Create Account"}
                            </span>

                            {isLoading && <Loader2 className="absolute right-4 w-5 h-5 animate-spin text-primary/50" />}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="mt-6 text-center text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>

                    {/* Dashboard Link */}
                    <Link
                        href="/dashboard"
                        className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 opacity-60 hover:opacity-100"
                    >
                        Continue to Dashboard <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-muted-foreground text-sm">
                    Your data is encrypted and secure
                </p>

            </div>
        </div>
    );
}
