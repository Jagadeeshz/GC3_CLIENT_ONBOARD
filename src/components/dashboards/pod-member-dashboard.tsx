"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckSquare,
  CheckCircle2,
  Clock,
  FileText,
  Users,
  Edit3,
  Upload,
  Timer,
  AlertCircle,
  ArrowUpRight,
  Target,
  Zap,
} from "lucide-react";

interface PodMemberRequest {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  estimated_hours: number | null;
  client: { id: string; company_name: string } | null;
}

interface PodMemberDeliverable {
  id: string;
  title: string;
  status: string;
  created_at: string;
  request: { id: string; title: string } | null;
}

interface PodInfo {
  id: string;
  name: string;
  manager: { id: string; full_name: string } | null;
  members: {
    id: string;
    member: { id: string; full_name: string; role: string; avatar_url: string | null } | null;
  }[];
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
    completed: "success",
    in_review: "warning",
    in_progress: "default",
    pending: "secondary",
  };
  return <Badge variant={variants[status] || "secondary"}>{status.replace(/_/g, " ")}</Badge>;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function PodMemberDashboard() {
  const { user } = useAuth();
  const userName = user?.full_name?.split(" ")[0] || "there";

  const [requests, setRequests] = useState<PodMemberRequest[]>([]);
  const [deliverables, setDeliverables] = useState<PodMemberDeliverable[]>([]);
  const [pods, setPods] = useState<PodInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, delRes, podRes] = await Promise.allSettled([
          fetch(`/api/requests?limit=50&assigned_to=${user?.id || ""}`),
          fetch(`/api/deliverables?limit=20&assigned_to=${user?.id || ""}`),
          fetch("/api/pods/my"),
        ]);

        if (reqRes.status === "fulfilled" && reqRes.value.ok) {
          const reqData = await reqRes.value.json();
          setRequests(reqData.data || []);
        }

        if (delRes.status === "fulfilled" && delRes.value.ok) {
          const delData = await delRes.value.json();
          setDeliverables(delData.data || []);
        }

        if (podRes.status === "fulfilled" && podRes.value.ok) {
          const podData = await podRes.value.json();
          setPods(podData.data || []);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  const myPod = pods[0];
  const assignedTasks = requests.filter((r) => r.status !== "completed");
  const completedTasks = requests.filter((r) => r.status === "completed");
  const pendingDeliverables = deliverables.filter((d) => d.status !== "completed");
  const todayCount = assignedTasks.filter((r) => {
    if (!r.due_date) return false;
    const due = new Date(r.due_date).toDateString();
    return due === new Date().toDateString();
  }).length;

  const statCards = [
    {
      title: "Assigned Tasks",
      value: String(assignedTasks.length),
      icon: CheckSquare,
      description: `${assignedTasks.filter((r) => r.priority === "high" || r.priority === "urgent").length} high priority`,
      trend: todayCount > 0 ? `${todayCount} due today` : "None due today",
    },
    {
      title: "Completed",
      value: String(completedTasks.length),
      icon: CheckCircle2,
      description: `of ${requests.length} total requests`,
      trend: `${requests.length > 0 ? Math.round((completedTasks.length / requests.length) * 100) : 0}% completion rate`,
    },
    {
      title: "Pending Deliverables",
      value: String(pendingDeliverables.length),
      icon: FileText,
      description: `${pendingDeliverables.filter((d) => d.status === "in_review").length} in review`,
    },
    {
      title: "My Pod",
      value: myPod?.name || "--",
      icon: Users,
      description: myPod ? `Managed by ${myPod.manager?.full_name || "N/A"}` : "No pod assigned",
      trend: myPod ? `${myPod.members.length} members` : undefined,
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
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
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
              {myPod ? (
                <>
                  You&apos;re assigned to{" "}
                  <span className="font-semibold text-amber-500">{myPod.name}</span> managed by{" "}
                  {myPod.manager?.full_name || "N/A"}.
                </>
              ) : (
                "You are not currently assigned to any pod."
              )}
            </p>
          </div>
          {todayCount > 0 && (
            <div className="hidden md:flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium text-amber-500">{todayCount} task{todayCount !== 1 ? "s" : ""} due today</span>
            </div>
          )}
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
              {stat.trend && <p className="mt-1 text-xs text-amber-500">{stat.trend}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assigned Tasks & Pending Deliverables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assigned Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-amber-500" />
              Assigned Tasks
            </CardTitle>
            <CardDescription>Tasks assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignedTasks.length === 0 && (
                <p className="text-sm text-muted-foreground">No assigned tasks.</p>
              )}
              {assignedTasks.slice(0, 6).map((task) => (
                <div key={task.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                      task.status === "completed" ? "bg-green-500" :
                      task.status === "in_progress" ? "bg-amber-500" : "bg-gray-400"
                    }`} />
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {task.client?.company_name || "N/A"}
                        {task.due_date && ` · Due ${new Date(task.due_date).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <PriorityBadge priority={task.priority} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Deliverables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              Pending Deliverables
            </CardTitle>
            <CardDescription>Deliverables awaiting your action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingDeliverables.length === 0 && (
                <p className="text-sm text-muted-foreground">No pending deliverables.</p>
              )}
              {pendingDeliverables.slice(0, 5).map((deliverable) => (
                <div key={deliverable.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{deliverable.title}</p>
                    <StatusBadge status={deliverable.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {deliverable.request?.title || "N/A"} · {timeAgo(deliverable.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Pod & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* My Pod Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              My Pod
            </CardTitle>
            <CardDescription>
              {myPod?.name || "No pod"} · {myPod ? `Managed by ${myPod.manager?.full_name || "N/A"}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {myPod ? (
              <div className="space-y-3">
                {myPod.members.map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-xs font-semibold text-amber-500">
                      {m.member?.full_name?.split(" ").map((n) => n[0]).join("") || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{m.member?.full_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground capitalize">{m.member?.role?.replace("_", " ") || ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pod info available.</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common actions you can take</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Update Task", icon: Edit3, color: "text-amber-500", href: "/requests" },
                { label: "Upload Deliverable", icon: Upload, color: "text-blue-500", href: "/deliverables" },
                { label: "Log Hours", icon: Timer, color: "text-green-500", href: "/hours-wallet" },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                  <span className="text-xs font-medium">{action.label}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
