"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Play, Zap, GitBranch, Clock, Table, Database } from "lucide-react";
import { dbLabApi } from "@/lib/api";
import { toast } from "sonner";

export function IndexingVisualizer() {
    const [datasetSize, setDatasetSize] = useState(100000);
    const [targetId, setTargetId] = useState(84920);
    const [indexType, setIndexType] = useState<"B_TREE" | "HASH">("B_TREE");
    const [isLoading, setIsLoading] = useState(false);
    const [benchmarkResult, setBenchmarkResult] = useState<any>(null);

    const handleRunBenchmark = async () => {
        setIsLoading(true);
        try {
            const res = await dbLabApi.simulateIndexing({
                datasetSize,
                targetId,
                indexType
            });
            setBenchmarkResult(res);
            toast.success("Indexing EXPLAIN benchmark complete!");
        } catch (err: any) {
            toast.error(err.message || "Failed to execute index simulation");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Benchmark Controls */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-neutral-900/50 backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-amber-400 font-semibold">
                            <Search className="w-5 h-5" />
                            <span>Database Indexing & Query Optimizer Suite</span>
                        </div>
                        <p className="text-sm text-neutral-400 mt-1">
                            B+ Tree & Hash Index traversal, EXPLAIN cost breakdown, and sequential scan vs indexed benchmark.
                        </p>
                    </div>

                    <button
                        onClick={handleRunBenchmark}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50"
                    >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Run EXPLAIN Query</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                    <div>
                        <label className="text-xs text-neutral-400 font-medium">Dataset Size ($N$ Records)</label>
                        <select
                            value={datasetSize}
                            onChange={(e) => setDatasetSize(Number(e.target.value))}
                            className="w-full mt-1.5 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                        >
                            <option value={10000}>10,000 Records</option>
                            <option value={100000}>100,000 Records</option>
                            <option value={1000000}>1,000,000 Records</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-neutral-400 font-medium">Target ID Lookup</label>
                        <input
                            type="number"
                            value={targetId}
                            onChange={(e) => setTargetId(Number(e.target.value))}
                            className="w-full mt-1.5 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-neutral-400 font-medium">Index Structure</label>
                        <select
                            value={indexType}
                            onChange={(e) => setIndexType(e.target.value as "B_TREE" | "HASH")}
                            className="w-full mt-1.5 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                        >
                            <option value="B_TREE">B+ Tree Index ($O(\log N)$ Range & Point)</option>
                            <option value="HASH">Hash Index ($O(1)$ Exact Point Lookup)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Benchmark EXPLAIN Output */}
            {benchmarkResult && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Performance Comparison Cards */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-neutral-900/50 space-y-4">
                        <h3 className="font-semibold text-lg text-white flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-400" />
                                Execution Benchmark
                            </span>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold font-mono">
                                {benchmarkResult.executionPlan?.speedupFactor}
                            </span>
                        </h3>

                        <div className="space-y-3">
                            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-rose-300">Without Index (Full Table Scan)</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">O(N)</span>
                                </div>
                                <div className="flex justify-between text-xs text-neutral-300">
                                    <span>Rows Examined:</span>
                                    <span className="font-bold text-white">{benchmarkResult.executionPlan?.withoutIndex?.rowsExamined?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs text-neutral-300">
                                    <span>Execution Time:</span>
                                    <span className="font-bold text-rose-400">{benchmarkResult.executionPlan?.withoutIndex?.executionTimeMs} ms</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-emerald-300">With {indexType} Index</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                                        {indexType === 'HASH' ? 'O(1)' : 'O(log N)'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-neutral-300">
                                    <span>Disk Blocks / Steps:</span>
                                    <span className="font-bold text-white">{benchmarkResult.executionPlan?.withIndex?.rowsExamined}</span>
                                </div>
                                <div className="flex justify-between text-xs text-neutral-300">
                                    <span>Execution Time:</span>
                                    <span className="font-bold text-emerald-400">{benchmarkResult.executionPlan?.withIndex?.executionTimeMs} ms</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* B+ Tree Visualizer */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-neutral-900/50 space-y-4">
                        <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                            <GitBranch className="w-5 h-5 text-cyan-400" />
                            B+ Tree Structural Traversal Path
                        </h3>

                        <div className="space-y-3 pt-2">
                            <div className="p-3 rounded-xl bg-neutral-800 border border-neutral-700">
                                <div className="text-xs text-neutral-400 mb-1">Root Node Keys</div>
                                <div className="flex gap-2">
                                    {benchmarkResult.bTreeVisualization?.root?.keys?.map((k: number, i: number) => (
                                        <span key={i} className="px-2 py-1 bg-cyan-950 text-cyan-300 rounded text-xs font-mono border border-cyan-700">
                                            {k}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="text-xs text-neutral-400">Search Path Steps</div>
                                {benchmarkResult.bTreeVisualization?.targetPath?.map((path: string, i: number) => (
                                    <div key={i} className="p-2 rounded-lg bg-black/40 border border-neutral-800 text-xs font-mono text-emerald-400">
                                        &gt; {path}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* EXPLAIN Raw Query Plan */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-neutral-900/50 space-y-4">
                        <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-purple-400" />
                            EXPLAIN ANALYZE Cost Node
                        </h3>

                        <div className="p-4 rounded-xl bg-black/50 border border-neutral-800 font-mono text-xs text-purple-300 space-y-2">
                            <div>QUERY: {benchmarkResult.executionPlan?.query}</div>
                            <div className="text-neutral-400">-------------------------------------------</div>
                            <div>NODE TYPE: {benchmarkResult.executionPlan?.withIndex?.nodeType}</div>
                            <div>INDEX NAME: {benchmarkResult.executionPlan?.withIndex?.indexName}</div>
                            <div>ESTIMATED COST: {benchmarkResult.executionPlan?.withIndex?.cost}</div>
                            <div>ACTUAL TIME: {benchmarkResult.executionPlan?.withIndex?.executionTimeMs} ms</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
