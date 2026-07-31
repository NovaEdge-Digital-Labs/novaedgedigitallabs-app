"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Network, Play, ShieldAlert, Cpu, WifiOff, Check, X } from "lucide-react";
import { dbLabApi } from "@/lib/api";
import { toast } from "sonner";

export function CapTheoremSimulator() {
    const [systemPreference, setSystemPreference] = useState<"CP" | "AP">("CP");
    const [nodesCount, setNodesCount] = useState(3);
    const [partitionedNode, setPartitionedNode] = useState<number>(2);
    const [readQuorum, setReadQuorum] = useState(2);
    const [writeQuorum, setWriteQuorum] = useState(2);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleSimulateCluster = async () => {
        setIsLoading(true);
        try {
            const res = await dbLabApi.simulateCap({
                nodesCount,
                partitionedNodes: partitionedNode ? [partitionedNode] : [],
                readQuorum,
                writeQuorum,
                systemPreference
            });
            setResult(res);
            toast.success(`Cluster quorum computed in ${systemPreference} mode!`);
        } catch (err: any) {
            toast.error(err.message || "Failed to simulate CAP Theorem");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Control Panel */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-neutral-900/50 backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                            <Network className="w-5 h-5" />
                            <span>CAP Theorem & PACELC Distributed Simulator</span>
                        </div>
                        <p className="text-sm text-neutral-400 mt-1">
                            Trade-offs between Consistency, Availability & Partition Tolerance under network failures.
                        </p>
                    </div>

                    <button
                        onClick={handleSimulateCluster}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50"
                    >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Simulate Partition</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
                    <div>
                        <label className="text-xs text-neutral-400 font-medium">System Preference Mode</label>
                        <select
                            value={systemPreference}
                            onChange={(e) => setSystemPreference(e.target.value as "CP" | "AP")}
                            className="w-full mt-1.5 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                        >
                            <option value="CP">CP (Consistency over Availability)</option>
                            <option value="AP">AP (Availability over Consistency)</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-neutral-400 font-medium">Node Count ($N$)</label>
                        <select
                            value={nodesCount}
                            onChange={(e) => setNodesCount(Number(e.target.value))}
                            className="w-full mt-1.5 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                        >
                            <option value={3}>3 Nodes Cluster</option>
                            <option value={5}>5 Nodes Cluster</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-neutral-400 font-medium">Partitioned Node ID</label>
                        <select
                            value={partitionedNode}
                            onChange={(e) => setPartitionedNode(Number(e.target.value))}
                            className="w-full mt-1.5 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                        >
                            <option value={0}>None (Healthy Network)</option>
                            {Array.from({ length: nodesCount }, (_, i) => (
                                <option key={i + 1} value={i + 1}>Node-{i + 1} Cut Off</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-neutral-400 font-medium">Quorum ($R={readQuorum}, W={writeQuorum}$)</label>
                        <div className="flex gap-2 mt-1.5">
                            <input
                                type="number"
                                min={1}
                                max={nodesCount}
                                value={readQuorum}
                                onChange={(e) => setReadQuorum(Number(e.target.value))}
                                className="w-1/2 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                                placeholder="R"
                            />
                            <input
                                type="number"
                                min={1}
                                max={nodesCount}
                                value={writeQuorum}
                                onChange={(e) => setWriteQuorum(Number(e.target.value))}
                                className="w-1/2 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                                placeholder="W"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Distributed Topology & Metrics */}
            {result && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Node Visualizer */}
                    <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 bg-neutral-900/50 space-y-4">
                        <h3 className="font-semibold text-lg text-white flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-cyan-400" />
                                Cluster Topology Visualizer
                            </span>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-mono">
                                PACELC: {result.pacelcSummary}
                            </span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                            {result.nodes?.map((node: any) => (
                                <motion.div
                                    key={node.id}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={`p-4 rounded-xl border relative overflow-hidden ${
                                        node.status === 'PARTITIONED'
                                            ? 'bg-rose-950/20 border-rose-500/30'
                                            : 'bg-neutral-800/80 border-cyan-500/30'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-bold text-white text-sm">{node.name}</span>
                                        {node.status === 'PARTITIONED' ? (
                                            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-medium">
                                                <WifiOff className="w-3 h-3" /> Cut-off
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                                                <Check className="w-3 h-3" /> Active
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-xs space-y-1 text-neutral-300">
                                        <div className="flex justify-between">
                                            <span className="text-neutral-400">Data Version:</span>
                                            <span className="font-mono text-cyan-400">v{node.version}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-400">Status Payload:</span>
                                            <span className="font-mono text-xs">{node.data?.user_status}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-400">Node Latency:</span>
                                            <span className="font-mono text-xs">{node.latencyMs} ms</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Guarantees & Quorum Metrics */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-neutral-900/50 space-y-4">
                        <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-amber-400" />
                            Quorum & System State
                        </h3>

                        <div className="space-y-3">
                            <div className="p-3 rounded-xl bg-neutral-800/80 border border-neutral-700 flex justify-between items-center text-sm">
                                <span className="text-neutral-400">Quorum Formula ($R+W &gt; N$)</span>
                                <span className={`font-bold ${result.quorumSatisfied ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {readQuorum + writeQuorum} &gt; {nodesCount} ({result.quorumSatisfied ? 'Satisfied' : 'Violated'})
                                </span>
                            </div>

                            <div className="p-3 rounded-xl bg-neutral-800/80 border border-neutral-700 flex justify-between items-center text-sm">
                                <span className="text-neutral-400">Consistency Guarantee</span>
                                <span className="font-bold text-cyan-400">{result.dataConsistency}</span>
                            </div>

                            <div className="p-3 rounded-xl bg-neutral-800/80 border border-neutral-700 flex justify-between items-center text-sm">
                                <span className="text-neutral-400">Write Availability</span>
                                <span className={`font-bold ${result.systemAvailability ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {result.systemAvailability ? 'Available' : 'Blocked (CP Mode)'}
                                </span>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-neutral-800 space-y-2">
                            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Execution Log Stream</div>
                            <div className="p-3 rounded-xl bg-black/40 border border-neutral-800 text-xs font-mono space-y-1.5 max-h-[160px] overflow-y-auto">
                                {result.executionLog?.map((log: string, idx: number) => (
                                    <div key={idx} className="text-neutral-300">
                                        &gt; {log}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
