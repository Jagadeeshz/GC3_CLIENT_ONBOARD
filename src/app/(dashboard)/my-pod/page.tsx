"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Users, Clock, FileText, Package, Crown, Activity } from "lucide-react";

interface PodManager {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface PodMemberProfile {
  id: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
}

interface PodMemberEntry {
  id: string;
  member: PodMemberProfile | null;
}

interface PodData {
  id: string;
  name: string;
  description: string | null;
  manager: PodManager | null;
  members: PodMemberEntry[];
}

interface PodRequest {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  assignee: { id: string; full_name: string } | null;
  client: { id: string; company_name: string } | null;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "in_progress":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "pending":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "cancelled":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}

function SkeletonLine({ className }: { className?: string }) {
  return <Skeleton className={`h-4 bg-zinc-800 ${className || ""}`} />;
}

export default function MyPodPage() {
  useAuth();
  const [pod, setPod] = useState<PodData | null>(null);
  const [requests, setRequests] = useState<PodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const podsRes = await fetch("/api/pods/my");
        const podsJson = await podsRes.json();

        if (!podsJson.data || podsJson.data.length === 0) {
          setError("You are not assigned to any pod yet.");
          setLoading(false);
          return;
        }

        const currentPod = podsJson.data[0] as PodData;
        setPod(currentPod);

        const reqRes = await fetch(`/api/requests?pod_id=${currentPod.id}&limit=50`);
        const reqJson = await reqRes.json();
        setRequests(reqJson.data || []);
      } catch (err) {
        console.error("Failed to fetch pod data:", err);
        setError("Failed to load pod data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const activeRequests = requests.filter((r) => r.status === "in_progress" || r.status === "pending").length;
  const completedRequests = requests.filter((r) => r.status === "completed").length;

  const recentActivity = [...requests]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)
    .map((r) => ({
      id: r.id,
      action: r.status === "completed" ? "Request completed" : r.status === "in_progress" ? "Request in progress" : "Request updated",
      entity: r.title,
      user: r.assignee?.full_name || "Unassigned",
      time: timeAgo(r.updated_at),
    }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <SkeletonLine className="h-8 w-48 mb-2" />
          <SkeletonLine className="h-4 w-64" />
        </div>
        <Card>
          <CardHeader>
            <SkeletonLine className="h-6 w-32" />
            <SkeletonLine className="h-4 w-96" />
          </CardHeader>
        </Card>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <SkeletonLine className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <SkeletonLine className="h-8 w-12 mb-1" />
                <SkeletonLine className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !pod) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Pod</h1>
          <p className="text-muted-foreground">Your assigned pod and team overview</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {error || "No pod assigned."}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Pod</h1>
        <p className="text-muted-foreground">Your assigned pod and team overview</p>
      </div>

      {/* Pod Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{pod.name}</CardTitle>
              <CardDescription className="max-w-2xl">
                {pod.description || "No description available."}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              <Users className="mr-1 h-3 w-3" />
              {(pod.members?.length || 0) + 1} members
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRequests}</div>
            <p className="text-xs text-muted-foreground">In progress or pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedRequests}</div>
            <p className="text-xs text-muted-foreground">Requests done</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(pod.members?.length || 0) + 1}</div>
            <p className="text-xs text-muted-foreground">Including manager</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Manager */}
            {pod.manager && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={pod.manager.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(pod.manager.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{pod.manager.full_name}</p>
                      <p className="text-xs text-muted-foreground">Pod Manager</p>
                    </div>
                  </div>
                  <Badge variant="default" className="gap-1">
                    <Crown className="h-3 w-3" />
                    Manager
                  </Badge>
                </div>
                <Separator />
              </>
            )}
            {/* Members */}
            <div className="space-y-3">
              {pod.members?.map((entry) => {
                const member = entry.member;
                if (!member) return null;
                return (
                  <div key={entry.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(member.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.full_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{member.role?.replace("_", " ")}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Member</Badge>
                  </div>
                );
              })}
              {(!pod.members || pod.members.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No members assigned yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={activity.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.action}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">{activity.entity}</p>
                        <p className="text-xs text-muted-foreground">
                          by {activity.user}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {activity.time}
                      </span>
                    </div>
                    {index < recentActivity.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
