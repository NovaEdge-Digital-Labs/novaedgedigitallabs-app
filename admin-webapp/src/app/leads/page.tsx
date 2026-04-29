"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { adminApi, BusinessInquirySubmission, LeadSubmission } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type PanelTab = "leads" | "approvals";

const leadStatuses: LeadSubmission["status"][] = [
    "new",
    "contacted",
    "in-progress",
    "closed-won",
    "closed-lost",
];

const inquiryStatuses: BusinessInquirySubmission["status"][] = [
    "pending",
    "contacted",
    "closed",
    "rejected",
];

export default function LeadsPage() {
    const [activeTab, setActiveTab] = useState<PanelTab>("leads");
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [leads, setLeads] = useState<LeadSubmission[]>([]);
    const [inquiries, setInquiries] = useState<BusinessInquirySubmission[]>([]);

    const loadData = async (silent = false) => {
        try {
            if (silent) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            const [leadsRes, inquiriesRes] = await Promise.all([
                adminApi.getLeads(),
                adminApi.getInquiries(),
            ]);

            if (leadsRes.success) setLeads(leadsRes.leads || []);
            if (inquiriesRes.success) setInquiries(inquiriesRes.inquiries || []);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            toast.error("Failed to load submissions: " + message);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const pendingApprovals = useMemo(
        () => inquiries.filter((entry) => entry.status === "pending").length,
        [inquiries]
    );

    const handleLeadStatusChange = async (id: string, status: LeadSubmission["status"]) => {
        try {
            const response = await adminApi.updateLead(id, { status });
            if (response.success) {
                setLeads((prev) => prev.map((lead) => (lead._id === id ? { ...lead, status } : lead)));
                toast.success("Lead status updated");
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            toast.error("Lead update failed: " + message);
        }
    };

    const handleInquiryStatusChange = async (
        id: string,
        status: BusinessInquirySubmission["status"]
    ) => {
        try {
            const response = await adminApi.updateInquiry(id, { status });
            if (response.success) {
                setInquiries((prev) =>
                    prev.map((inquiry) => (inquiry._id === id ? { ...inquiry, status } : inquiry))
                );
                toast.success("Submission approval updated");
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            toast.error("Approval update failed: " + message);
        }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[500px]">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading forms, leads and approvals...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Leads & Submission Approvals</h1>
                        <p className="text-muted-foreground">
                            Review incoming forms, qualify leads and approve/reject submissions.
                        </p>
                    </div>
                    <button
                        onClick={() => loadData(true)}
                        className="p-2.5 bg-neutral-900 border border-border rounded-xl hover:bg-neutral-800 transition-colors"
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-panel rounded-xl p-4">
                        <p className="text-xs text-muted-foreground">Total Leads</p>
                        <p className="text-2xl font-bold">{leads.length}</p>
                    </div>
                    <div className="glass-panel rounded-xl p-4">
                        <p className="text-xs text-muted-foreground">Open Leads</p>
                        <p className="text-2xl font-bold">
                            {leads.filter((lead) => ["new", "contacted", "in-progress"].includes(lead.status)).length}
                        </p>
                    </div>
                    <div className="glass-panel rounded-xl p-4">
                        <p className="text-xs text-muted-foreground">Pending Approvals</p>
                        <p className="text-2xl font-bold">{pendingApprovals}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab("leads")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm border transition-colors",
                            activeTab === "leads"
                                ? "bg-primary/20 border-primary/40 text-primary"
                                : "bg-neutral-900 border-border text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Lead Forms
                    </button>
                    <button
                        onClick={() => setActiveTab("approvals")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm border transition-colors",
                            activeTab === "approvals"
                                ? "bg-primary/20 border-primary/40 text-primary"
                                : "bg-neutral-900 border-border text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Submission Approvals
                    </button>
                </div>

                {activeTab === "leads" ? (
                    <div className="glass-panel rounded-2xl overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Service</th>
                                    <th className="p-4">Contact</th>
                                    <th className="p-4">Message</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead) => (
                                    <tr key={lead._id} className="border-b border-border/50">
                                        <td className="p-4 text-sm">
                                            <p className="font-medium">{lead.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(lead.createdAt).toLocaleString()}
                                            </p>
                                        </td>
                                        <td className="p-4 text-sm">{lead.service}</td>
                                        <td className="p-4 text-xs">
                                            <p>{lead.email}</p>
                                            <p className="text-muted-foreground">{lead.phone}</p>
                                        </td>
                                        <td className="p-4 text-xs max-w-[340px] truncate">{lead.message}</td>
                                        <td className="p-4">
                                            <select
                                                value={lead.status}
                                                onChange={(e) =>
                                                    handleLeadStatusChange(
                                                        lead._id,
                                                        e.target.value as LeadSubmission["status"]
                                                    )
                                                }
                                                className="bg-neutral-900 border border-border rounded-lg px-2 py-1 text-xs"
                                            >
                                                {leadStatuses.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                                {leads.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                            No lead forms submitted yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="glass-panel rounded-2xl overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                                    <th className="p-4">Business</th>
                                    <th className="p-4">Owner</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Contact</th>
                                    <th className="p-4">Approval</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inquiries.map((inquiry) => (
                                    <tr key={inquiry._id} className="border-b border-border/50">
                                        <td className="p-4 text-sm">
                                            <p className="font-medium">{inquiry.businessName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(inquiry.createdAt).toLocaleString()}
                                            </p>
                                        </td>
                                        <td className="p-4 text-sm">{inquiry.ownerName}</td>
                                        <td className="p-4 text-sm">{inquiry.category}</td>
                                        <td className="p-4 text-xs">
                                            <p>{inquiry.email}</p>
                                            <p className="text-muted-foreground">{inquiry.phone}</p>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={inquiry.status}
                                                onChange={(e) =>
                                                    handleInquiryStatusChange(
                                                        inquiry._id,
                                                        e.target.value as BusinessInquirySubmission["status"]
                                                    )
                                                }
                                                className="bg-neutral-900 border border-border rounded-lg px-2 py-1 text-xs"
                                            >
                                                {inquiryStatuses.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                                {inquiries.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                            No approval submissions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
