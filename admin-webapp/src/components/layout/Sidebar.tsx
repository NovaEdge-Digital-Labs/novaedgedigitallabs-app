"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Users,
    Settings,
    ShieldCheck,
    Menu,
    X,
    LogOut,
    BarChart3,
    Globe,
    ShoppingBag,
    Briefcase,
    GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const NAV_ITEMS = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Users", href: "/users", icon: Users },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Services", href: "/services", icon: Briefcase },
    { name: "Academy", href: "/academy", icon: GraduationCap },
    { name: "Domain", href: "/domain", icon: Globe },
    { name: "Digital Store", href: "/store", icon: ShoppingBag },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        toast.success("Logged out successfully");
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 glass-panel rounded-md"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <motion.aside
                initial={false}
                animate={{ width: isOpen ? 260 : 0 }}
                className={cn(
                    "h-screen glass-panel fixed left-0 top-0 z-40 overflow-hidden flex flex-col transition-all duration-300 ease-in-out",
                    !isOpen && "lg:w-0 border-none"
                )}
            >
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <span className={cn("font-bold text-xl gradient-text whitespace-nowrap", !isOpen && "opacity-0 invisible")}>
                        NovaEdge Admin
                    </span>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                                pathname === item.href
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-neutral-800 hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-primary" : "group-hover:scale-110 transition-transform")} />
                            <span className={cn("font-medium transition-opacity", !isOpen && "opacity-0")}>
                                {item.name}
                            </span>
                            {pathname === item.href && (
                                <motion.div
                                    layoutId="active-nav"
                                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                                />
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-border">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-muted-foreground hover:text-destructive transition-colors rounded-xl hover:bg-destructive/5 group"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className={cn("font-medium", !isOpen && "opacity-0")}>Logout</span>
                    </button>
                </div>
            </motion.aside>

            {/* Overlay for mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
                    />
                )}
            </AnimatePresence>
        </>
    );
}
