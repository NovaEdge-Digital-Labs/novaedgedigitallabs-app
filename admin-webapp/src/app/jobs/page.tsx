"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { adminApi, AdminJobPost } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const listingTypes: AdminJobPost["listingType"][] = ["Basic", "Featured", "Premium"];

export default function JobsPage() {
    const [jobs, setJobs] = useState<AdminJobPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadJobs = async () => {
        try {
            setIsLoading(true);
            const response = await adminApi.getJobs();
            if (response.success) {
                setJobs(response.jobs || []);
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to load jobs";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, []);

    const handleUpdate = async (id: string, data: Partial<Pick<AdminJobPost, "isActive" | "listingType">>) => {
        try {
            const response = await adminApi.updateJob(id, data);
            if (response.success) {
                toast.success("Job post updated");
                setJobs((prev) => prev.map((job) => (job._id === id ? { ...job, ...data } : job)));
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Update failed";
            toast.error(message);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}" job post?`)) return;
        try {
            const response = await adminApi.deleteJob(id);
            if (response.success) {
                toast.success("Job post deleted");
                setJobs((prev) => prev.filter((job) => job._id !== id));
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Delete failed";
            toast.error(message);
        }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[500px]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-muted-foreground">Loading job posts...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Job Posts</h1>
                    <p className="text-muted-foreground">View and manage all posted jobs.</p>
                </div>

                <div className="glass-panel rounded-2xl overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                                <th className="p-4">Title</th>
                                <th className="p-4">Company</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Posted By</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job) => (
                                <tr key={job._id} className="border-b border-border/40">
                                    <td className="p-4">
                                        <p className="text-sm font-medium">{job.title}</p>
                                        <p className="text-xs text-muted-foreground">{job.location}</p>
                                    </td>
                                    <td className="p-4 text-sm">{job.companyId?.name || "N/A"}</td>
                                    <td className="p-4">
                                        <select
                                            value={job.listingType}
                                            onChange={(e) =>
                                                handleUpdate(job._id, { listingType: e.target.value as AdminJobPost["listingType"] })
                                            }
                                            className="bg-neutral-900 border border-border rounded-lg px-2 py-1 text-xs"
                                        >
                                            {listingTypes.map((listingType) => (
                                                <option key={listingType} value={listingType}>
                                                    {listingType}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleUpdate(job._id, { isActive: !job.isActive })}
                                            className={cn(
                                                "px-2.5 py-1 rounded-full text-[10px] uppercase border",
                                                job.isActive
                                                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                    : "bg-red-500/10 text-red-500 border-red-500/20"
                                            )}
                                        >
                                            {job.isActive ? "Active" : "Inactive"}
                                        </button>
                                    </td>
                                    <td className="p-4 text-xs">
                                        {job.postedBy?.firstName || ""} {job.postedBy?.lastName || ""}
                                        <p className="text-muted-foreground">{job.postedBy?.email || ""}</p>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(job._id, job.title)}
                                            className="inline-flex items-center gap-1 text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="w-4 h-4" /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {jobs.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        No job posts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
