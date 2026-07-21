"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { Users, Clock, FileText, Package, Crown, Activity } from "lucide-react";

const mockPod = {
  id: "pod-1",
  name: "Alpha Pod",
  description: "Full-stack development pod specializing in web applications, API integrations, and cloud infrastructure.",
  memberCount: 8,
  manager: {
    id: "mgr-1",
    name: "Sarah Chen",
    avatar: null,
    role: "pod_manager" as const,
    title: "Pod Manager",
  },
  members: [
    { id: "m-1", name: "James Rivera", avatar: null, role: "pod_member" as const, title: "Senior Developer" },
    { id: "m-2", name: "Priya Patel", avatar: null, role: "pod_member" as const, title: "Frontend Engineer" },
    { id: "m-3", name: "Marcus Johnson", avatar: null, role: "pod_member" as const, title: "Backend Engineer" },
    { id: "m-4", name: "Aisha Williams", avatar: null, role: "pod_member" as const, title: "UI/UX Designer" },
    { id: "m-5", name: "David Kim", avatar: null, role: "pod_member" as const, title: "DevOps Engineer" },
    { id: "m-6", name: "Elena Volkov", avatar: null, role: "pod_member" as const, title: "QA Engineer" },
    { id: "m-7", name: "Carlos Mendez", avatar: null, role: "pod_member" as const, title: "Full-Stack Developer" },
  ],
  stats: {
    activeRequests: 12,
    completedDeliverables: 47,
    hoursUsed: 324.5,
    hoursRemaining: 175.5,
  },
  recentActivity: [
    { id: "a-1", action: "Deliverable submitted", entity: "Website Redesign Mockups", user: "Aisha Williams", time: "2 hours ago" },
    { id: "a-2", action: "Request completed", entity: "API Integration Module", user: "James Rivera", time: "5 hours ago" },
    { id: "a-3", action: "New request assigned", entity: "Database Migration Plan", user: "Sarah Chen", time: "1 day ago" },
    { id: "a-4", action: "Hours logged", entity: "Cloud Infrastructure Setup", user: "David Kim", time: "1 day ago" },
    { id: "a-5", action: "Review completed", entity: "Mobile App Prototype", user: "Sarah Chen", time: "2 days ago" },
  ],
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function getRoleBadgeVariant(role: string) {
  return role === "pod_manager" ? ("default" as const) : ("secondary" as const);
}

function getRoleLabel(role: string) {
  return role === "pod_manager" ? "Manager" : "Member";
}

export default function MyPodPage() {
  useAuth();
  const pod = mockPod;

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
              <CardDescription className="max-w-2xl">{pod.description}</CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              <Users className="mr-1 h-3 w-3" />
              {pod.memberCount} members
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
            <div className="text-2xl font-bold">{pod.stats.activeRequests}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pod.stats.completedDeliverables}</div>
            <p className="text-xs text-muted-foreground">Deliverables</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hours Used</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pod.stats.hoursUsed}</div>
            <p className="text-xs text-muted-foreground">This billing period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hours Remaining</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pod.stats.hoursRemaining}</div>
            <p className="text-xs text-muted-foreground">Available</p>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={pod.manager.avatar || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(pod.manager.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{pod.manager.name}</p>
                  <p className="text-xs text-muted-foreground">{pod.manager.title}</p>
                </div>
              </div>
              <Badge variant={getRoleBadgeVariant(pod.manager.role)} className="gap-1">
                <Crown className="h-3 w-3" />
                {getRoleLabel(pod.manager.role)}
              </Badge>
            </div>
            <Separator />
            {/* Members */}
            <div className="space-y-3">
              {pod.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={member.avatar || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.title}</p>
                    </div>
                  </div>
                  <Badge variant={getRoleBadgeVariant(member.role)}>
                    {getRoleLabel(member.role)}
                  </Badge>
                </div>
              ))}
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
              {pod.recentActivity.map((activity, index) => (
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
                  {index < pod.recentActivity.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
