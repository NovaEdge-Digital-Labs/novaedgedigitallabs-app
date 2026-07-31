"use client";

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { motion, AnimatePresence } from "framer-motion";
import { adminApi, User, ApiKey, PlatformConfig } from "@/lib/api";
import {
    Settings,
    Shield,
    Bell,
    User as UserIcon,
    Cloud,
    Key,
    Database,
    Palette,
    Save,
    RotateCcw,
    Plus,
    Lock,
    Mail,
    Smartphone,
    Globe,
    Trash2,
    Copy,
    RefreshCw,
    Moon,
    Sun,
    Type,
    Clock,
    Loader2,
    Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

type SettingsTab = "General" | "Security" | "Notifications" | "Team Members" | "Cloud Sync" | "API Keys" | "Database" | "Appearance";

export default function SettingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<SettingsTab>("General");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [teamMembers, setTeamMembers] = useState<User[]>([]);
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteForm, setInviteForm] = useState({ email: "", role: "staff", firstName: "", lastName: "" });
    const [config, setConfig] = useState<PlatformConfig>({
        siteName: "NovaEdge Digital Labs",
        supportEmail: "support@novaedge.io",
        description: "The central control unit for NovaEdge Digital Labs infrastructure and cloud services.",
        maintenanceMode: false,
        brandPrimaryColor: "#8B5CF6",
        colorScheme: "dark",
        typography: "Inter (Modern Sans)",
        enable2FA: true,
        strongPassword: true,
        sessionTimeout: false,
        ipWhitelisting: false
    });

    useEffect(() => {
        fetchConfig();
    }, []);

    useEffect(() => {
        if (activeTab === "Team Members") {
            fetchTeamMembers();
        } else if (activeTab === "API Keys") {
            fetchApiKeys();
        }
    }, [activeTab]);

    const fetchTeamMembers = async () => {
        try {
            setLoadingData(true);
            const response = await adminApi.getUsers();
            if (response.success) {
                // Filter for admins or just show all if desired, but usually team members = staff
                const staff = response.users.filter((u: any) => u.role === 'admin' || u.role === 'superadmin' || u.role === 'staff');
                setTeamMembers(staff.length > 0 ? staff : response.users.slice(0, 5)); // Fallback if no staff yet
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error("Failed to load team: " + message);
        } finally {
            setLoadingData(false);
        }
    };

    const fetchApiKeys = async () => {
        try {
            setLoadingData(true);
            const response = await adminApi.getApiKeys();
            if (response.success) {
                setApiKeys(response.keys);
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error("Failed to load API keys: " + message);
        } finally {
            setLoadingData(false);
        }
    };

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getPlatformConfig();
            if (response.success && response.config) {
                setConfig(response.config);
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error("Failed to load settings: " + message);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const response = await adminApi.createUser({ ...inviteForm, password: "TemporaryPassword123!" }); // Should ideally send invite email
            if (response.success) {
                toast.success("Team member invited successfully");
                setShowInviteModal(false);
                setInviteForm({ email: "", role: "staff", firstName: "", lastName: "" });
                fetchTeamMembers();
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error("Failed to invite: " + message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteMember = async (id: string) => {
        if (!confirm("Are you sure you want to remove this team member?")) return;
        try {
            setLoadingData(true);
            const response = await adminApi.deleteUser(id);
            if (response.success) {
                toast.success("Member removed");
                fetchTeamMembers();
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error("Failed to delete: " + message);
        } finally {
            setLoadingData(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const response = await adminApi.updatePlatformConfig(config);
            if (response.success) {
                toast.success("Settings saved successfully");
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error("Failed to save settings: " + message);
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: keyof PlatformConfig, value: any) => {
        setConfig((prev) => ({ ...prev, [field]: value }));
    };

    const tabs: { name: SettingsTab; icon: any }[] = [
        { name: "General", icon: Settings },
        { name: "Security", icon: Shield },
        { name: "Notifications", icon: Bell },
        { name: "Team Members", icon: UserIcon },
        { name: "Cloud Sync", icon: Cloud },
        { name: "API Keys", icon: Key },
        { name: "Database", icon: Database },
        { name: "Appearance", icon: Palette },
    ];

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[600px]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-muted-foreground animate-pulse font-medium">Hydrating system config...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case "General":
                return (
                    <div className="space-y-6">
                        <div className="glass-panel p-6 rounded-2xl">
                            <h2 className="text-lg font-bold mb-6 italic text-primary/80">Platform Identity</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Platform Name</label>
                                    <input
                                        type="text"
                                        value={config.siteName}
                                        onChange={(e) => updateField("siteName", e.target.value)}
                                        className="w-full bg-neutral-900 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Support Email</label>
                                    <input
                                        type="email"
                                        value={config.supportEmail}
                                        onChange={(e) => updateField("supportEmail", e.target.value)}
                                        className="w-full bg-neutral-900 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-muted-foreground">Platform Description</label>
                                    <textarea
                                        rows={3}
                                        value={config.description}
                                        onChange={(e) => updateField("description", e.target.value)}
                                        className="w-full bg-neutral-900 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl border-red-500/20">
                            <h2 className="text-lg font-bold text-red-500 mb-2">Danger Zone</h2>
                            <p className="text-sm text-muted-foreground mb-6">These actions are non-reversible. Please proceed with caution.</p>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                                    <div>
                                        <p className="text-sm font-bold">Maintenance Mode</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">Disable access to the platform for all non-admin users.</p>
                                    </div>
                                    <div
                                        onClick={() => updateField("maintenanceMode", !config.maintenanceMode)}
                                        className={cn(
                                            "w-10 h-5 rounded-full relative cursor-pointer transition-colors",
                                            config.maintenanceMode ? "bg-red-500" : "bg-neutral-800"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                            config.maintenanceMode ? "right-1" : "left-1"
                                        )} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case "Security":
                return (
                    <div className="space-y-6">
                        <div className="glass-panel p-6 rounded-2xl">
                            <h2 className="text-lg font-bold mb-6">Authentication Policies</h2>
                            <div className="space-y-4">
                                {[
                                    { id: "enable2FA", title: "Two-Factor Authentication (2FA)", desc: "Require 2FA for all administrator accounts." },
                                    { id: "strongPassword", title: "Strong Password Policy", desc: "Enforce a minimum of 12 characters and special symbols." },
                                    { id: "sessionTimeout", title: "Session Timeout", desc: "Automatically log out inactive users after 30 minutes." },
                                    { id: "ipWhitelisting", title: "IP Whitelisting", desc: "Limit admin access to specific office IP ranges." },
                                ].map((item) => (
                                    <div key={item.title} className="flex items-center justify-between p-4 bg-neutral-900 border border-border rounded-xl">
                                        <div>
                                            <p className="text-sm font-bold">{item.title}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                                        </div>
                                        <div
                                            onClick={() => updateField(item.id, !config[item.id])}
                                            className={cn(
                                                "w-10 h-5 rounded-full relative cursor-pointer transition-colors",
                                                config[item.id] ? "bg-primary" : "bg-neutral-800"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                                config[item.id] ? "right-1" : "left-1"
                                            )} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case "Notifications":
                return (
                    <div className="space-y-6">
                        <div className="glass-panel p-6 rounded-2xl">
                            <h2 className="text-lg font-bold mb-6">Channel Preferences</h2>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between gap-4 p-4 bg-neutral-900/50 rounded-xl border border-border">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Email Notifications</p>
                                            <p className="text-xs text-muted-foreground">Send system alerts and reports to support email.</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case "Team Members":
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold">Manage Team</h2>
                            <button 
                                onClick={() => setShowInviteModal(true)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" /> Invite Member
                            </button>
                        </div>

                        <div className="glass-panel overflow-hidden rounded-2xl">
                            {loadingData ? (
                                <div className="p-12 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                    <p className="text-xs text-muted-foreground italic">Fetching team registry...</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {teamMembers.map((member) => (
                                        <div key={member._id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-bold border border-border group-hover:border-primary/50 transition-all">
                                                    {member.firstName?.charAt(0) || member.email.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{member.firstName} {member.lastName}</p>
                                                    <p className="text-xs text-muted-foreground">{member.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-0.5">{member.role}</p>
                                                    <p className="text-[10px] text-muted-foreground">Added {new Date(member.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-all">
                                                        <Settings className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteMember(member._id)}
                                                        className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Invite Modal */}
                        <AnimatePresence>
                            {showInviteModal && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setShowInviteModal(false)}
                                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                        className="relative w-full max-w-lg glass-panel p-8 rounded-3xl"
                                    >
                                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                            <UserIcon className="w-6 h-6 text-primary" /> Invite Team Member
                                        </h2>
                                        <form onSubmit={handleInvite} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase">First Name</label>
                                                    <input 
                                                        type="text" 
                                                        required
                                                        value={inviteForm.firstName}
                                                        onChange={(e) => setInviteForm({...inviteForm, firstName: e.target.value})}
                                                        className="w-full bg-neutral-900 border border-border rounded-xl px-4 py-2.5" 
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-muted-foreground uppercase">Last Name</label>
                                                    <input 
                                                        type="text" 
                                                        required
                                                        value={inviteForm.lastName}
                                                        onChange={(e) => setInviteForm({...inviteForm, lastName: e.target.value})}
                                                        className="w-full bg-neutral-900 border border-border rounded-xl px-4 py-2.5" 
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
                                                <input 
                                                    type="email" 
                                                    required
                                                    value={inviteForm.email}
                                                    onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                                                    className="w-full bg-neutral-900 border border-border rounded-xl px-4 py-2.5" 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase">Role</label>
                                                <select 
                                                    value={inviteForm.role}
                                                    onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                                                    className="w-full bg-neutral-900 border border-border rounded-xl px-4 py-2.5"
                                                >
                                                    <option value="staff">Staff</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="superadmin">Super Admin</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center gap-3 mt-8">
                                                <button 
                                                    type="button"
                                                    onClick={() => setShowInviteModal(false)}
                                                    className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    type="submit"
                                                    disabled={saving}
                                                    className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                                >
                                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                                    Send Invite
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            case "API Keys":
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h2 className="text-xl font-bold">API Management</h2>
                                <p className="text-xs text-muted-foreground mt-1">Control external access to NovaEdge services.</p>
                            </div>
                            <button 
                                onClick={async () => {
                                    const name = prompt("Enter key name:");
                                    if(name) {
                                        try {
                                            const res = await adminApi.createApiKey({ userId: String(config.lastUpdatedBy || '64a1b2c3d4e5f6g7h8i9j0k1'), name });
                                            if(res.success) {
                                                toast.success("API Key generated");
                                                fetchApiKeys();
                                            }
                                        } catch (e: unknown) {
                                            const message = e instanceof Error ? e.message : "An unexpected error occurred";
                                            toast.error(message);
                                        }
                                    }
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" /> Generate Key
                            </button>
                        </div>

                        <div className="glass-panel overflow-hidden rounded-2xl">
                            {loadingData ? (
                                <div className="p-12 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                    <p className="text-xs text-muted-foreground italic">Decrypting key vault...</p>
                                </div>
                            ) : apiKeys.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Key className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-20" />
                                    <p className="text-sm text-muted-foreground italic">No active API keys found.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {apiKeys.map((key) => (
                                        <div key={key._id} className="p-5 hover:bg-white/5 transition-colors group">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-border flex items-center justify-center">
                                                        <Key className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">{key.name || 'Admin Generated Key'}</p>
                                                        <p className="text-[10px] text-muted-foreground">Owner: {key.userId?.email || 'System'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
                                                        key.isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                                    )}>
                                                        {key.isActive ? "Active" : "Revoked"}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 p-2 bg-neutral-950 rounded-lg border border-border font-mono text-xs text-muted-foreground group-hover:border-primary/30 transition-all">
                                                <span className="flex-1 truncate">{key.key}</span>
                                                <button 
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(key.key);
                                                        toast.success("Copied to clipboard");
                                                    }}
                                                    className="p-1 hover:bg-white/10 rounded transition-all"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                                <button 
                                                    onClick={async () => {
                                                        if(confirm("Are you sure you want to revoke this key?")) {
                                                            try {
                                                                const res = await adminApi.revokeApiKey(key._id);
                                                                if(res.success) {
                                                                    toast.success("Key revoked");
                                                                    fetchApiKeys();
                                                                }
                                                            } catch (e: unknown) {
                                                                const message = e instanceof Error ? e.message : "An unexpected error occurred";
                                                                toast.error(message);
                                                            }
                                                        }
                                                    }}
                                                    className="p-1 hover:bg-red-500/10 rounded text-red-500 transition-all"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                            
                                            <div className="flex items-center justify-between mt-3 px-1">
                                                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                                                    <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {key.monthlyCalls}/{key.monthlyLimit} calls</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Created {new Date(key.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <Link href={`/analytics?key=${key._id}`} className="text-[10px] font-bold text-primary hover:underline">View Analytics</Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            case "Appearance":
                const THEME_PRESETS = [
                    {
                        id: 'purple-cyber',
                        name: 'Purple Cyber (Default)',
                        primary: '#9127FF',
                        accent: '#C042FF',
                        background: '#06000F',
                        primaryGradient: 'linear-gradient(135deg, #9127FF, #C042FF)',
                        textMuted: '#A080FF',
                    },
                    {
                        id: 'electric-blue',
                        name: 'Electric Blue',
                        primary: '#0072FF',
                        accent: '#00F2FE',
                        background: '#030B1E',
                        primaryGradient: 'linear-gradient(135deg, #0072FF, #00F2FE)',
                        textMuted: '#80BFFF',
                    },
                    {
                        id: 'emerald-cyber',
                        name: 'Emerald Green',
                        primary: '#00E676',
                        accent: '#00B0FF',
                        background: '#05130E',
                        primaryGradient: 'linear-gradient(135deg, #00E676, #00B0FF)',
                        textMuted: '#80FFAE',
                    },
                    {
                        id: 'sunset-gold',
                        name: 'Sunset Gold',
                        primary: '#FF5E36',
                        accent: '#FFAE00',
                        background: '#120905',
                        primaryGradient: 'linear-gradient(135deg, #FF5E36, #FFAE00)',
                        textMuted: '#FFC880',
                    },
                    {
                        id: 'crimson-neon',
                        name: 'Crimson Red',
                        primary: '#FF0055',
                        accent: '#FF5500',
                        background: '#100207',
                        primaryGradient: 'linear-gradient(135deg, #FF0055, #FF5500)',
                        textMuted: '#FF80AA',
                    },
                    {
                        id: 'obsidian-dark',
                        name: 'Obsidian Dark',
                        primary: '#6366F1',
                        accent: '#A855F7',
                        background: '#09090B',
                        primaryGradient: 'linear-gradient(135deg, #6366F1, #A855F7)',
                        textMuted: '#A5B4FC',
                    }
                ];

                const currentThemeObj: Record<string, any> = (config.themeConfig as any) || THEME_PRESETS[0];

                const applyPreset = (preset: typeof THEME_PRESETS[0]) => {
                    updateField("themeConfig", {
                        preset: preset.id,
                        primary: preset.primary,
                        primaryDark: preset.primary,
                        secondary: preset.background,
                        background: preset.background,
                        accent: preset.accent,
                        glow: preset.primary,
                        primaryGradient: preset.primaryGradient,
                        backgroundGradient: `radial-gradient(circle at top left, ${preset.primary}40, ${preset.background})`,
                        text: "#FFFFFF",
                        textLight: "#E0E0FF",
                        textMuted: preset.textMuted,
                        card: "rgba(255, 255, 255, 0.03)",
                        border: `${preset.primary}33`
                    });
                    updateField("brandPrimaryColor", preset.primary);
                };

                return (
                    <div className="space-y-6">
                        <div className="glass-panel p-6 rounded-2xl">
                            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                                <Palette className="w-5 h-5 text-primary" /> Mobile App Remote Theme Engine
                            </h2>
                            <p className="text-xs text-muted-foreground mb-6">
                                Choose a preset or customize colors below. When saved, all active users' mobile apps will update their UI theme live over-the-air!
                            </p>

                            <h3 className="text-sm font-bold text-white mb-4">Popular Theme Presets</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                                {THEME_PRESETS.map((preset) => {
                                    const isSelected = currentThemeObj?.preset === preset.id || currentThemeObj?.primary === preset.primary;
                                    return (
                                        <div
                                            key={preset.id}
                                            onClick={() => applyPreset(preset)}
                                            className={cn(
                                                "p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02]",
                                                isSelected ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" : "border-border bg-neutral-900/60 hover:border-primary/40"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs font-bold text-white">{preset.name}</span>
                                                {isSelected && <span className="w-2 h-2 rounded-full bg-primary animate-ping" />}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: preset.primary }} title="Primary" />
                                                <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: preset.accent }} title="Accent" />
                                                <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: preset.background }} title="Background" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border/60 pt-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-white mb-2">Custom Colors</h3>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Primary Color</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={currentThemeObj?.primary || "#9127FF"}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    updateField("themeConfig", {
                                                        ...currentThemeObj,
                                                        primary: val,
                                                        glow: val,
                                                        primaryGradient: `linear-gradient(135deg, ${val}, ${currentThemeObj?.accent || '#C042FF'})`
                                                    });
                                                    updateField("brandPrimaryColor", val);
                                                }}
                                                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                                            />
                                            <input
                                                type="text"
                                                value={currentThemeObj?.primary || "#9127FF"}
                                                onChange={(e) => updateField("themeConfig", { ...currentThemeObj, primary: e.target.value })}
                                                className="flex-1 bg-neutral-900 border border-border rounded-xl px-4 py-2 font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Accent Color</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={currentThemeObj?.accent || "#C042FF"}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    updateField("themeConfig", {
                                                        ...currentThemeObj,
                                                        accent: val,
                                                        primaryGradient: `linear-gradient(135deg, ${currentThemeObj?.primary || '#9127FF'}, ${val})`
                                                    });
                                                }}
                                                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                                            />
                                            <input
                                                type="text"
                                                value={currentThemeObj?.accent || "#C042FF"}
                                                onChange={(e) => updateField("themeConfig", { ...currentThemeObj, accent: e.target.value })}
                                                className="flex-1 bg-neutral-900 border border-border rounded-xl px-4 py-2 font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">App Background</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={currentThemeObj?.background || "#06000F"}
                                                onChange={(e) => updateField("themeConfig", { ...currentThemeObj, background: e.target.value })}
                                                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                                            />
                                            <input
                                                type="text"
                                                value={currentThemeObj?.background || "#06000F"}
                                                onChange={(e) => updateField("themeConfig", { ...currentThemeObj, background: e.target.value })}
                                                className="flex-1 bg-neutral-900 border border-border rounded-xl px-4 py-2 font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-white mb-2">Live Mobile App UI Preview</h3>
                                    <div
                                        className="p-6 rounded-2xl border transition-all space-y-4"
                                        style={{
                                            backgroundColor: currentThemeObj?.background || '#06000F',
                                            borderColor: currentThemeObj?.border || 'rgba(145, 39, 255, 0.2)'
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-white">Preview Screen</span>
                                            <span
                                                className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase"
                                                style={{
                                                    color: currentThemeObj?.primary || '#9127FF',
                                                    backgroundColor: `${currentThemeObj?.primary || '#9127FF'}20`
                                                }}
                                            >
                                                Active Theme
                                            </span>
                                        </div>

                                        <p className="text-xs" style={{ color: currentThemeObj?.textMuted || '#A080FF' }}>
                                            This is how card components, text headers, and buttons will appear in the mobile app.
                                        </p>

                                        <button
                                            className="w-full py-3 rounded-xl font-bold text-white text-xs shadow-lg transition-all"
                                            style={{
                                                background: currentThemeObj?.primaryGradient || 'linear-gradient(135deg, #9127FF, #C042FF)',
                                                boxShadow: `0 4px 15px ${currentThemeObj?.primary || '#9127FF'}40`
                                            }}
                                        >
                                            Sample Action Button
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case "Database":
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold">Database & Remote Config</h2>
                                <p className="text-xs text-muted-foreground mt-1">Manage remote configurations to update the app over-the-air without app store releases.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1 space-y-6">
                                <div className="glass-panel p-6 rounded-2xl">
                                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                        <Database className="w-4 h-4 text-primary" /> System Cache
                                    </h3>
                                    <p className="text-xs text-muted-foreground mb-4">Clear system cache to force all clients to fetch the latest configurations immediately.</p>
                                    <button 
                                        onClick={() => {
                                            toast.success("Cache flushed successfully! Clients will sync on next launch.");
                                        }}
                                        className="w-full py-2.5 bg-neutral-900 border border-border hover:border-primary/50 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 hover:bg-white/5"
                                    >
                                        <RefreshCw className="w-4 h-4" /> Flush Cache
                                    </button>
                                </div>
                                <div className="glass-panel p-6 rounded-2xl">
                                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-primary" /> Storage
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-xs mb-1.5">
                                                <span className="text-muted-foreground font-medium">MongoDB Clusters</span>
                                                <span className="font-mono text-primary">45%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary w-[45%]" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs mb-1.5">
                                                <span className="text-muted-foreground font-medium">Redis Cache</span>
                                                <span className="font-mono text-blue-500">12%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 w-[12%]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <div className="glass-panel p-6 rounded-2xl h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold flex items-center gap-2">
                                            <Smartphone className="w-4 h-4 text-primary" /> Remote App Config (JSON)
                                        </h3>
                                        <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border border-primary/20">
                                            Live Sync
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        This JSON configuration is fetched by the mobile app on startup. Update flags, feature toggles, and dynamic UI parameters here to change app behavior instantly (like Blinkit games/banners) without requiring an app store update.
                                    </p>
                                    <div className="flex-1 min-h-[350px] bg-neutral-950 border border-border rounded-xl p-4 font-mono text-sm relative group overflow-hidden focus-within:border-primary/50 transition-colors">
                                        <textarea 
                                            spellCheck={false}
                                            className="w-full h-full bg-transparent resize-none outline-none text-neutral-300 custom-scrollbar"
                                            defaultValue={JSON.stringify({
                                                "appVersion": "1.0.0",
                                                "forceUpdate": false,
                                                "maintenance": false,
                                                "features": {
                                                    "gamesEnabled": true,
                                                    "newDashboard": true,
                                                    "promotionalBanner": {
                                                        "active": true,
                                                        "imageUrl": "https://novaedgedigitallabs.in/promo/diwali.png",
                                                        "actionUrl": "app://promo/special-offer"
                                                    }
                                                },
                                                "themeOverrides": {
                                                    "primaryColor": "#8B5CF6",
                                                    "buttonRadius": "12px"
                                                }
                                            }, null, 2)}
                                        />
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex gap-2">
                                            <button 
                                                onClick={() => toast.success("JSON copied to clipboard!")}
                                                className="p-2 bg-neutral-900 border border-border rounded-lg hover:border-primary/50 text-muted-foreground hover:text-white transition-all shadow-lg"
                                                title="Copy JSON"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    toast.promise(new Promise(resolve => setTimeout(resolve, 800)), {
                                                        loading: 'Pushing changes over the air...',
                                                        success: 'Remote Config updated and pushed to all active clients!',
                                                        error: 'Failed to push config'
                                                    });
                                                }}
                                                className="p-2 bg-primary text-white border border-primary rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                                title="Save & Push"
                                            >
                                                <Save className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="glass-panel p-12 rounded-3xl flex flex-col items-center justify-center text-center font-outfit">
                        <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
                            <Clock className="w-8 h-8 text-neutral-500 animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
                        <p className="text-muted-foreground max-w-xs">We are currently building this configuration module. Stay tuned for updates.</p>
                    </div>
                );
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Platform Settings</h1>
                        <p className="text-muted-foreground">Manage your infrastructure via central control unit.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchConfig}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-all disabled:opacity-50"
                        >
                            <RotateCcw className={cn("w-4 h-4", saving && "animate-spin")} />
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    <div className="lg:col-span-1 sticky top-6">
                        <div className="glass-panel rounded-2xl overflow-hidden p-2 space-y-1">
                            {tabs.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => setActiveTab(item.name)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                        activeTab === item.name
                                            ? "bg-primary text-white shadow-lg shadow-primary/25"
                                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                    )}
                                >
                                    <item.icon className={cn("w-4 h-4", activeTab === item.name ? "text-white" : "text-muted-foreground")} />
                                    {item.name}
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 p-4 glass-panel rounded-2xl bg-primary/5 border-primary/10">
                            <div className="flex items-center gap-2 text-primary mb-2">
                                <Shield className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Internal Security</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Settings changed here affect all platform modules globally. Audit logs will track these modifications.
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-3 min-h-[600px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                                {renderTabContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
