"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Layers, Play, CheckCircle, AlertCircle, Code, Table as TableIcon } from "lucide-react";
import { dbLabApi } from "@/lib/api";
import { toast } from "sonner";

export function NormalizationWizard() {
    const [tableName, setTableName] = useState("OrderItems");
    const [attributesStr, setAttributesStr] = useState("OrderID, ProductID, CustomerName, CustomerEmail, ProductName, ProductPrice, Quantity");
    const [primaryKeyStr, setPrimaryKeyStr] = useState("OrderID, ProductID");
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const handleAnalyze = async () => {
        setIsLoading(true);
        try {
            const attributes = attributesStr.split(',').map(s => s.trim()).filter(Boolean);
            const primaryKey = primaryKeyStr.split(',').map(s => s.trim()).filter(Boolean);

            const res = await dbLabApi.analyzeNormalization({
                tableName,
                attributes,
                primaryKey
            });
            setAnalysisResult(res);
            toast.success("Schema normalization analysis complete!");
        } catch (err: any) {
            toast.error(err.message || "Failed to analyze schema");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Inputs */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-neutral-900/50 backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-purple-400 font-semibold">
                            <Layers className="w-5 h-5" />
                            <span>Database Normalization Studio (1NF / 2NF / 3NF / BCNF)</span>
                        </div>
                        <p className="text-sm text-neutral-400 mt-1">
                            Detect partial & transitive functional dependencies, eliminate anomalies, and decompose schemas.
                        </p>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50"
                    >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Analyze & Normalise</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                    <div>
                        <label className="text-xs text-neutral-400 font-medium">Table Name</label>
                        <input
                            type="text"
                            value={tableName}
                            onChange={(e) => setTableName(e.target.value)}
                            className="w-full mt-1.5 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-400"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-neutral-400 font-medium">Attributes (Comma Separated)</label>
                        <input
                            type="text"
                            value={attributesStr}
                            onChange={(e) => setAttributesStr(e.target.value)}
                            className="w-full mt-1.5 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-400"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-neutral-400 font-medium">Candidate Primary Key</label>
                        <input
                            type="text"
                            value={primaryKeyStr}
                            onChange={(e) => setPrimaryKeyStr(e.target.value)}
                            className="w-full mt-1.5 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-400"
                        />
                    </div>
                </div>
            </div>

            {/* Analysis Output */}
            {analysisResult && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Normal Form Compliance Badges */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-neutral-900/50 space-y-4">
                        <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                            <TableIcon className="w-5 h-5 text-purple-400" />
                            Normal Form Badges
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { name: "1NF (Atomic Values)", ok: analysisResult.analysis?.is1NF },
                                { name: "2NF (No Partial Dep)", ok: analysisResult.analysis?.is2NF },
                                { name: "3NF (No Transitive Dep)", ok: analysisResult.analysis?.is3NF },
                                { name: "BCNF (Superkey Rules)", ok: analysisResult.analysis?.isBCNF }
                            ].map((nf, idx) => (
                                <div
                                    key={idx}
                                    className={`p-3 rounded-xl border ${
                                        nf.ok ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-white">{nf.name}</span>
                                        {nf.ok ? (
                                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                        )}
                                    </div>
                                    <div className={`text-[10px] mt-1 font-semibold ${nf.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {nf.ok ? 'Compliant' : 'Violated'}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Violations List */}
                        {analysisResult.analysis?.violations?.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-neutral-800">
                                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Detected Violations</div>
                                {analysisResult.analysis.violations.map((v: string, i: number) => (
                                    <div key={i} className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                                        {v}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Decomposed Tables (3NF Schema) */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-neutral-900/50 space-y-4">
                        <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                            <Layers className="w-5 h-5 text-emerald-400" />
                            Decomposed 3NF Schemas
                        </h3>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                            {analysisResult.analysis?.decomposedTables?.map((tbl: any, idx: number) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700 space-y-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm text-white">{tbl.name}</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                                            {tbl.normalForm}
                                        </span>
                                    </div>

                                    <div className="text-xs text-neutral-300 space-y-1">
                                        <div><span className="text-neutral-500">Primary Key:</span> <code className="text-emerald-400">{tbl.primaryKey?.join(', ')}</code></div>
                                        <div><span className="text-neutral-500">Columns:</span> {tbl.attributes?.join(', ')}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Generated SQL DDL */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-neutral-900/50 space-y-4">
                        <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                            <Code className="w-5 h-5 text-cyan-400" />
                            Generated Normalized SQL DDL
                        </h3>

                        <div className="space-y-3 font-mono text-xs max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                            {analysisResult.analysis?.generatedSql?.map((sql: string, idx: number) => (
                                <div key={idx} className="p-3 rounded-xl bg-black/50 border border-neutral-800 text-cyan-300 whitespace-pre-wrap">
                                    {sql}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
