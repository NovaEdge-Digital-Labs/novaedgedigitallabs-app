"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Play, RefreshCw, AlertTriangle, CheckCircle2, Server, ArrowRight, Database } from "lucide-react";
import { dbLabApi } from "@/lib/api";
import { toast } from "sonner";

export function AcidSimulator() {
    const [isolationLevel, setIsolationLevel] = useState("READ_COMMITTED");
    const [transferAmount, setTransferAmount] = useState(200);
    const [forceFail, setForceFail] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleRunTransaction = async () => {
        setIsLoading(true);
        try {
            const res = await dbLabApi.simulateAcid({
                isolationLevel,
                amount: transferAmount,
                forceFail
            });
            setResult(res);
            if (res.forceFail || !res.success) {
                toast.warning("Transaction execution triggered a rollback / crash recovery!");
            } else {
                toast.success("Transaction committed successfully!");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to execute transaction simulation");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-neutral-900/50 backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-primary font-semibold">
                            <ShieldCheck className="w-5 h-5" />
                            <span>ACID Transaction Engine</span>
                        </div>
                        <p className="text-sm text-neutral-400 mt-1">
                            Atomicity, Consistency, Isolation & Durability simulation with WAL logs and anomaly detection.
                        </p>
                    </div>

                    <button
                        onClick={handleRunTransaction}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
                    >
                        {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                        <span>Run Transaction</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                    <div>
                        <label className="text-xs text-neutral-400 font-medium">Isolation Level</label>
                        <select
                            value={isolationLevel}
                            onChange={(e) => setIsolationLevel(e.target.value)}
                            className="w-full mt-1.5 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-primary"
                        >
                            <option value="READ_UNCOMMITTED">Read Uncommitted (Dirty Read Risk)</option>
                            <option value="READ_COMMITTED">Read Committed (Standard PG/Oracle)</option>
                            <option value="REPEATABLE_READ">Repeatable Read (Snapshot Isolation)</option>
                            <option value="SERIALIZABLE">Serializable (Strict Serial Lock)</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-neutral-400 font-medium">Transfer Amount ($)</label>
                        <input
                            type="number"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(Number(e.target.value))}
                            className="w-full mt-1.5 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div className="flex items-end">
                        <label className="flex items-center gap-3 p-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={forceFail}
                                onChange={(e) => setForceFail(e.target.checked)}
                                className="w-4 h-4 rounded text-primary bg-neutral-800 border-neutral-700 focus:ring-0"
                            />
                            <div>
                                <span className="text-sm font-medium text-white">Simulate System Crash</span>
                                <p className="text-xs text-neutral-400">Tests Atomicity & WAL Rollback</p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            {result && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Live State & ACID Guarantees */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-neutral-900/50 space-y-4">
                        <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                            <Database className="w-5 h-5 text-primary" />
                            Live Account States
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-xl bg-neutral-800/80 border border-neutral-700">
                                <div className="text-xs text-neutral-400">Alice (Sender)</div>
                                <div className="text-xl font-bold text-white mt-1">
                                    ${result.accounts?.accountA?.balance ?? 1000}
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-neutral-800/80 border border-neutral-700">
                                <div className="text-xs text-neutral-400">Bob (Receiver)</div>
                                <div className="text-xl font-bold text-white mt-1">
                                    ${result.accounts?.accountB?.balance ?? 500}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-neutral-800">
                            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">ACID Health Check</div>
                            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-neutral-800/50">
                                <span>Atomicity (All-or-Nothing)</span>
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Preserved
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-neutral-800/50">
                                <span>Consistency (Invariants)</span>
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Validated
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-neutral-800/50">
                                <span>Isolation Level</span>
                                <span className="text-primary font-bold">{result.isolationLevel}</span>
                            </div>

                            {result.anomalyDetected && (
                                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{result.anomalyDetected}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline Execution Stream */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-neutral-900/50 space-y-4">
                        <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                            <Play className="w-4 h-4 text-emerald-400" />
                            Transaction Execution Timeline
                        </h3>

                        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                            {result.timeline?.map((step: any, idx: number) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60 flex items-start gap-3"
                                >
                                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                        {step.step || idx + 1}
                                    </span>
                                    <div className="text-xs space-y-0.5">
                                        <div className="font-semibold text-white flex items-center gap-2">
                                            <span>{step.action}</span>
                                            {step.target && <span className="text-neutral-400">({step.target})</span>}
                                        </div>
                                        <div className="text-neutral-400">
                                            {step.detail || step.reason || (step.oldVal !== undefined ? `$${step.oldVal} -> $${step.newVal}` : '')}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Write-Ahead Logging (WAL) Log Stream */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-neutral-900/50 space-y-4">
                        <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                            <Server className="w-4 h-4 text-cyan-400" />
                            WAL Log Buffer (Durability Disk Log)
                        </h3>

                        <div className="space-y-2 font-mono text-xs max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                            {result.walLog?.map((log: any, idx: number) => (
                                <div key={idx} className="p-2.5 rounded-lg bg-black/40 border border-neutral-800 text-neutral-300">
                                    <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-1">
                                        <span>{log.txId}</span>
                                        <span className="text-cyan-400">{log.status}</span>
                                    </div>
                                    <div className="text-emerald-400 font-semibold">{log.operation}</div>
                                    {log.payload && (
                                        <div className="text-[11px] text-neutral-400 mt-1">
                                            {JSON.stringify(log.payload)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
