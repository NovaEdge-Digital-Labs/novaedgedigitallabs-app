"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Plus, Search, Edit2, Trash2, Loader2, XCircle, Star, Eye, EyeOff, GripVertical } from "lucide-react";
import { adminApi, Service } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/components/layout/AdminLayout";

const CATEGORIES = [
    { value: "web-development", label: "Web Development" },
    { value: "app-development", label: "App Development" },
    { value: "ui-ux-design", label: "UI/UX Design" },
    { value: "cloud-devops", label: "Cloud & DevOps" },
    { value: "ai-ml", label: "AI / ML" },
    { value: "digital-marketing", label: "Digital Marketing" },
    { value: "consulting", label: "Consulting" },
    { value: "other", label: "Other" },
];

const PRICING_MODELS = [
    { value: "fixed", label: "Fixed Price" },
    { value: "hourly", label: "Hourly" },
    { value: "project-based", label: "Project Based" },
    { value: "custom", label: "Custom Quote" },
];

const emptyForm = {
    title: "", shortDescription: "", description: "", icon: "Code", category: "web-development",
    pricing: { startingPrice: 0, currency: "INR", model: "project-based" as string },
    features: [] as string[], technologies: [] as string[], deliverables: [] as string[],
    thumbnail: "", estimatedDuration: "2-4 weeks", isActive: true, isFeatured: false, order: 0,
};

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [formData, setFormData] = useState(emptyForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tagInputs, setTagInputs] = useState({ features: "", technologies: "", deliverables: "" });

    const fetchServices = async () => {
        try {
            setIsLoading(true);
            const res = await adminApi.getServices();
            setServices(res.services || []);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to fetch services";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchServices(); }, []);

    const openCreateModal = () => {
        setEditingService(null);
        setFormData(emptyForm);
        setTagInputs({ features: "", technologies: "", deliverables: "" });
        setIsModalOpen(true);
    };

    const openEditModal = (service: Service) => {
        setEditingService(service);
        setFormData({
            title: service.title, shortDescription: service.shortDescription, description: service.description,
            icon: service.icon || "Code", category: service.category,
            pricing: service.pricing || { startingPrice: 0, currency: "INR", model: "project-based" },
            features: service.features || [], technologies: service.technologies || [],
            deliverables: service.deliverables || [], thumbnail: service.thumbnail || "",
            estimatedDuration: service.estimatedDuration || "Custom",
            isActive: service.isActive, isFeatured: service.isFeatured, order: service.order || 0,
        });
        setTagInputs({ features: "", technologies: "", deliverables: "" });
        setIsModalOpen(true);
    };

    const handleAddTag = (field: "features" | "technologies" | "deliverables", e: React.KeyboardEvent) => {
        if (e.key === "Enter" && tagInputs[field].trim()) {
            e.preventDefault();
            setFormData(prev => ({ ...prev, [field]: [...prev[field], tagInputs[field].trim()] }));
            setTagInputs(prev => ({ ...prev, [field]: "" }));
        }
    };

    const removeTag = (field: "features" | "technologies" | "deliverables", idx: number) => {
        setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingService) {
                await adminApi.updateService(editingService._id, formData);
                toast.success("Service updated successfully");
            } else {
                await adminApi.createService(formData);
                toast.success("Service created successfully");
            }
            setIsModalOpen(false);
            fetchServices();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Operation failed";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"? This action cannot be undone.`)) return;
        try {
            await adminApi.deleteService(id);
            toast.success("Service deleted");
            fetchServices();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Delete failed";
            toast.error(message);
        }
    };

    const toggleActive = async (service: Service) => {
        try {
            await adminApi.updateService(service._id, { isActive: !service.isActive });
            toast.success(`Service ${service.isActive ? "deactivated" : "activated"}`);
            fetchServices();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Update failed";
            toast.error(message);
        }
    };

    const filteredServices = services.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[500px]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-muted-foreground animate-pulse">Loading services...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Services</h1>
                        <p className="text-muted-foreground">Manage your service offerings and pricing.</p>
                    </div>
                    <button onClick={openCreateModal} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4" /> New Service
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: "Total Services", value: services.length, color: "text-blue-500" },
                        { label: "Active", value: services.filter(s => s.isActive).length, color: "text-green-500" },
                        { label: "Featured", value: services.filter(s => s.isFeatured).length, color: "text-purple-500" },
                    ].map((stat) => (
                        <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-5 rounded-2xl">
                            <div className="flex items-center gap-4">
                                <div className={cn("p-3 rounded-xl bg-white/5", stat.color)}><Briefcase className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                                    <p className="text-2xl font-black">{stat.value}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Search + Table */}
                <div className="glass-panel rounded-3xl overflow-hidden border-white/5">
                    <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input type="text" placeholder="Search services..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-900/50 text-muted-foreground border-b border-white/5">
                                    <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-tighter">Service</th>
                                    <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-tighter">Category</th>
                                    <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-tighter">Pricing</th>
                                    <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-tighter">Status</th>
                                    <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-tighter text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredServices.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">No services found. Create your first service offering.</td></tr>
                                ) : filteredServices.map((service) => (
                                    <tr key={service._id} className="group hover:bg-primary/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                                    <Briefcase className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold truncate max-w-[200px] flex items-center gap-2">
                                                        {service.title}
                                                        {service.isFeatured && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground truncate max-w-[250px]">{service.shortDescription}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border bg-white/5 border-white/10 text-muted-foreground">
                                                {CATEGORIES.find(c => c.value === service.category)?.label || service.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            {service.pricing?.startingPrice ? `₹${service.pricing.startingPrice.toLocaleString()}+` : "Custom"}
                                            <span className="text-[10px] text-muted-foreground ml-1">({service.pricing?.model})</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => toggleActive(service)} className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all hover:scale-105",
                                                service.isActive ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                                            )}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full", service.isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500")} />
                                                {service.isActive ? "Active" : "Inactive"}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEditModal(service)} className="p-2 rounded-lg hover:bg-neutral-800 text-muted-foreground hover:text-foreground transition-all"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(service._id, service.title)} className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#121212] z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary"><Briefcase className="w-5 h-5" /></div>
                                    <div>
                                        <h2 className="text-xl font-bold">{editingService ? "Edit Service" : "New Service"}</h2>
                                        <p className="text-xs text-muted-foreground">{editingService ? "Update service details" : "Create a new service offering"}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)}><XCircle className="w-6 h-6 text-muted-foreground hover:text-white transition-colors" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Title *</label>
                                        <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                                    </div>
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Short Description *</label>
                                        <input type="text" required maxLength={200} value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                                    </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category *</label>
                                                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none text-sm">
                                                    {CATEGORIES.map(c => <option key={c.value} value={c.value} className="bg-[#121212]">{c.label}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Icon Name</label>
                                                <div className="relative">
                                                    <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                                    <input type="text" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 focus:outline-none text-sm" placeholder="e.g. Code, Database, Layout" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pricing Model</label>
                                                <select value={formData.pricing.model} onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, model: e.target.value } })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none text-sm">
                                                    {PRICING_MODELS.map(p => <option key={p.value} value={p.value} className="bg-[#121212]">{p.label}</option>)}
                                                </select>
                                            </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Starting Price (₹)</label>
                                        <input type="number" min={0} value={formData.pricing.startingPrice} onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, startingPrice: Number(e.target.value) } })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none text-sm" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Est. Duration</label>
                                        <input type="text" value={formData.estimatedDuration} onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none text-sm" placeholder="e.g. 2-4 weeks" />
                                    </div>
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Description *</label>
                                        <textarea required rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none" />
                                    </div>

                                    {/* Tag Inputs */}
                                    {(["features", "technologies", "deliverables"] as const).map(field => (
                                        <div key={field} className="col-span-2 space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{field} (Enter to add)</label>
                                            <input type="text" value={tagInputs[field]} onChange={(e) => setTagInputs({ ...tagInputs, [field]: e.target.value })} onKeyDown={(e) => handleAddTag(field, e)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none text-sm" placeholder={`Add ${field}...`} />
                                            {formData[field].length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                    {formData[field].map((tag, i) => (
                                                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-lg text-xs font-medium">
                                                            {tag}
                                                            <button type="button" onClick={() => removeTag(field, i)} className="hover:text-red-400">×</button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Thumbnail URL</label>
                                        <input type="text" value={formData.thumbnail} onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none text-sm" />
                                    </div>

                                    <div className="col-span-2 flex items-center gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="accent-primary w-4 h-4" />
                                            <span className="text-sm font-medium">Active</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="accent-primary w-4 h-4" />
                                            <span className="text-sm font-medium">Featured</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex gap-3">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-11 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-xs uppercase transition-all">Cancel</button>
                                    <button type="submit" disabled={isSubmitting} className="flex-[2] h-11 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 text-xs uppercase">
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingService ? "Save Changes" : "Create Service"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}
