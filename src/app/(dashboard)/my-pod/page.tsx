"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";
import { Users, Clock, FileText, Package, Crown, Activity, UserPlus, Trash2, Shield } from "lucide-react";

interface PodManager {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

interface PodMemberProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string | null;
}

interface PodMemberEntry {
  id: string;
  role: string;
  joined_at: string;
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

function SkeletonLine({ className }: { className?: string }) {
  return <Skeleton className={`h-4 bg-zinc-800 ${className || ""}`} />;
}

export default function MyPodPage() {
  useAuth();
  const [pod, setPod] = useState<PodData | null>(null);
  const [members, setMembers] = useState<PodMemberEntry[]>([]);
  const [requests, setRequests] = useState<PodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showManagePOC, setShowManagePOC] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState("poc");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const podsRes = await fetch("/api/pods/my/pocs");
      const podsJson = await podsRes.json();

      if (!podsJson.pod) {
        setError("You are not assigned to any pod yet.");
        setLoading(false);
        return;
      }

      setPod(podsJson.pod);
      setMembers(podsJson.data || []);

      const reqRes = await fetch(`/api/requests?pod_id=${podsJson.pod.id}&limit=50`);
      const reqJson = await reqRes.json();
      setRequests(reqJson.data || []);
    } catch (err) {
      console.error("Failed to fetch pod data:", err);
      setError("Failed to load pod data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleAddPOC = async () => {
    if (!addEmail.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/pods/my/pocs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: addEmail.trim(), role: addRole }),
      });
      if (res.ok) {
        setAddEmail("");
        await fetchData();
      }
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (profileId: string) => {
    setRemoving(profileId);
    try {
      const res = await fetch(`/api/pods/my/pocs?profile_id=${profileId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchData();
      }
    } finally {
      setRemoving(null);
    }
  };

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
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                <Users className="mr-1 h-3 w-3" />
                {members.length + 1} members
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowManagePOC(true)}
                className="gap-1.5"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Manage Team
              </Button>
            </div>
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
            <div className="text-2xl font-bold">{members.length + 1}</div>
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
              {members.map((entry) => {
                const member = entry.member;
                if (!member) return null;
                const isPOC = entry.role === "poc";
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
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={isPOC ? "default" : "secondary"} className="gap-1 capitalize">
                        {isPOC && <Shield className="h-3 w-3" />}
                        {entry.role}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={removing === member.id}
                      >
                        {removing === member.id ? "..." : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                );
              })}
              {members.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No team members assigned yet.</p>
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

      {/* Manage POC Dialog */}
      <Dialog open={showManagePOC} onOpenChange={setShowManagePOC}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Team Members</DialogTitle>
            <DialogDescription>
              Add or remove team members (POCs) from your pod.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Profile ID"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
              />
              <Select value={addRole} onValueChange={setAddRole}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poc">POC</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleAddPOC} disabled={adding || !addEmail.trim()}>
                {adding ? "..." : "Add"}
              </Button>
            </div>

            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No members in this pod.</p>
            ) : (
              <div className="space-y-1">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted">
                    <div>
                      <span className="text-sm font-medium">{m.member?.full_name || "Unknown"}</span>
                      <span className="text-xs text-muted-foreground ml-2">{m.member?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">{m.role}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive h-7"
                        onClick={() => m.member && handleRemoveMember(m.member.id)}
                        disabled={removing === m.member?.id}
                      >
                        {removing === m.member?.id ? "..." : "Remove"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManagePOC(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
