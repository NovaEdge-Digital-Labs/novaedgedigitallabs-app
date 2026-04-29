"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { adminApi, AdminGigWork, AdminProjectWork } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ActiveTab = "projects" | "gigs";
const projectStatuses: AdminProjectWork["status"][] = ["open", "in-progress", "completed", "cancelled"];

export default function WorkPage() {
    const [tab, setTab] = useState<ActiveTab>("projects");
    const [isLoading, setIsLoading] = useState(true);
    const [projects, setProjects] = useState<AdminProjectWork[]>([]);
    const [gigs, setGigs] = useState<AdminGigWork[]>([]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const response = await adminApi.getWork();
            if (response.success) {
                setProjects(response.projects || []);
                setGigs(response.gigs || []);
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to load work data";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const updateProjectStatus = async (id: string, status: AdminProjectWork["status"]) => {
        try {
            const response = await adminApi.updateProject(id, { status });
            if (response.success) {
                setProjects((prev) => prev.map((project) => (project._id === id ? { ...project, status } : project)));
                toast.success("Project updated");
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Update failed";
            toast.error(message);
        }
    };

    const updateGigStatus = async (id: string, isActive: boolean) => {
        try {
            const response = await adminApi.updateGig(id, { isActive });
            if (response.success) {
                setGigs((prev) => prev.map((gig) => (gig._id === id ? { ...gig, isActive } : gig)));
                toast.success("Gig updated");
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Update failed";
            toast.error(message);
        }
    };

    const deleteProject = async (id: string, title: string) => {
        if (!confirm(`Delete project "${title}"?`)) return;
        try {
            const response = await adminApi.deleteProject(id);
            if (response.success) {
                setProjects((prev) => prev.filter((project) => project._id !== id));
                toast.success("Project deleted");
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Delete failed";
            toast.error(message);
        }
    };

    const deleteGig = async (id: string, title: string) => {
        if (!confirm(`Delete gig "${title}"?`)) return;
        try {
            const response = await adminApi.deleteGig(id);
            if (response.success) {
                setGigs((prev) => prev.filter((gig) => gig._id !== id));
                toast.success("Gig deleted");
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
                        <p className="text-muted-foreground">Loading work data...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Work Management</h1>
                    <p className="text-muted-foreground">Manage projects and gigs across the platform.</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setTab("projects")}
                        className={cn(
                            "px-4 py-2 rounded-lg border text-sm",
                            tab === "projects"
                                ? "bg-primary/20 border-primary/40 text-primary"
                                : "bg-neutral-900 border-border text-muted-foreground"
                        )}
                    >
                        Projects
                    </button>
                    <button
                        onClick={() => setTab("gigs")}
                        className={cn(
                            "px-4 py-2 rounded-lg border text-sm",
                            tab === "gigs"
                                ? "bg-primary/20 border-primary/40 text-primary"
                                : "bg-neutral-900 border-border text-muted-foreground"
                        )}
                    >
                        Gigs
                    </button>
                </div>

                {tab === "projects" ? (
                    <div className="glass-panel rounded-2xl overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                                    <th className="p-4">Project</th>
                                    <th className="p-4">Budget</th>
                                    <th className="p-4">Client</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((project) => (
                                    <tr key={project._id} className="border-b border-border/40">
                                        <td className="p-4 text-sm font-medium">{project.title}</td>
                                        <td className="p-4 text-sm">
                                            INR {project.budgetRange?.min?.toLocaleString() || 0} - {project.budgetRange?.max?.toLocaleString() || 0}
                                        </td>
                                        <td className="p-4 text-xs">
                                            {project.clientId?.firstName || ""} {project.clientId?.lastName || ""}
                                            <p className="text-muted-foreground">{project.clientId?.email || ""}</p>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={project.status}
                                                onChange={(e) => updateProjectStatus(project._id, e.target.value as AdminProjectWork["status"])}
                                                className="bg-neutral-900 border border-border rounded-lg px-2 py-1 text-xs"
                                            >
                                                {projectStatuses.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => deleteProject(project._id, project.title)}
                                                className="inline-flex items-center gap-1 text-red-400 hover:text-red-300"
                                            >
                                                <Trash2 className="w-4 h-4" /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {projects.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                            No projects found.
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
                                    <th className="p-4">Gig</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Price</th>
                                    <th className="p-4">Freelancer</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gigs.map((gig) => (
                                    <tr key={gig._id} className="border-b border-border/40">
                                        <td className="p-4 text-sm font-medium">{gig.title}</td>
                                        <td className="p-4 text-sm">{gig.category}</td>
                                        <td className="p-4 text-sm">INR {gig.price?.toLocaleString() || 0}</td>
                                        <td className="p-4 text-xs">
                                            {gig.freelancerId?.firstName || ""} {gig.freelancerId?.lastName || ""}
                                            <p className="text-muted-foreground">{gig.freelancerId?.email || ""}</p>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => updateGigStatus(gig._id, !gig.isActive)}
                                                className={cn(
                                                    "px-2.5 py-1 rounded-full text-[10px] uppercase border",
                                                    gig.isActive
                                                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                        : "bg-red-500/10 text-red-500 border-red-500/20"
                                                )}
                                            >
                                                {gig.isActive ? "Active" : "Inactive"}
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => deleteGig(gig._id, gig.title)}
                                                className="inline-flex items-center gap-1 text-red-400 hover:text-red-300"
                                            >
                                                <Trash2 className="w-4 h-4" /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {gigs.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            No gigs found.
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
