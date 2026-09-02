"use client";

import React, { useState, useEffect } from "react";
import { Send, Bell, Loader2, History } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/layout/AdminLayout";

export default function NotificationsPage() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState("general");
    const [actionUrl, setActionUrl] = useState("");
    const [userId, setUserId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [isFetchingHistory, setIsFetchingHistory] = useState(true);

    const fetchHistory = async () => {
        setIsFetchingHistory(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://app.novaedgedigitallabs.in";
            const baseUrl = apiUrl.replace(/\/api$/, '');
            const res = await fetch(`${baseUrl}/api/notifications/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setHistory(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setIsFetchingHistory(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title.trim() || !message.trim()) {
            toast.error("Title and message are required.");
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://app.novaedgedigitallabs.in";
            const baseUrl = apiUrl.replace(/\/api$/, '');
            
            const response = await fetch(`${baseUrl}/api/notifications/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    message,
                    type,
                    actionUrl: actionUrl.trim() || undefined,
                    userId: userId.trim() || undefined
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Notification sent successfully!");
                // Reset form
                setTitle("");
                setMessage("");
                setActionUrl("");
                setUserId("");
                setType("general");
                fetchHistory();
            } else {
                toast.error(data.message || "Failed to send notification.");
            }
        } catch (error: any) {
            console.error("Error sending notification:", error);
            toast.error(error.message || "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="p-6 md:p-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Push Notifications</h1>
                    <p className="text-muted-foreground mt-1">
                        Send targeted or global push notifications to users.
                    </p>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/5">
                <form onSubmit={handleSendNotification} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Notification Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="e.g. Special Offer!"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Notification Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all [&>option]:bg-neutral-900"
                            >
                                <option value="general">General</option>
                                <option value="promo">Promotion</option>
                                <option value="alert">Alert</option>
                                <option value="update">System Update</option>
                            </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-300">Message Body *</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="Write the main content of your notification here..."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Target User ID (Optional)</label>
                            <input
                                type="text"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="Leave empty to send to ALL users"
                            />
                            <p className="text-xs text-muted-foreground mt-1">If left blank, this will send a global broadcast.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Action URL (Optional)</label>
                            <input
                                type="url"
                                value={actionUrl}
                                onChange={(e) => setActionUrl(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="e.g. https://novaedgedigitallabs.in/offers"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading || !title.trim() || !message.trim()}
                            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                            Send Notification
                        </button>
                    </div>
                </form>
            </div>
            
            <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Bell className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h3 className="text-lg font-medium text-blue-100">How it works</h3>
                    <p className="text-sm text-blue-200/70 mt-1 leading-relaxed">
                        Notifications sent from here are dispatched to all mobile and web users subscribed to Firebase Cloud Messaging. 
                        They are also saved in the database so users can view them inside the app later. 
                        To send a targeted message to a specific person, copy their User ID from the Users tab and paste it above.
                    </p>
                </div>
            </div>

            <div className="mt-12 glass-panel p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-6">
                    <History className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-white">Notification History</h2>
                </div>
                
                {isFetchingHistory ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No notifications sent yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-sm text-gray-400">
                                    <th className="pb-3 font-medium px-4">Title & Type</th>
                                    <th className="pb-3 font-medium px-4">Target</th>
                                    <th className="pb-3 font-medium px-4">Date Sent</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {history.map((notif: any) => (
                                    <tr key={notif._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="font-medium text-white">{notif.title}</div>
                                            <div className="text-xs text-gray-500 mt-1 uppercase">{notif.type}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {notif.userId ? (
                                                <div className="flex flex-col">
                                                    <span className="text-blue-400">Specific User</span>
                                                    <span className="text-xs text-gray-500">{notif.userId.name || notif.userId.email || notif.userId._id}</span>
                                                </div>
                                            ) : (
                                                <span className="text-green-400 bg-green-400/10 px-2 py-1 rounded-full text-xs font-medium">Global Broadcast</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-gray-400">
                                            {new Date(notif.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            </div>
        </AdminLayout>
    );
}
