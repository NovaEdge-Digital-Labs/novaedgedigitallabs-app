"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Play, GitCommit, AlertOctagon, Layers, ArrowRight } from "lucide-react";
import { dbLabApi } from "@/lib/api";
import { toast } from "sonner";

export function TransactionConcurrencyManager() {
    const [concurrencyModel, setConcurrencyModel] = useState<"2PL" | "MVCC">("2PL");
    const [simulateDeadlock, setSimulateDeadlock] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [simulationData, setSimulationData] = useState<any>(null);

    const handleRunSimulation = async () => {
        setIsLoading(true);
        try {
            const res = await dbLabApi.simulateTransactions({
                concurrencyModel,
                simulateDeadlock
            });
            setSimulationData(res);
            if (res.deadlockOccurred) {
                toast.error("Deadlock cycle detected in Wait-For Graph! Aborted T2.");
            } else {
                toast.success(`Concurrency simulation complete using ${concurrencyModel}!`);
            }
        } catch (err: any) {
            toast.error(err.message || "Failed concurrency simulation");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-neutral-900/50 backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-rose-400 font-semibold">
                            <Lock className="w-5 h-5" />
                            <span>Transactions & Concurrency Control Suite</span>
                        </div>
                        <p className="text-sm text-neutral-400 mt-1">
                            Two-Phase Locking (2PL), MVCC row snapshot versioning, and Wait-For Graph deadlock detection.
                        </p>
                    </div>

                    <button
                        onClick={handleRunSimulation}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-rose-500/25 disabled:opacity-50"
                    >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Run Concurrency Engine</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                    <div>
                        <label className="text-xs text-neutral-400 font-medium">Concurrency Mechanism</label>
                        <select
                            value={concurrencyModel}
                            onChange={(e) => setConcurrencyModel(e.target.value as "2PL" | "MVCC")}
                            className="w-full mt-1.5 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-400"
                        >
                            <option value="2PL">Two-Phase Locking (2PL - Shared/Exclusive Locks)</option>
                            <option value="MVCC">Multi-Version Concurrency Control (MVCC Snapshots)</option>
                        </select>
                    </div>

                    {concurrencyModel === '2PL' && (
                        <div className="flex items-end">
                            <label className="flex items-center gap-3 p-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={simulateDeadlock}
                                    onChange={(e) => setSimulateDeadlock(e.target.checked)}
                                    className="w-4 h-4 rounded text-rose-500 bg-neutral-800 border-neutral-700 focus:ring-0"
                                />
                                <div>
                                    <span className="text-sm font-medium text-white">Simulate Circular Deadlock</span>
                                    <p className="text-xs text-neutral-400">T1 holds A wants B, T2 holds B wants A</p>
                                </div>
                            </label>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Grid */}
            {simulationData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Active Transactions & Locks */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-neutral-900/50 space-y-4">
                        <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                            <Lock className="w-5 h-5 text-rose-400" />
                            {concurrencyModel === '2PL' ? 'Lock Manager Table' : 'MVCC Version Snapshots'}
                        </h3>

                        {concurrencyModel === '2PL' ? (
                            <div className="space-y-3">
                                {simulationData.lockTable?.map((lock: any, idx: number) => (
                                    <div key={idx} className="p-3 rounded-xl bg-neutral-800 border border-neutral-700 space-y-1 text-xs">
                                        <div className="flex justify-between font-bold text-white">
                                            <span>{lock.resource}</span>
                                            <span className="text-rose-400">{lock.lockType}</span>
                                        </div>
                                        <div className="text-neutral-400">
                                            Granted to: <span className="text-emerald-400 font-semibold">{lock.grantedTo}</span>
                                        </div>
                                        {lock.waiting?.length > 0 && (
                                            <div className="text-amber-400 font-semibold">
                                                Waiting Queue: {lock.waiting.join(', ')}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {simulationData.mvccVersions?.map((ver: any, idx: number) => (
                                    <div key={idx} className="p-3 rounded-xl bg-neutral-800 border border-neutral-700 space-y-1 text-xs">
                                        <div className="flex justify-between font-bold text-white">
                                            <span>{ver.rowId}</span>
                                            <span className="text-cyan-400">Version v{ver.version}</span>
                                        </div>
                                        <div className="text-neutral-400">Created by: {ver.createdByTx}</div>
                                        <div className="font-mono text-emerald-400">Payload: {JSON.stringify(ver.val)}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Wait-For Graph Deadlock Detection */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-neutral-900/50 space-y-4">
                        <h3 className="font-semibold text-lg text-white flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <AlertOctagon className="w-5 h-5 text-amber-400" />
                                Wait-For Deadlock Graph
                            </span>
                            {simulationData.deadlockOccurred && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold uppercase">
                                    Cycle Detected
                                </span>
                            )}
                        </h3>

                        {simulationData.waitForGraph?.length > 0 ? (
                            <div className="space-y-2">
                                {simulationData.waitForGraph.map((edge: any, idx: number) => (
                                    <div key={idx} className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between text-xs">
                                        <span className="font-bold text-rose-300">{edge.waitingTx}</span>
                                        <ArrowRight className="w-4 h-4 text-amber-400" />
                                        <span className="text-neutral-400">Waiting for resource ({edge.resource}) held by</span>
                                        <ArrowRight className="w-4 h-4 text-amber-400" />
                                        <span className="font-bold text-emerald-400">{edge.blockedByTx}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-xs text-neutral-400 bg-neutral-800/40 rounded-xl border border-neutral-800">
                                No Deadlock Cycle Detected in Wait-For Graph.
                            </div>
                        )}
                    </div>

                    {/* Timeline Execution */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-neutral-900/50 space-y-4">
                        <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                            <GitCommit className="w-5 h-5 text-emerald-400" />
                            Transaction Step Stream
                        </h3>

                        <div className="space-y-2 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
                            {simulationData.timeline?.map((step: any, idx: number) => (
                                <div key={idx} className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700 text-xs space-y-0.5">
                                    <div className="flex items-center justify-between font-semibold text-white">
                                        <span>Step {step.step}: {step.txId}</span>
                                        <span className="text-emerald-400">{step.action}</span>
                                    </div>
                                    <div className="text-neutral-400">{step.detail || step.resource}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
