"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingBag,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    Eye,
    Download,
    CheckCircle2,
    XCircle,
    Loader2,
    Image as ImageIcon,
    FileArchive,
    ExternalLink
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/components/layout/AdminLayout";


interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    zipUrl: string;
    isActive: boolean;
    totalSales: number;
    averageRating: number;
    tags?: string[];
    features?: string[];
    createdAt: string;
}

export default function StorePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: "asc" | "desc" } | null>({ key: "createdAt", direction: "desc" });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: 0,
        category: "ui-kit",
        images: [""],
        zipUrl: "",
        zipPublicId: "manual-entry",
        isActive: true,
        tags: "",
        features: ""
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await adminApi.getProducts();
            if (response.success) {
                setProducts(response.products);
            }
        } catch (error: any) {
            toast.error("Failed to fetch products: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (product: Product | null = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                title: product.title,
                description: product.description,
                price: product.price,
                category: product.category,
                images: product.images,
                zipUrl: product.zipUrl,
                zipPublicId: "stored",
                isActive: product.isActive,
                tags: product.tags ? product.tags.join(", ") : "",
                features: product.features ? product.features.join("\n") : ""
            });
        } else {
            setEditingProduct(null);
            setFormData({
                title: "",
                description: "",
                price: 0,
                category: "ui-kit",
                images: [""],
                zipUrl: "",
                zipPublicId: "manual-entry",
                isActive: true,
                tags: "",
                features: ""
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const data = {
                ...formData,
                images: formData.images.filter(img => img.trim() !== ""),
                tags: formData.tags.split(",").map(t => t.trim()).filter(t => t !== ""),
                features: formData.features.split("\n").map(f => f.trim()).filter(f => f !== "")
            };

            if (editingProduct) {
                const response = await adminApi.updateProduct(editingProduct._id, data);
                if (response.success) {
                    toast.success("Asset updated successfully");
                    fetchProducts();
                    setIsModalOpen(false);
                }
            } else {
                const response = await adminApi.createProduct(data);
                if (response.success) {
                    toast.success("Asset created successfully");
                    fetchProducts();
                    setIsModalOpen(false);
                }
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this asset? This action cannot be undone.")) return;

        try {
            const response = await adminApi.deleteProduct(id);
            if (response.success) {
                toast.success("Asset deleted");
                setProducts(products.filter(p => p._id !== id));
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleCopyId = (id: string) => {
        navigator.clipboard.writeText(id);
        toast.success("Product ID copied to clipboard");
        setActiveActionMenu(null);
    };

    const handleViewInStore = (id: string) => {
        window.open(`https://novaedgedigitallabs.in/store/asset/${id}`, "_blank");
        setActiveActionMenu(null);
    };

    const filteredProducts = products
        .filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
            const matchesStatus = statusFilter === "all" || 
                (statusFilter === "active" && p.isActive) || 
                (statusFilter === "draft" && !p.isActive);
            return matchesSearch && matchesCategory && matchesStatus;
        })
        .sort((a, b) => {
            if (!sortConfig) return 0;
            const { key, direction } = sortConfig;
            const aValue = a[key];
            const bValue = b[key];

            if (aValue === undefined || bValue === undefined) return 0;

            if (typeof aValue === "string" && typeof bValue === "string") {
                return direction === "asc" 
                    ? aValue.localeCompare(bValue) 
                    : bValue.localeCompare(aValue);
            }

            if (aValue < bValue) return direction === "asc" ? -1 : 1;
            if (aValue > bValue) return direction === "asc" ? 1 : -1;
            return 0;
        });

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredProducts.length && filteredProducts.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredProducts.map(p => p._id)));
        }
    };

    const toggleSelectOne = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleSort = (key: keyof Product) => {
        setSortConfig(prev => ({
            key,
            direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc"
        }));
    };

    const handleBulkDelete = async () => {
        const idsToDelete = Array.from(selectedIds);
        if (!confirm(`Are you sure you want to delete ${idsToDelete.length} assets?`)) return;
        
        const deletePromise = async () => {
            for (const id of idsToDelete) {
                await adminApi.deleteProduct(id);
            }
            fetchProducts();
            setSelectedIds(new Set());
        };

        toast.promise(deletePromise(), {
            loading: `Deleting ${idsToDelete.length} assets...`,
            success: `Successfully deleted ${idsToDelete.length} assets`,
            error: (err) => `Failed to delete some assets: ${err.message}`
        });
    };

    const handleBulkStatusUpdate = async (isActive: boolean) => {
        const idsToUpdate = Array.from(selectedIds);
        const action = isActive ? "activating" : "deactivating";
        
        const updatePromise = async () => {
            for (const id of idsToUpdate) {
                await adminApi.updateProduct(id, { isActive });
            }
            fetchProducts();
            setSelectedIds(new Set());
        };

        toast.promise(updatePromise(), {
            loading: `Updating ${idsToUpdate.length} assets...`,
            success: `Successfully updated ${idsToUpdate.length} assets`,
            error: (err) => `Failed to update some assets: ${err.message}`
        });
    };



    const categories = ["all", "ui-kit", "landing-page", "figma-kit", "resume", "invoice", "other"];

    return (
        <AdminLayout>

        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Digital Store</h1>
                    <p className="text-muted-foreground">Manage your premium digital assets and templates.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    New Premium Asset
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Assets", value: products.length, icon: ShoppingBag, color: "text-blue-500" },
                    { label: "Active Items", value: products.filter(p => p.isActive).length, icon: CheckCircle2, color: "text-green-500" },
                    { label: "Avg. Price", value: `$${(products.reduce((acc, p) => acc + p.price, 0) / (products.length || 1)).toFixed(2)}`, icon: ShoppingBag, color: "text-purple-500" },
                    { label: "Total Sales", value: products.reduce((acc, p) => acc + (p.totalSales || 0), 0), icon: Download, color: "text-orange-500" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel p-5 rounded-2xl border-white/5"
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-xl bg-white/5", stat.color)}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Table Area */}
            <div className="glass-panel rounded-3xl overflow-hidden border-white/5">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search assets by name or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 relative">
                        {selectedIds.size > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 mr-4 bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20"
                            >
                                <span className="text-[10px] font-bold text-primary whitespace-nowrap">{selectedIds.size} Selected</span>
                                <div className="h-4 w-px bg-primary/20 mx-1" />
                                <button 
                                    onClick={() => handleBulkStatusUpdate(true)}
                                    className="p-1 hover:text-green-500 transition-colors"
                                    title="Make Active"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleBulkStatusUpdate(false)}
                                    className="p-1 hover:text-orange-500 transition-colors"
                                    title="Make Draft"
                                >
                                    <XCircle className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={handleBulkDelete}
                                    className="p-1 hover:text-red-500 transition-colors"
                                    title="Delete Selected"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}

                        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 mr-2">
                            {["all", "active", "draft"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                        statusFilter === status 
                                            ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                            : "text-muted-foreground hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={cn(
                                "p-2 border border-white/10 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-2 text-xs font-medium",
                                selectedCategory !== "all" && "bg-primary/10 border-primary/20 text-primary"
                            )}
                        >
                            <Filter className="w-4 h-4" />
                            {selectedCategory !== "all" && <span className="capitalize">{selectedCategory.replace("-", " ")}</span>}
                        </button>


                        <AnimatePresence>
                            {isFilterOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-2 w-48 bg-[#121212] border border-white/10 rounded-xl shadow-2xl z-20 p-2 overflow-hidden"
                                    >
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => {
                                                    setSelectedCategory(cat);
                                                    setIsFilterOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full text-left px-3 py-2 rounded-lg text-xs capitalize transition-colors hover:bg-white/5",
                                                    selectedCategory === cat ? "text-primary font-bold bg-primary/5" : "text-muted-foreground"
                                                )}
                                            >
                                                {cat.replace("-", " ")}
                                            </button>
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                                <th className="px-6 py-4 w-10">
                                    <button 
                                        onClick={toggleSelectAll}
                                        className={cn(
                                            "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                            selectedIds.size === filteredProducts.length && filteredProducts.length > 0
                                                ? "bg-primary border-primary text-white"
                                                : "border-white/10 hover:border-white/20"
                                        )}
                                    >
                                        {selectedIds.size === filteredProducts.length && filteredProducts.length > 0 && <CheckCircle2 className="w-3 h-3" />}
                                    </button>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("title")}>
                                    <div className="flex items-center gap-2">
                                        Identity
                                        {sortConfig?.key === "title" && (
                                            <span className="text-primary">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("price")}>
                                    <div className="flex items-center gap-2">
                                        Price
                                        {sortConfig?.key === "price" && (
                                            <span className="text-primary">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("category")}>
                                    Category
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("totalSales")}>
                                    <div className="flex items-center gap-2">
                                        Sales
                                        {sortConfig?.key === "totalSales" && (
                                            <span className="text-primary">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("isActive")}>
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8">
                                            <div className="h-4 bg-white/5 rounded-full w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                                        No assets found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product._id} className={cn(
                                        "hover:bg-white/2 transition-colors group",
                                        selectedIds.has(product._id) && "bg-primary/5"
                                    )}>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => toggleSelectOne(product._id)}
                                                className={cn(
                                                    "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                                    selectedIds.has(product._id)
                                                        ? "bg-primary border-primary text-white"
                                                        : "border-white/10 hover:border-white/20"
                                                )}
                                            >
                                                {selectedIds.has(product._id) && <CheckCircle2 className="w-3 h-3" />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">

                                                <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden border border-white/10 flex items-center justify-center shrink-0">
                                                    {product.images[0] ? (
                                                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-sm truncate">{product.title}</p>
                                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-primary">${product.price.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            {product.totalSales || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {product.isActive ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-green-500 font-bold">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                                        Active
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold italic">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                                                        Draft
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(product)}
                                                    className="p-2 hover:bg-primary/10 hover:text-primary transition-colors rounded-lg"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="p-2 hover:bg-red-500/10 hover:text-red-500 transition-colors rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <div className="relative">
                                                    <button 
                                                        onClick={() => setActiveActionMenu(activeActionMenu === product._id ? null : product._id)}
                                                        className={cn(
                                                            "p-2 text-muted-foreground hover:text-white transition-colors rounded-lg",
                                                            activeActionMenu === product._id && "bg-white/5 text-white"
                                                        )}
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>

                                                    <AnimatePresence>
                                                        {activeActionMenu === product._id && (
                                                            <>
                                                                <div className="fixed inset-0 z-10" onClick={() => setActiveActionMenu(null)} />
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.95, x: 10 }}
                                                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                                                    exit={{ opacity: 0, scale: 0.95, x: 10 }}
                                                                    className="absolute right-full mr-2 top-0 w-48 bg-[#121212] border border-white/10 rounded-xl shadow-2xl z-20 p-2 overflow-hidden"
                                                                >
                                                                    <button
                                                                        onClick={() => handleViewInStore(product._id)}
                                                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                        View in Store
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleCopyId(product._id)}
                                                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                                                                    >
                                                                        <ExternalLink className="w-4 h-4" />
                                                                        Copy Product ID
                                                                    </button>
                                                                    <div className="my-1 border-t border-white/5" />
                                                                    <button
                                                                        onClick={() => {
                                                                            handleOpenModal(product);
                                                                            setActiveActionMenu(null);
                                                                        }}
                                                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                        Edit Details
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            handleDelete(product._id);
                                                                            setActiveActionMenu(null);
                                                                        }}
                                                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                        Delete Asset
                                                                    </button>
                                                                </motion.div>
                                                            </>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-md"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#121212] border border-white/10 rounded-4xl w-full max-w-2xl overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <ShoppingBag className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">{editingProduct ? "Edit Asset" : "Create New Premium Asset"}</h2>
                                        <p className="text-xs text-muted-foreground">Define digital properties and licensing</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-white/5 rounded-full"
                                >
                                    <XCircle className="w-6 h-6 text-muted-foreground hover:text-white transition-colors" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="overflow-y-auto p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2 md:col-span-1 space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Asset Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Standard Nova Template"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1 space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Price (USD)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-8 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                                        <textarea
                                            required
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="High-performance dashboard template..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                        />
                                    </div>

                                    <div className="col-span-1 space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                                        >
                                            <option value="ui-kit">UI Kit</option>
                                            <option value="landing-page">Landing Page</option>
                                            <option value="figma-kit">Figma Kit</option>
                                            <option value="resume">Resume Template</option>
                                            <option value="invoice">Invoice Template</option>
                                            <option value="other">Other Asset</option>
                                        </select>
                                    </div>

                                    <div className="col-span-1 space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</label>
                                        <div className="flex items-center gap-4 h-[50px]">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                                className={cn(
                                                    "w-12 h-6 rounded-full transition-colors relative",
                                                    formData.isActive ? "bg-green-500" : "bg-neutral-800"
                                                )}
                                            >
                                                <div className={cn(
                                                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                                    formData.isActive ? "left-[26px]" : "left-1"
                                                )} />
                                            </button>
                                            <span className="text-sm font-medium">{formData.isActive ? "Visible in Store" : "Hidden / Draft"}</span>
                                        </div>
                                    </div>

                                    <div className="col-span-2 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Preview Images (URLs)</label>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, images: [...formData.images, ""] })}
                                                className="text-[10px] font-bold text-primary uppercase hover:underline"
                                            >
                                                Add Image Slot
                                            </button>
                                        </div>
                                        {formData.images.map((img, idx) => (
                                            <div key={idx} className="relative group">
                                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="url"
                                                    value={img}
                                                    onChange={(e) => {
                                                        const newImages = [...formData.images];
                                                        newImages[idx] = e.target.value;
                                                        setFormData({ ...formData, images: newImages });
                                                    }}
                                                    placeholder="https://cloudinary.com/v1/..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                                />
                                                {formData.images.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) });
                                                        }}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-red-500"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <FileArchive className="w-3 h-3" />
                                            Source File (Zip Link)
                                        </label>
                                        <div className="relative">
                                            <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="url"
                                                required
                                                value={formData.zipUrl}
                                                onChange={(e) => setFormData({ ...formData, zipUrl: e.target.value })}
                                                placeholder="https://storage.novaedge.io/files/..."
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tags (Comma separated)</label>
                                        <input
                                            type="text"
                                            value={formData.tags}
                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                            placeholder="react, tailwind, dashboard"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                        />
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Features (One per line)</label>
                                        <textarea
                                            rows={4}
                                            value={formData.features}
                                            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                            placeholder="Responsive Design&#10;Dark Mode Support&#10;Customizable Theme"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5 flex gap-3 sticky bottom-0 bg-[#121212] pb-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 h-12 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-2 h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            editingProduct ? "Update Portfolio Asset" : "Deploy to Digital Store"
                                        )}
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

