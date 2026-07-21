"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  ClipboardList,
  Users,
  Clock,
  UserPlus,
  CheckCircle2,
  FileText,
  DollarSign,
  BarChart3,
  TrendingUp,
} from "lucide-react";

interface PodRequest {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  estimated_hours: number | null;
  assigned_to: string | null;
  assignee: { id: string; full_name: string } | null;
  client: { id: string; company_name: string } | null;
}

interface PodMember {
  id: string;
  member: { id: string; full_name: string; role: string; avatar_url: string | null } | null;
}

interface PodInfo {
  id: string;
  name: string;
  manager: { id: string; full_name: string } | null;
  members: PodMember[];
}

interface ChangeRequest {
  id: string;
  title: string;
  status: string;
  cost_estimate: number | null;
  estimated_hours: number | null;
  client: { id: string; company_name: string } | null;
}

function PriorityBadge({ priority }: { priority: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
    urgent: "destructive",
    high: "warning",
    medium: "default",
    low: "secondary",
  };
  return <Badge variant={variants[priority] || "secondary"}>{priority}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
    under_review: "warning",
    submitted: "default",
    approved: "success",
    rejected: "destructive",
  };
  return <Badge variant={variants[status] || "secondary"}>{status.replace(/_/g, " ")}</Badge>;
}

export function PodManagerDashboard() {
  const { user } = useAuth();
  const userName = user?.full_name?.split(" ")[0] || "there";

  const [pod, setPod] = useState<PodInfo | null>(null);
  const [requests, setRequests] = useState<PodRequest[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const podRes = await fetch("/api/pods/my");
        let podId = "";
        if (podRes.ok) {
          const podData = await podRes.json();
          const pods = podData.data || [];
          if (pods.length > 0) {
            setPod(pods[0]);
            podId = pods[0].id;
          }
        }

        if (podId) {
          const [reqRes, crRes] = await Promise.allSettled([
            fetch(`/api/requests?limit=50&pod_id=${podId}`),
            fetch("/api/change-requests?limit=20"),
          ]);

          if (reqRes.status === "fulfilled" && reqRes.value.ok) {
            const reqData = await reqRes.value.json();
            setRequests(reqData.data || []);
          }

          if (crRes.status === "fulfilled" && crRes.value.ok) {
            const crData = await crRes.value.json();
            setChangeRequests(crData.data || []);
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  const members = pod?.members || [];
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const activeRequests = requests.filter((r) => r.status === "in_progress" || r.status === "pending");
  const completedRequests = requests.filter((r) => r.status === "completed");
  const reviewRequests = requests.filter((r) => r.status === "in_review");

  const teamProductivity = members.map((m) => {
    const memberRequests = requests.filter((r) => r.assigned_to === m.member?.id);
    const firstName = m.member?.full_name?.split(" ")[0] || "??";
    return {
      name: firstName,
      completed: memberRequests.filter((r) => r.status === "completed").length,
      inProgress: memberRequests.filter((r) => r.status === "in_progress").length,
    };
  });

  const utilizationPct = members.length > 0
    ? Math.round((members.filter((m) => {
        const cnt = requests.filter((r) => r.assigned_to === m.member?.id && r.status !== "completed").length;
        return cnt > 0;
      }).length / members.length) * 100)
    : 0;

  const statCards = [
    {
      title: "Active Requests",
      value: String(activeRequests.length),
      icon: ClipboardList,
      description: `${pendingRequests.length} pending, ${requests.filter((r) => r.status === "in_progress").length} in progress`,
    },
    {
      title: "Pending Reviews",
      value: String(reviewRequests.length),
      icon: FileText,
      description: `${reviewRequests.length} deliverables to review`,
    },
    {
      title: "Team Members",
      value: String(members.length),
      icon: Users,
      description: pod?.name || "No pod",
    },
    {
      title: "Completed",
      value: String(completedRequests.length),
      icon: CheckCircle2,
      description: `of ${requests.length} total requests`,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {userName}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage your pod&apos;s tasks, reviews, and team productivity.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2">
              <p className="text-sm font-medium text-amber-500">Team Utilization</p>
              <p className="text-2xl font-bold text-amber-500">{utilizationPct}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Overview & Pending Requests */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Team Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              Team Overview
            </CardTitle>
            <CardDescription>Member workload and utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.length === 0 && (
                <p className="text-sm text-muted-foreground">No team members.</p>
              )}
              {members.map((m) => {
                const memberReqCount = requests.filter((r) => r.assigned_to === m.member?.id).length;
                const memberCompleted = requests.filter((r) => r.assigned_to === m.member?.id && r.status === "completed").length;
                const pct = memberReqCount > 0 ? Math.round((memberCompleted / memberReqCount) * 100) : 0;
                return (
                  <div key={m.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 text-xs font-semibold text-amber-500">
                      {m.member?.full_name?.split(" ").map((n) => n[0]).join("") || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{m.member?.full_name || "Unknown"}</p>
                        <span className="text-xs text-muted-foreground">{pct}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">
                        {m.member?.role?.replace("_", " ") || ""} · {memberCompleted}/{memberReqCount} tasks
                      </p>
                      <Progress value={pct} className="mt-1 h-1.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-amber-500" />
              Pending Requests
            </CardTitle>
            <CardDescription>Requests awaiting assignment</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Est. Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      No pending requests.
                    </TableCell>
                  </TableRow>
                )}
                {pendingRequests.slice(0, 5).map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{request.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.due_date ? new Date(request.due_date).toLocaleDateString() : "No due date"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{request.client?.company_name || "N/A"}</TableCell>
                    <TableCell><PriorityBadge priority={request.priority} /></TableCell>
                    <TableCell className="text-sm font-medium">{request.estimated_hours || "--"}h</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Change Requests & Team Productivity Chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Change Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              Change Requests
            </CardTitle>
            <CardDescription>Pending your review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {changeRequests.length === 0 && (
                <p className="text-sm text-muted-foreground">No change requests.</p>
              )}
              {changeRequests.slice(0, 5).map((cr) => (
                <div key={cr.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{cr.title}</p>
                    <StatusBadge status={cr.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{cr.client?.company_name || "N/A"}</span>
                    <span>
                      {cr.cost_estimate ? `$${cr.cost_estimate.toLocaleString()}` : "--"}
                      {cr.estimated_hours ? ` · ${cr.estimated_hours}h` : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Productivity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-amber-500" />
              Team Productivity
            </CardTitle>
            <CardDescription>Tasks completed per team member</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {teamProductivity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamProductivity} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#a1a1aa" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#a1a1aa" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(245,178,44,0.2)", borderRadius: "8px" }}
                      labelStyle={{ color: "#f5b22c" }}
                    />
                    <Legend />
                    <Bar dataKey="completed" fill="#f5b22c" radius={[4, 4, 0, 0]} name="Completed" />
                    <Bar dataKey="inProgress" fill="#3b82f6" radius={[4, 4, 0, 0]} name="In Progress" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  No productivity data available.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Management actions you can take</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {[
              { label: "Assign Tasks", icon: UserPlus, color: "text-amber-500", href: "/requests" },
              { label: "Approve Deliverables", icon: CheckCircle2, color: "text-green-500", href: "/deliverables" },
              { label: "Review Change Requests", icon: FileText, color: "text-blue-500", href: "/change-requests" },
              { label: "Manage Team", icon: Users, color: "text-purple-500", href: "/pod" },
              { label: "View Reports", icon: BarChart3, color: "text-cyan-500", href: "/reports" },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <action.icon className={`h-6 w-6 ${action.color}`} />
                <span className="text-xs font-medium text-center">{action.label}</span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
