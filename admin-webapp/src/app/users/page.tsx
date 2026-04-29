"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
    Users as UsersIcon,
    Search,
    Filter,
    MoreVertical,
    UserPlus,
    Download,
    Shield,
    UserCheck,
    UserX,
    Mail,
    Edit,
    Trash2,
    Loader2,
    RefreshCw,
    XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { adminApi, User } from "@/lib/api";
import { toast } from "sonner";

export default function UsersPage() {
    const searchParams = useSearchParams();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        blocked: 0
    });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newUserFormData, setNewUserFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "user",
        plan: "free"
    });

    // Sync with URL q parameter
    useEffect(() => {
        const q = searchParams.get("q") || "";
        setSearchTerm(q);
    }, [searchParams]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await adminApi.getUsers();
            if (response.success) {
                setUsers(response.users);

                // Calculate stats
                setStats({
                    total: response.users.length,
                    active: response.users.filter((u: User) => u.isActive).length,
                    blocked: response.users.filter((u: User) => !u.isActive).length
                });
            }
        } catch (error: unknown) {
            toast.error("Failed to fetch users: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateUser = async (userId: string, data: Partial<User>) => {
        try {
            const response = await adminApi.updateUser(userId, data);
            if (response.success) {
                toast.success(response.message || "User updated successfully");
                fetchUsers(); // Refresh list
            }
        } catch (error: unknown) {
            toast.error("Update failed: " + (error instanceof Error ? error.message : "Unknown error"));
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to delete ${userName}? This action is permanent.`)) return;

        try {
            const response = await adminApi.deleteUser(userId);
            if (response.success) {
                toast.success(response.message || "User deleted successfully");
                fetchUsers();
            }
        } catch (error: unknown) {
            toast.error("Deletion failed: " + (error instanceof Error ? error.message : "Unknown error"));
        }
    };
    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const response = await adminApi.createUser(newUserFormData);
            if (response.success) {
                toast.success("User created successfully");
                setIsAddModalOpen(false);
                setNewUserFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    password: "",
                    role: "user",
                    plan: "free"
                });
                fetchUsers();
            }
        } catch (error: unknown) {
            toast.error("Failed to create user: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExport = () => {
        try {
            const headers = ["ID", "Name", "Email", "Role", "Plan", "Status", "Joined At"];
            const rows = filteredUsers.map(u => [
                u._id,
                `${u.firstName} ${u.lastName}`,
                u.email,
                u.role,
                u.plan || "free",
                u.isActive ? "Active" : "Blocked",
                new Date(u.createdAt).toISOString()
            ]);

            const csvContent = [
                headers.join(","),
                ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
            ].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("User directory exported successfully");
        } catch (error: unknown) {
            toast.error("Export failed: " + (error instanceof Error ? error.message : "Unknown error"));
        }
    };

    const handleMail = (email: string) => {
        window.location.href = `mailto:${email}`;
    };

    const filteredUsers = users.filter(user =>
        (user.firstName?.toLowerCase() + " " + user.lastName?.toLowerCase()).includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading && users.length === 0) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[500px]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-muted-foreground animate-pulse">Fetching user directory...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">User Management</h1>
                        <p className="text-muted-foreground">Manage platform users, roles, and permissions.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 bg-neutral-900 border border-border rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" /> Export
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                        >
                            <UserPlus className="w-4 h-4" /> Add User
                        </button>

                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/10">
                            <UsersIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold">Total Users</p>
                            <p className="text-xl font-bold">{stats.total}</p>
                        </div>
                    </div>
                    <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/10">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold">Active Users</p>
                            <p className="text-xl font-bold">{stats.active}</p>
                        </div>
                    </div>
                    <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/10">
                            <UserX className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold">Blocked/Inactive</p>
                            <p className="text-xl font-bold">{stats.blocked}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                    <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-black/40 border border-border rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchUsers}
                                className="p-2.5 bg-neutral-900 border border-border rounded-xl hover:bg-neutral-800 transition-colors"
                            >
                                <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isLoading && "animate-spin")} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto text-outfit">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-900/50 text-muted-foreground border-b border-border">
                                    <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-tighter">Identity</th>
                                    <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-tighter">Plan & Role</th>
                                    <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-tighter">Status</th>
                                    <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-tighter">Joined Date</th>
                                    <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-tighter text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="group hover:bg-primary/2 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-border flex items-center justify-center font-bold text-sm text-primary transition-all group-hover:scale-105 group-hover:border-primary/20">
                                                    {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold tracking-tight">{user.firstName} {user.lastName}</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase px-2 py-0.5 rounded border leading-none",
                                                        user.role === "admin" ? "bg-purple-500/10 border-purple-500/20 text-purple-500" : "bg-neutral-800 border-border text-muted-foreground"
                                                    )}>
                                                        {user.role}
                                                    </span>
                                                </div>
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase px-2 py-0.5 rounded border w-fit leading-none",
                                                    user.plan === "business" ? "bg-primary/10 border-primary/20 text-primary" : "bg-neutral-800 border-border text-muted-foreground"
                                                )}>
                                                    {user.plan || "free"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleUpdateUser(user._id, { isActive: !user.isActive })}
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all hover:scale-105",
                                                    user.isActive ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    user.isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500"
                                                )} />
                                                {user.isActive ? "Active" : "Blocked"}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleUpdateUser(user._id, { role: e.target.value })}
                                                    className="bg-neutral-900 border border-border text-[10px] font-bold rounded-lg px-2 py-1 focus:outline-none"
                                                >
                                                    <option value="user">User</option>
                                                    <option value="moderator">Moderator</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                <button
                                                    onClick={() => handleMail(user.email)}
                                                    className="p-2 rounded-lg hover:bg-neutral-800 text-muted-foreground hover:text-foreground transition-all"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user._id, `${user.firstName} ${user.lastName}`)}
                                                    className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 bg-neutral-900/20 border-t border-border flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Showing {filteredUsers.length} node(s)</p>
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 text-[10px] font-black uppercase bg-neutral-900 border border-border rounded-xl disabled:opacity-30 transition-all hover:bg-neutral-800" disabled>Previous</button>
                            <button className="px-4 py-2 text-[10px] font-black uppercase bg-neutral-900 border border-border rounded-xl disabled:opacity-30 transition-all hover:bg-neutral-800" disabled>Next</button>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-md"
                            onClick={() => setIsAddModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden relative shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <UserPlus className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Register New Node</h2>
                                        <p className="text-xs text-muted-foreground">Add a new user to the platform directory</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsAddModalOpen(false)}>
                                    <XCircle className="w-6 h-6 text-muted-foreground hover:text-white transition-colors" />
                                </button>
                            </div>

                            <form onSubmit={handleAddUser} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">First Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={newUserFormData.firstName}
                                            onChange={(e) => setNewUserFormData({ ...newUserFormData, firstName: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={newUserFormData.lastName}
                                            onChange={(e) => setNewUserFormData({ ...newUserFormData, lastName: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={newUserFormData.email}
                                        onChange={(e) => setNewUserFormData({ ...newUserFormData, email: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Initial Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={newUserFormData.password}
                                        onChange={(e) => setNewUserFormData({ ...newUserFormData, password: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Role</label>
                                        <select
                                            value={newUserFormData.role}
                                            onChange={(e) => setNewUserFormData({ ...newUserFormData, role: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                        >
                                            <option value="user">User</option>
                                            <option value="moderator">Moderator</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Plan</label>
                                        <select
                                            value={newUserFormData.plan}
                                            onChange={(e) => setNewUserFormData({ ...newUserFormData, plan: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                        >
                                            <option value="free">Free</option>
                                            <option value="pro">Pro</option>
                                            <option value="business">Business</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 h-11 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all text-xs uppercase"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-2 h-11 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 text-xs uppercase"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            "Add User to Directory"
                                        )}
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
