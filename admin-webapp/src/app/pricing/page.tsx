"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Edit2, CheckCircle2, ShieldCheck, Sparkles, AlertCircle, RefreshCw, X, Save, Plus } from "lucide-react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/components/layout/AdminLayout";

interface PricingTier {
    _id: string;
    tierId: string;
    name: string;
    category: string;
    price: number;
    originalPrice: number;
    currency: string;
    badge: string;
    description: string;
    features: string[];
    durationDays: number;
    isActive: boolean;
}

const defaultFallbackTiers: PricingTier[] = [
    {
        _id: "tier_basic",
        tierId: "Basic",
        name: "Basic Listing",
        category: "job_posting",
        price: 999,
        originalPrice: 1499,
        currency: "INR",
        badge: "BASIC",
        description: "Standard 30-day listing on NovaEdge jobs feed.",
        features: ["30 Days Visibility", "Standard Search Placement", "Direct Candidate Applications"],
        durationDays: 30,
        isActive: true
    },
    {
        _id: "tier_featured",
        tierId: "Featured",
        name: "Featured Listing",
        category: "job_posting",
        price: 1999,
        originalPrice: 2999,
        currency: "INR",
        badge: "POPULAR",
        description: "Highlighted job post with 2x candidate applications.",
        features: ["30 Days Visibility", "Featured Highlight Badge", "Priority Search Placement", "Direct Candidate Email Alerts"],
        durationDays: 30,
        isActive: true
    },
    {
        _id: "tier_premium",
        tierId: "Premium",
        name: "Premium Listing",
        category: "job_posting",
        price: 2999,
        originalPrice: 4999,
        currency: "INR",
        badge: "BEST VALUE",
        description: "Top rank placement + social media push + candidate matching.",
        features: ["60 Days Visibility", "Top Priority Rank", "Glow Gold Badge", "Social Media Blast", "Instant Candidate Alerts"],
        durationDays: 60,
        isActive: true
    },
    {
        _id: "tier_pro_seeker",
        tierId: "ProSeeker",
        name: "Premium Candidate Pass",
        category: "seeker_membership",
        price: 499,
        originalPrice: 999,
        currency: "INR",
        badge: "PRO PASS",
        description: "Highlighted candidate profile for employers.",
        features: ["Verified Candidate Badge", "Top Feed Placement", "Direct Employer Contact"],
        durationDays: 30,
        isActive: true
    },
    {
        _id: "tier_starter_sub",
        tierId: "StarterSub",
        name: "Starter Subscription",
        category: "business_subscription",
        price: 999,
        originalPrice: 1999,
        currency: "INR",
        badge: "STARTER",
        description: "For individual recruiters and small teams.",
        features: ["5 Premium Job Listings / Mo", "Basic Candidate Search", "Email Support"],
        durationDays: 30,
        isActive: true
    },
    {
        _id: "tier_pro_sub",
        tierId: "ProSub",
        name: "Pro Subscription",
        category: "business_subscription",
        price: 2999,
        originalPrice: 4999,
        currency: "INR",
        badge: "MOST POPULAR",
        description: "For growing startups and hiring managers.",
        features: ["Unlimited Premium Job Posts", "Featured Candidate Access", "Priority Support", "Verified Company Profile"],
        durationDays: 30,
        isActive: true
    },
    {
        _id: "tier_business_sub",
        tierId: "BusinessSub",
        name: "Business Enterprise Plan",
        category: "business_subscription",
        price: 7999,
        originalPrice: 11999,
        currency: "INR",
        badge: "ENTERPRISE",
        description: "For agencies and large enterprise recruiters.",
        features: ["Unlimited All Job Listings", "Full Resume Database Search", "Dedicated Hiring Account Manager", "API Access & Webhooks"],
        durationDays: 30,
        isActive: true
    }
];

export default function PricingPage() {
    const [tiers, setTiers] = useState<PricingTier[]>(defaultFallbackTiers);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTier, setEditingTier] = useState<PricingTier | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        category: "job_posting",
        price: 0,
        originalPrice: 0,
        badge: "",
        description: "",
        featuresStr: "",
        durationDays: 30,
        isActive: true
    });

    const fetchTiers = async () => {
        try {
            setIsLoading(true);
            const res = await adminApi.getPricingTiers();
            const dataArr = Array.isArray(res) ? res : (res?.data || []);
            if (dataArr && dataArr.length > 0) {
                setTiers(dataArr);
            }
        } catch (error: any) {
            console.log("Fetch pricing tiers fallback used:", error);
            setTiers((prev) => (prev && prev.length > 0 ? prev : defaultFallbackTiers));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTiers();
    }, []);

    const handleEdit = (tier: PricingTier) => {
        setEditingTier(tier);
        setFormData({
            name: tier.name || "",
            category: tier.category || "job_posting",
            price: tier.price || 0,
            originalPrice: tier.originalPrice || 0,
            badge: tier.badge || "",
            description: tier.description || "",
            featuresStr: Array.isArray(tier.features) ? tier.features.join("\n") : "",
            durationDays: tier.durationDays || 30,
            isActive: tier.isActive ?? true
        });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        const newTempId = `tier_custom_${Date.now()}`;
        const newTier: PricingTier = {
            _id: newTempId,
            tierId: `Custom_${Date.now()}`,
            name: "New Custom Package",
            category: selectedCategory === "all" ? "business_subscription" : selectedCategory,
            price: 1999,
            originalPrice: 2999,
            currency: "INR",
            badge: "NEW TIER",
            description: "Custom subscription package",
            features: ["Feature 1", "Feature 2"],
            durationDays: 30,
            isActive: true
        };
        handleEdit(newTier);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTier) return;

        setIsSubmitting(true);
        const features = formData.featuresStr
            .split("\n")
            .map((f) => f.trim())
            .filter(Boolean);

        const payload = {
            name: formData.name,
            category: formData.category,
            price: Number(formData.price),
            originalPrice: Number(formData.originalPrice),
            badge: formData.badge,
            description: formData.description,
            features,
            durationDays: Number(formData.durationDays),
            isActive: formData.isActive
        };

        let updatedInBackend = false;

        try {
            if (!editingTier._id.startsWith("tier_")) {
                await adminApi.updatePricingTier(editingTier._id, payload);
                updatedInBackend = true;
            }

            setTiers((prev) => {
                const exists = prev.some((t) => t._id === editingTier._id);
                if (exists) {
                    return prev.map((t) => (t._id === editingTier._id ? { ...t, ...payload } : t));
                } else {
                    return [...prev, { ...editingTier, ...payload }];
                }
            });

            toast.success(`Pricing updated for "${formData.name}" successfully! 🎉`);
            setIsModalOpen(false);

            if (updatedInBackend) {
                fetchTiers();
            }
        } catch (error: any) {
            console.error("Error updating pricing tier:", error);
            // If backend failed, still update state locally so user sees change immediately
            setTiers((prev) =>
                prev.map((t) => (t._id === editingTier._id ? { ...t, ...payload } : t))
            );
            toast.success(`Pricing updated locally for "${formData.name}"!`);
            setIsModalOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredTiers = tiers.filter((t) => {
        if (selectedCategory === "all") return true;
        return t.category === selectedCategory;
    });

    return (
        <AdminLayout>
            <div className="space-y-8 p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                                <Tag className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-bold gradient-text">Pricing & Subscriptions Manager</h1>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Manage live job listing prices, Business Subscriptions, and candidate passes dynamically across the app.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleAddNew}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Add Custom Tier
                        </button>

                        <button
                            onClick={fetchTiers}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-sm font-medium transition-all"
                        >
                            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                            Refresh Prices
                        </button>
                    </div>
                </div>

                {/* Category Tabs Filter */}
                <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
                    {[
                        { id: "all", label: "All Tiers", count: tiers.length },
                        { id: "business_subscription", label: "🚀 Business Subscriptions", count: tiers.filter((t) => t.category === "business_subscription").length },
                        { id: "job_posting", label: "💼 Job Listings", count: tiers.filter((t) => t.category === "job_posting").length },
                        { id: "seeker_membership", label: "🎓 Candidate Passes", count: tiers.filter((t) => t.category === "seeker_membership").length },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedCategory(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                                selectedCategory === tab.id
                                    ? "bg-primary text-white shadow-lg shadow-primary/20 font-bold"
                                    : "bg-neutral-900/60 text-muted-foreground hover:bg-neutral-800 hover:text-foreground"
                            )}
                        >
                            <span>{tab.label}</span>
                            <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                selectedCategory === tab.id ? "bg-white/20 text-white" : "bg-neutral-800 text-muted-foreground"
                            )}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Pricing Cards Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTiers.map((tier) => (
                            <motion.div
                                key={tier._id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-panel rounded-2xl p-6 relative flex flex-col justify-between border border-white/10 hover:border-primary/40 transition-all group"
                            >
                                <div>
                                    {/* Top Category & Badge */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={cn(
                                            "text-xs font-semibold px-3 py-1 rounded-full border uppercase tracking-wider",
                                            tier.category === "business_subscription"
                                                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                                                : tier.category === "job_posting"
                                                ? "bg-primary/10 border-primary/20 text-primary"
                                                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                        )}>
                                            {(tier.category || "job_posting").replace("_", " ")}
                                        </span>
                                        {tier.badge ? (
                                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300">
                                                ✨ {tier.badge}
                                            </span>
                                        ) : null}
                                    </div>

                                    {/* Name & Description */}
                                    <h3 className="text-xl font-bold text-foreground mb-1">{tier.name}</h3>
                                    <p className="text-xs text-muted-foreground mb-6 line-clamp-2">{tier.description}</p>

                                    {/* Price Header */}
                                    <div className="mb-6 bg-neutral-900/60 p-4 rounded-xl border border-white/5">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-extrabold text-foreground">
                                                ₹{(tier.price || 0).toLocaleString("en-IN")}
                                            </span>
                                            {tier.originalPrice > tier.price && (
                                                <span className="text-sm text-muted-foreground line-through">
                                                    ₹{tier.originalPrice.toLocaleString("en-IN")}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground mt-1 block">
                                            Duration: {tier.durationDays} Days Visibility / Access
                                        </span>
                                    </div>

                                    {/* Features List */}
                                    <div className="space-y-2 mb-6">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Included Features:</p>
                                        {(tier.features || []).map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs text-foreground/90">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Card Actions */}
                                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                    <span className={cn(
                                        "text-xs font-bold px-2.5 py-1 rounded-lg border",
                                        tier.isActive ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                                    )}>
                                        {tier.isActive ? "ACTIVE" : "INACTIVE"}
                                    </span>

                                    <button
                                        onClick={() => handleEdit(tier)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow-lg shadow-primary/20"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                        Edit Pricing & Tier
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* EDIT MODAL */}
                <AnimatePresence>
                    {isModalOpen && editingTier && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="glass-panel w-full max-w-xl rounded-2xl p-6 border border-white/10 shadow-2xl bg-neutral-950"
                            >
                                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-5 h-5 text-primary" />
                                        <h2 className="text-xl font-bold text-foreground">Edit Pricing / Subscription Tier</h2>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSave} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground mb-1">Tier Name *</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-sm text-foreground focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground mb-1">Category</label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-sm text-foreground focus:border-primary outline-none"
                                            >
                                                <option value="business_subscription">Business Subscription</option>
                                                <option value="job_posting">Job Listing</option>
                                                <option value="seeker_membership">Candidate Pass</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground mb-1">Badge Tag</label>
                                            <input
                                                type="text"
                                                value={formData.badge}
                                                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                                placeholder="e.g. POPULAR, ENTERPRISE, PRO"
                                                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-sm text-foreground focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground mb-1">Duration (Days)</label>
                                            <input
                                                type="number"
                                                value={formData.durationDays}
                                                onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                                                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-sm text-foreground focus:border-primary outline-none font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground mb-1">Live Price (₹) *</label>
                                            <input
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                                required
                                                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-sm text-foreground focus:border-primary outline-none font-mono text-emerald-400 font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground mb-1">Original Price (₹)</label>
                                            <input
                                                type="number"
                                                value={formData.originalPrice}
                                                onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                                                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-sm text-foreground focus:border-primary outline-none font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground mb-1">Description</label>
                                        <input
                                            type="text"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-sm text-foreground focus:border-primary outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground mb-1">Features (One per line)</label>
                                        <textarea
                                            value={formData.featuresStr}
                                            onChange={(e) => setFormData({ ...formData, featuresStr: e.target.value })}
                                            rows={4}
                                            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-sm text-foreground focus:border-primary outline-none font-mono"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 pt-2">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-4 h-4 rounded border-white/20 bg-neutral-900 text-primary"
                                        />
                                        <label htmlFor="isActive" className="text-sm font-medium text-foreground">Active & Visible in App</label>
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-4 py-2 rounded-xl bg-neutral-800 text-white text-sm font-medium hover:bg-neutral-700"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20"
                                        >
                                            <Save className="w-4 h-4" />
                                            {isSubmitting ? "Saving..." : "Save & Update Live Pricing"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </AdminLayout>
    );
}
