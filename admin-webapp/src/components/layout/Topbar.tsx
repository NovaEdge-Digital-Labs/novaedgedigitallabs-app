"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bell, Search, User, LogOut, HelpCircle, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Notification {
    id: number;
    title: string;
    time: string;
    type: string;
    read: boolean;
}

export function Topbar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<any>(null);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: 1, title: "New user registered", time: "5m ago", type: "user", read: false },
        { id: 2, title: "Server load high", time: "12m ago", type: "system", read: false },
        { id: 3, title: "Database backup completed", time: "1h ago", type: "success", read: true },
    ]);

    // Initialize search query from URL once on mount
    useEffect(() => {
        const q = searchParams.get("q") || "";
        setSearchQuery(q);
    }, [searchParams]);

    // Handle search debounce
    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (searchQuery) {
                params.set("q", searchQuery);
            } else {
                params.delete("q");
            }
            
            const currentQ = searchParams.get("q") || "";
            if (currentQ !== searchQuery) {
                router.push(`${pathname}?${params.toString()}`);
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchQuery, pathname, router, searchParams]);

    // Notification simulation
    useEffect(() => {
        const interval = setInterval(() => {
            const shouldAdd = Math.random() > 0.85;
            if (shouldAdd) {
                const types = ["user", "system", "success", "alert"];
                const type = types[Math.floor(Math.random() * types.length)];
                const titles = {
                    user: "New node connection established",
                    system: "System heartbeat check: OK",
                    success: "Security audit completed",
                    alert: "Suspicious login attempt blocked"
                };

                const newNotif = {
                    id: Date.now(),
                    title: titles[type as keyof typeof titles],
                    time: "Just now",
                    type,
                    read: false
                };
                setNotifications(prev => [newNotif, ...prev.slice(0, 4)]);
                
                if (type === "alert") {
                    toast.error(titles.alert, { position: "bottom-right" });
                }
            }
        }, 20000); 
        return () => clearInterval(interval);
    }, []);

    // Load user safely
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse user", e);
                }
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        toast.success("Session terminated successfully");
    };

    const getIcon = useCallback((type: string) => {
        switch (type) {
            case 'user': return <User className="w-4 h-4 text-primary" />;
            case 'success': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'alert': return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return <Shield className="w-4 h-4 text-primary" />;
        }
    }, []);

    return (
        <header className="h-20 border-b border-border glass-panel sticky top-0 z-20 px-8 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 max-w-md relative group">
                <Search className="w-4 h-4 absolute left-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    placeholder="Search records across platform..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-neutral-900/50 border border-border rounded-full py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                />
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative">
                    <button 
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        className={cn(
                            "p-2.5 rounded-full hover:bg-neutral-800 text-muted-foreground hover:text-foreground transition-all relative",
                            isNotificationOpen && "bg-neutral-800 text-foreground"
                        )}
                    >
                        <Bell className="w-5 h-5" />
                        {notifications.some(n => !n.read) && (
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse" />
                        )}
                    </button>

                    <AnimatePresence>
                        {isNotificationOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsNotificationOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-80 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden"
                                >
                                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                        <h3 className="font-bold text-sm">Notifications</h3>
                                        <button 
                                            onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                                            className="text-[10px] text-primary hover:underline font-bold uppercase tracking-wider"
                                        >
                                            Mark all as read
                                        </button>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map((n) => (
                                                <div key={n.id} className={cn(
                                                    "p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group",
                                                    !n.read && "bg-primary/5"
                                                )}>
                                                    <div className="flex gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 border border-white/5">
                                                            {getIcon(n.type)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-xs font-medium group-hover:text-primary transition-colors">{n.title}</p>
                                                            <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                                                        </div>
                                                        {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center">
                                                <p className="text-xs text-muted-foreground">No new notifications</p>
                                            </div>
                                        )}
                                    </div>
                                    <button className="w-full p-3 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all font-medium border-t border-white/5">
                                        View all notifications
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                <div className="h-8 w-px bg-border mx-2" />

                {/* Profile */}
                <div className="relative">
                    <div 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold">{user?.firstName || "Admin"} {user?.lastName || "User"}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{user?.role || "Super Admin"}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center border-2 border-border shadow-inner">
                            <User className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    <AnimatePresence>
                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-56 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl z-20 p-2 overflow-hidden"
                                >
                                    <div className="p-3 mb-2 border-b border-white/5">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Account Control</p>
                                    </div>
                                    <button 
                                        onClick={() => { router.push("/settings"); setIsProfileOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                                    >
                                        <User className="w-4 h-4" /> Profile Settings
                                    </button>
                                    <button 
                                        onClick={() => { router.push("/settings?tab=security"); setIsProfileOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                                    >
                                        <Shield className="w-4 h-4" /> Security Center
                                    </button>
                                    <button 
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                                    >
                                        <HelpCircle className="w-4 h-4" /> System Support
                                    </button>
                                    <div className="my-2 border-t border-white/5" />
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-bold"
                                    >
                                        <LogOut className="w-4 h-4" /> Logout Session
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
