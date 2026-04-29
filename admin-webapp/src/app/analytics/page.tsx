"use client";

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { motion } from "framer-motion";
import {
    BarChart3,
    TrendingUp,
    Users,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    Download,
    RefreshCw,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminApi, Analytics } from "@/lib/api";
import { toast } from "sonner";

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getAnalytics();
            if (response.success) {
                setAnalytics(response.analytics);
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error("Failed to load analytics: " + message);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            const response = await adminApi.refreshAnalytics();
            if (response.success) {
                setAnalytics(response.analytics);
                toast.success("Metrics recalculated successfully");
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error("Refresh failed: " + message);
        } finally {
            setRefreshing(false);
        }
    };

    const handleExport = () => {
        if (!analytics) return;

        try {
            const rows = [
                ["Metric", "Value", "Trend"],
                ["Avg. Session Duration", `${Math.floor(analytics.avgSessionDuration / 60)}m ${analytics.avgSessionDuration % 60}s`, "+12%"],
                ["Bounce Rate", `${analytics.bounceRate}%`, "-3%"],
                ["Retention Rate", `${analytics.retentionRate}%`, "+5%"],
                ["Active Nodes", analytics.activeNodes.toString(), "+8%"],
                [],
                ["Traffic Source", "Percentage"],
                ...(analytics.trafficSources || []).map((s) => [s.label, `${s.value}%`]),
                [],
                ["Country", "Distribution"],
                ...(analytics.regionalDistribution || []).map((r) => [r.country, r.value])
            ];

            const csvContent = rows.map((r: string[]) => r.map((cell: string) => `"${cell}"`).join(",")).join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Analytics report exported successfully");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error("Export failed: " + message);
        }
    };

    if (loading && !analytics) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[500px]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-muted-foreground animate-pulse">Processing neural metrics...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const metrics = [
        { label: "Avg. Session Duration", value: analytics ? `${Math.floor(analytics.avgSessionDuration / 60)}m ${analytics.avgSessionDuration % 60}s` : "0m 0s", trend: "+12%", icon: Activity, color: "blue" },
        { label: "Bounce Rate", value: analytics ? `${analytics.bounceRate}%` : "0%", trend: "-3%", icon: Zap, color: "purple" },
        { label: "Retention Rate", value: analytics ? `${analytics.retentionRate}%` : "0%", trend: "+5%", icon: Users, color: "green" },
        { label: "Active Nodes", value: analytics ? analytics.activeNodes.toLocaleString() : "0", trend: "+8%", icon: TrendingUp, color: "orange" },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Analytics & Insights</h1>
                        <p className="text-muted-foreground">Deep dive into platform performance and user behavior.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-2.5 bg-neutral-900 border border-border rounded-xl hover:bg-neutral-800 transition-colors"
                        >
                            <RefreshCw className={cn("w-4 h-4 text-muted-foreground", refreshing && "animate-spin")} />
                        </button>
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                        >
                            <Download className="w-4 h-4" /> Export Report
                        </button>

                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {metrics.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-panel p-6 rounded-2xl relative overflow-hidden group"
                        >
                            <div className="flex items-start justify-between">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110",
                                    stat.color === "blue" ? "bg-blue-500/10 text-blue-500" :
                                        stat.color === "purple" ? "bg-purple-500/10 text-purple-500" :
                                            stat.color === "green" ? "bg-green-500/10 text-green-500" :
                                                "bg-orange-500/10 text-orange-500"
                                )}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <div className={cn(
                                    "text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1",
                                    stat.trend.startsWith("+") ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                )}>
                                    {stat.trend.startsWith("+") ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.trend}
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-panel p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-lg font-bold">Traffic Source</h2>
                                <p className="text-xs text-muted-foreground">User distribution by channel</p>
                            </div>
                            <select className="bg-neutral-900 border border-border rounded-lg px-2 py-1 text-xs outline-none focus:border-primary">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                            </select>
                        </div>

                        <div className="h-64 flex items-end justify-between gap-2 px-2">
                            {(analytics?.trafficSources || []).map((data, i: number) => (
                                <div key={data.label} className="flex-1 flex flex-col items-center gap-3 group">
                                    <div className="w-full relative flex items-end justify-center">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${data.value}%` }}
                                            transition={{ delay: i * 0.05, duration: 1, ease: [0.33, 1, 0.68, 1] }}
                                            className="w-full max-w-[40px] rounded-t-lg bg-linear-to-t from-primary/20 via-primary/50 to-primary relative group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all"
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-950 border border-border text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                                                {data.value}%
                                            </div>
                                        </motion.div>
                                    </div>
                                    <span className="text-xs text-muted-foreground font-medium">{data.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl">
                        <h2 className="text-lg font-bold mb-6">Regional Distribution</h2>
                        <div className="space-y-4">
                            {(analytics?.regionalDistribution || []).map((item, i: number) => (
                                <div key={item.country} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium">{item.country}</span>
                                        <span className="text-muted-foreground font-bold">{item.value}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: item.value }}
                                            transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                                            className={cn("h-full rounded-full", item.color)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold italic">Growth Insight</p>
                                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 font-medium">
                                    User retention across key global markets is trending upwards by 15% due to optimized node clusters and edge performance.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
