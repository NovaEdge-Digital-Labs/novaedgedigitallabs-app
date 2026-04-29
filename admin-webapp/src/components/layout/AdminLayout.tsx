"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

import { AlertCircle, LogOut } from "lucide-react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [showSessionModal, setShowSessionModal] = useState(false);

    useEffect(() => {
        const handleAuthError = () => {
            setShowSessionModal(true);
        };

        window.addEventListener("auth-error", handleAuthError);
        
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
        } else {
            setIsAuthChecked(true);
        }

        return () => window.removeEventListener("auth-error", handleAuthError);
    }, [router]);

    const handleSessionLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    if (!isAuthChecked && !showSessionModal) return null;

    return (
        <div className="flex min-h-screen bg-[#0a0a0a]">
            <Sidebar />
            <main className="flex-1 flex flex-col lg:pl-[260px] transition-all duration-300">
                <Topbar />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="p-8 flex-1"
                >
                    {children}
                </motion.div>
            </main>

            {/* Session Expired Modal */}
            <AnimatePresence>
                {showSessionModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md glass-panel p-8 rounded-3xl border-red-500/20 text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Session Expired</h2>
                            <p className="text-muted-foreground mb-8">Your authentication session has timed out or is no longer valid. Please log in again to continue.</p>
                            <button
                                onClick={handleSessionLogout}
                                className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                            >
                                <LogOut className="w-5 h-5" /> Back to Login
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
