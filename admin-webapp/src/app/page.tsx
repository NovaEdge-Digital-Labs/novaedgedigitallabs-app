"use client";

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatCard } from "@/components/ui/StatCard";
import { cn } from "@/lib/utils";
import { adminApi, BusinessInquirySubmission, LeadSubmission, SystemHealth } from "@/lib/api";
import {
  Users,
  UserPlus,
  Activity,
  TrendingUp,
  ArrowUpRight,
  Loader2,
  RefreshCcw
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { CheckCircle, Shield, Zap } from "lucide-react";


export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<LeadSubmission[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<BusinessInquirySubmission[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    apiLatency: 0,
    cpuLoad: 0,
    diskUsage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);


  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, leadsRes, inquiriesRes, healthRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getLeads(),
        adminApi.getInquiries(),
        adminApi.getSystemHealth()
      ]);

      if (!loading) {
        toast.success("Dashboard data synchronized successfully", {
          icon: <RefreshCcw className="w-4 h-4 text-primary animate-spin" />,
          duration: 2000
        });
      }


      if (statsRes.success) {
        setStats(statsRes.stats);
      }

      if (usersRes.success) {
        // Sort by joined date and take top 5
        const sortedUsers = usersRes.users
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        setRecentUsers(sortedUsers);
      }

      if (leadsRes.success) {
        setRecentLeads((leadsRes.leads || []).slice(0, 5));
      }

      if (inquiriesRes.success) {
        setPendingApprovals((inquiriesRes.inquiries || []).filter((inquiry: BusinessInquirySubmission) => inquiry.status === "pending"));
      }

      if (healthRes.success) {
        setSystemHealth(healthRes.health);
      }
    } catch (error: any) {
      toast.error("Failed to load dashboard data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats?.users?.toLocaleString() || "0",
      change: "+12%",
      isPositive: true,
      icon: Users,
      color: "blue",
    },
    {
      title: "Active Services",
      value: stats?.services?.toLocaleString() || "0",
      change: "+4%",
      isPositive: true,
      icon: Shield,
      color: "green",
    },
    {
      title: "Academy Courses",
      value: stats?.courses?.toLocaleString() || "0",
      change: "+3.2%",
      isPositive: true,
      icon: TrendingUp,
      color: "purple",
    },
    {
      title: "Active Leads",
      value: stats?.leads?.toLocaleString() || "0",
      change: "+5%",
      isPositive: true,
      icon: Activity,
      color: "orange",
    },
  ];

  if (loading && !stats) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-[600px] gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse font-medium">Syncing dashboard data...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              Dashboard Overview <span className="text-xs font-normal text-muted-foreground px-2 py-1 glass-panel rounded-full uppercase tracking-widest">Live</span>
            </h1>
            <p className="text-muted-foreground mt-2">Welcome back, Super Admin. Here's what's happening today.</p>
          </div>
          <button 
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2 glass-panel rounded-xl hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <RefreshCcw className={cn("w-5 h-5 text-muted-foreground", loading && "animate-spin")} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <StatCard key={stat.title} {...stat} index={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                Recent Signups <ArrowUpRight className="w-5 h-5 text-primary" />
              </h2>
              <Link href="/users" className="text-sm text-primary hover:underline">View All</Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="pb-4 font-medium">User</th>
                    <th className="pb-4 font-medium">Role</th>
                    <th className="pb-4 font-medium">Status</th>
                    <th className="pb-4 font-medium text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {recentUsers.map((user) => (
                    <tr key={user.email} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold ring-1 ring-white/10 group-hover:ring-primary/50 transition-all">
                            {user.firstName?.charAt(0) || user.email.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-xs font-medium px-2 py-1 rounded-md bg-neutral-800 border border-border capitalize">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1.5">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            user.isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500"
                          )} />
                          <span className="text-xs font-medium">{user.isActive ? "Active" : "Inactive"}</span>
                        </div>
                      </td>
                      <td className="py-4 text-right text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {recentUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground italic">
                        No recent signups found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Leads & Approvals</h2>
                <Link href="/leads" className="text-xs text-primary hover:underline">Manage</Link>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Recent Leads</span>
                  <span className="font-bold">{recentLeads.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pending Approvals</span>
                  <span className={cn("font-bold", pendingApprovals.length > 0 ? "text-orange-400" : "text-green-400")}>
                    {pendingApprovals.length}
                  </span>
                </div>
                <div className="pt-2 border-t border-border/50">
                  {recentLeads.length > 0 ? (
                    <div className="space-y-2">
                      {recentLeads.slice(0, 3).map((lead) => (
                        <div key={lead._id} className="text-xs">
                          <p className="font-medium truncate">{lead.name} - {lead.service}</p>
                          <p className="text-muted-foreground truncate">{lead.email}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No recent form submissions.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                System Health <Activity className="w-5 h-5 text-green-500" />
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">API Latency</span>
                  <span className="font-medium text-green-500">{systemHealth.apiLatency}ms</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                    style={{ width: `${Math.min(100, Math.max(2, 100 - Math.round(systemHealth.apiLatency / 3)))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">CPU Load</span>
                  <span className="font-medium text-orange-500">{systemHealth.cpuLoad}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.3)]"
                    style={{ width: `${systemHealth.cpuLoad}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Disk Usage</span>
                  <span className="font-medium text-blue-500">{systemHealth.diskUsage}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                    style={{ width: `${systemHealth.diskUsage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 bg-primary/5 hover:bg-primary/10 transition-colors border-primary/20">
              <h2 className="text-lg font-bold mb-2">Upgrade Storage</h2>
              <p className="text-xs text-muted-foreground mb-4">Your platform storage is almost full. Upgrade now to avoid service interruption.</p>
              <button 
                onClick={() => setIsUpgradeModalOpen(true)}
                className="w-full py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>

        <Modal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          title="Scale Your Infrastructure"
          maxWidth="md"
        >
          <div className="space-y-6">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold">Storage Optimization Needed</p>
                <p className="text-xs text-muted-foreground mt-1">Your current cluster is at 88% capacity. Upgrading to Enterprise will double your bandwidth and storage.</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                "Unlimited cloud assets storage",
                "Dedicated API throughput (50k req/min)",
                "Custom domain white-labeling",
                "Advanced role-based access control",
                "24/7 Priority engineering support"
              ].map(feature => (
                <div key={feature} className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" /> Unlock Enterprise Features
              </button>
              <button 
                onClick={() => setIsUpgradeModalOpen(false)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
              >
                Maybe Later
              </button>
            </div>
            
            <p className="text-[10px] text-center text-muted-foreground italic">
              * Upgrades take effect immediately after transaction confirmation.
            </p>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
