"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, ShieldCheck, Network, Layers, Search, Lock, Server, Cpu, HardDrive } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AcidSimulator } from "@/components/db-lab/AcidSimulator";
import { CapTheoremSimulator } from "@/components/db-lab/CapTheoremSimulator";
import { NormalizationWizard } from "@/components/db-lab/NormalizationWizard";
import { IndexingVisualizer } from "@/components/db-lab/IndexingVisualizer";
import { TransactionConcurrencyManager } from "@/components/db-lab/TransactionConcurrencyManager";

type TabType = "acid" | "cap" | "normalization" | "indexing" | "transactions";

export default function DbLabPage() {
    const [activeTab, setActiveTab] = useState<TabType>("acid");

    const tabs = [
        { id: "acid" as TabType, label: "ACID Properties", icon: ShieldCheck, color: "text-primary" },
        { id: "cap" as TabType, label: "CAP & PACELC", icon: Network, color: "text-cyan-400" },
        { id: "normalization" as TabType, label: "Normalization (1NF-3NF)", icon: Layers, color: "text-purple-400" },
        { id: "indexing" as TabType, label: "Indexing & EXPLAIN", icon: Search, color: "text-amber-400" },
        { id: "transactions" as TabType, label: "Transactions & 2PL/MVCC", icon: Lock, color: "text-rose-400" },
    ];

    return (
        <AdminLayout>
            <div className="space-y-8 pb-12">
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-3xl glass-panel p-8 border border-white/10 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-900/60">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl -z-10" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-3">
                                <Database className="w-3.5 h-3.5" />
                                Interactive Database Engineering Suite
                            </div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">
                                Database Systems & Core Architecture Lab
                            </h1>
                            <p className="text-neutral-400 mt-2 max-w-2xl text-sm leading-relaxed">
                                Live visual simulation engine for ACID transaction guarantees, distributed CAP theorem PACELC trade-offs, relational schema normalization, B+ tree & hash index search benchmarks, and 2PL/MVCC concurrency control.
                            </p>
                        </div>

                        {/* Quick Stats Badges */}
                        <div className="grid grid-cols-3 gap-3 shrink-0">
                            <div className="p-3.5 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 text-center">
                                <Server className="w-4 h-4 text-primary mx-auto mb-1" />
                                <div className="text-xs text-neutral-400">Modules</div>
                                <div className="text-base font-bold text-white mt-0.5">5 Suite Labs</div>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 text-center">
                                <Cpu className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                                <div className="text-xs text-neutral-400">Cluster</div>
                                <div className="text-base font-bold text-white mt-0.5">3-5 Nodes</div>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 text-center">
                                <HardDrive className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                                <div className="text-xs text-neutral-400">Index Engine</div>
                                <div className="text-base font-bold text-white mt-0.5">B+ / Hash</div>
                            </div>
                        </div>
                    </div>

                    {/* Module Tabs Navigation */}
                    <div className="flex items-center gap-2 mt-8 pt-6 border-t border-white/10 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all relative shrink-0 ${
                                        isActive
                                            ? "bg-neutral-800 text-white shadow-md border border-neutral-700"
                                            : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${tab.color}`} />
                                    <span>{tab.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-lab-tab"
                                            className="absolute inset-0 rounded-xl bg-white/5 border border-white/10"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Module Content View */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === "acid" && <AcidSimulator />}
                        {activeTab === "cap" && <CapTheoremSimulator />}
                        {activeTab === "normalization" && <NormalizationWizard />}
                        {activeTab === "indexing" && <IndexingVisualizer />}
                        {activeTab === "transactions" && <TransactionConcurrencyManager />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </AdminLayout>
    );
}
