"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await authApi.login({ email, password });

            if (response.success) {
                // Ensure the user is actually an admin
                if (response.user.role !== "admin") {
                    throw new Error("Access denied. Admin privileges required.");
                }

                localStorage.setItem("token", response.token);
                localStorage.setItem("user", JSON.stringify(response.user));

                toast.success("Welcome back, Commander.");
                router.push("/");
            } else {
                throw new Error(response.message || "Login failed");
            }
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05),transparent_70%)]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-xl shadow-primary/20">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold gradient-text tracking-tighter">NovaEdge Admin</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Secure access for platform administrators</p>
                </div>

                <div className="glass-panel p-8 rounded-3xl relative border-primary/20 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground px-1 tracking-tight">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@novaedge.io"
                                    className="w-full bg-neutral-900/50 border border-border rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-sm font-semibold text-muted-foreground tracking-tight">Security Code</label>
                                <button type="button" className="text-xs text-primary hover:underline font-bold">Request Reset</button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-neutral-900/50 border border-border rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs text-red-500 bg-red-500/10 p-3 rounded-lg text-center font-bold border border-red-500/20 uppercase tracking-widest"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95 group overflow-hidden relative"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Authenticate <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </button>
                    </form>
                </div>

                <div className="mt-8 flex items-center justify-center gap-6">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Encrypted</p>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Node Secured</p>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">256-Bit</p>
                </div>

                <p className="text-center text-[11px] text-muted-foreground/60 mt-12 leading-relaxed">
                    &copy; 2026 NovaEdge Digital Labs. Unauthorized access is strictly prohibited.<br />
                    All session data is logged and monitored for compliance.
                </p>
            </motion.div>
        </div>
    );
}
