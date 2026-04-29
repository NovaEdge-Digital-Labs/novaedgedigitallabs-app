"use client";

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
    Globe,
    ShieldCheck,
    ExternalLink,
    RefreshCw,
    Plus,
    CheckCircle2,
    Clock,
    AlertCircle,
    Copy,
    Server,
    Activity,
    Trash2,
    X,
    Loader2,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";

export default function DomainPage() {
    const [domains, setDomains] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newDomain, setNewDomain] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [platformConfig, setPlatformConfig] = useState<any>(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setIsLoading(true);
            const response = await adminApi.getPlatformConfig();
            if (response.success) {
                setPlatformConfig(response.config);
                setDomains(response.config.allowedDomains || []);
            }
        } catch (error: any) {
            toast.error("Failed to load domain configuration: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddDomain = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDomain.trim()) return;

        // Basic domain validation
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
        if (!domainRegex.test(newDomain)) {
            toast.error("Please enter a valid domain name");
            return;
        }

        if (domains.includes(newDomain.toLowerCase())) {
            toast.error("Domain already exists in the configuration");
            return;
        }

        setIsSubmitting(true);
        try {
            const updatedDomains = [...domains, newDomain.toLowerCase()];
            const response = await adminApi.updatePlatformConfig({
                ...platformConfig,
                allowedDomains: updatedDomains
            });

            if (response.success) {
                toast.success("Domain added successfully");
                setDomains(updatedDomains);
                setPlatformConfig(response.config);
                setNewDomain("");
                setIsAddModalOpen(false);
            }
        } catch (error: any) {
            toast.error("Failed to add domain: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteDomain = async (domainToDelete: string) => {
        if (!confirm(`Are you sure you want to remove ${domainToDelete}?`)) return;

        try {
            const updatedDomains = domains.filter(d => d !== domainToDelete);
            const response = await adminApi.updatePlatformConfig({
                ...platformConfig,
                allowedDomains: updatedDomains
            });

            if (response.success) {
                toast.success("Domain removed successfully");
                setDomains(updatedDomains);
                setPlatformConfig(response.config);
            }
        } catch (error: any) {
            toast.error("Failed to remove domain: " + error.message);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    if (isLoading && !platformConfig) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-[600px] gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-muted-foreground animate-pulse font-medium">Loading domain configurations...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Domain Management</h1>
                        <p className="text-muted-foreground">Manage your platform domains, DNS, and SSL certificates.</p>
                    </div>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-4 h-4" /> Add Domain
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-panel rounded-2xl overflow-hidden border-white/5">
                            <div className="p-6 border-b border-white/5 bg-white/2">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-primary" /> Connected Domains
                                </h2>
                            </div>
                            <div className="divide-y divide-white/5">
                                {domains.length === 0 ? (
                                    <div className="p-12 text-center text-muted-foreground italic">
                                        No domains connected. Add your first domain to get started.
                                    </div>
                                ) : (
                                    domains.map((domain, idx) => (
                                        <div key={domain} className="p-4 flex items-center justify-between group hover:bg-white/2 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-blue-500 flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                                    <Globe className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold">{domain}</span>
                                                        {idx === 0 && (
                                                            <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                                                Primary
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-4">
                                                        <span className="flex items-center gap-1"><Server className="w-3 h-3" /> Cloudflare</span>
                                                        <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-green-500" /> SSL Active</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => window.open(`https://${domain}`, "_blank")}
                                                    className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                                                    title="Visit Site"
                                                >
                                                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteDomain(domain)}
                                                    className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                                    title="Remove Domain"
                                                >
                                                    <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-inherit" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl border-white/5">
                            <h2 className="text-lg font-bold mb-4">DNS Configuration</h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                Point your domain to NovaEdge by adding these DNS records to your registrar.
                            </p>
                            <div className="space-y-3">
                                {[
                                    { type: "A", name: "@", value: "75.2.60.5", status: "Verified" },
                                    { type: "CNAME", name: "www", value: "cname.novaedge.io", status: "Verified" },
                                    { type: "TXT", name: "_novaedge-verify", value: "verification-code-xyz-123", status: "Pending" },
                                ].map((record) => (
                                    <div key={record.name} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/2 border border-white/5 rounded-xl gap-4">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 flex flex-col">
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Type</span>
                                                <span className="font-bold text-primary">{record.type}</span>
                                            </div>
                                            <div className="flex flex-col min-w-[80px]">
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Name</span>
                                                <span className="font-medium">{record.name}</span>
                                            </div>
                                            <div 
                                                className="flex flex-col group/val cursor-pointer"
                                                onClick={() => copyToClipboard(record.value, `${record.type} Record`)}
                                            >
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5 flex items-center gap-1">
                                                    Value <Copy className="w-2.5 h-2.5 opacity-0 group-hover/val:opacity-100 transition-opacity" />
                                                </span>
                                                <code className="text-xs bg-black/30 px-2 py-1 rounded border border-white/5 font-mono group-hover/val:border-primary/50 transition-all">
                                                    {record.value}
                                                </code>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase",
                                                record.status === "Verified" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                                            )}>
                                                {record.status === "Verified" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                {record.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="glass-panel p-6 rounded-2xl bg-linear-to-br from-primary/10 via-transparent to-transparent border-primary/20">
                            <h3 className="text-base font-bold mb-2 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-primary" /> SSL Protection
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                                NovaEdge automatically provisions and renews SSL certificates via Let's Encrypt for all connected domains.
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                                    <span className="text-xs font-medium">Automatic renewal</span>
                                    <div className="w-8 h-4 bg-primary rounded-full relative">
                                        <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full shadow-sm" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                                    <span className="text-xs font-medium">Force HTTPS</span>
                                    <div className="w-8 h-4 bg-primary rounded-full relative">
                                        <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full shadow-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl border-white/5">
                            <h3 className="text-base font-bold mb-4">Domain Insights</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold">Propagation Status</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">DNS records have propagated to 98.4% of worldwide servers.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                                        <AlertCircle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold">Health Check</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">All services are reachable from 12 global locations.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Domain"
                maxWidth="md"
            >
                <form onSubmit={handleAddDomain} className="space-y-6">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-200/80 leading-relaxed">
                            Adding a domain allows the platform to accept requests from that host. 
                            You will still need to configure your DNS records at your registrar.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Domain Name</label>
                        <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                required
                                value={newDomain}
                                onChange={(e) => setNewDomain(e.target.value)}
                                placeholder="example.com"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-3">
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Connect Domain
                        </button>
                        <button 
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
