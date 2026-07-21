"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  UserPlus,
  Users,
  Shield,
  Mail,
  MoreVertical,
  Trash2,
  Ban,
  RotateCcw,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { InviteMemberModal } from "@/components/workspace/invite-member-modal";
import type { WorkspaceMember } from "@/types";

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  project_manager: "Project Manager",
  marketing: "Marketing",
  finance: "Finance",
  reviewer: "Reviewer",
  viewer: "Viewer",
};

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-primary/10 text-primary border-primary/20",
  project_manager: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  marketing: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  finance: "bg-green-500/10 text-green-600 border-green-500/20",
  reviewer: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  viewer: "bg-muted text-muted-foreground border-border",
};

export function WorkspaceMembersSettings() {
  const { user } = useAuth();
  const [members, setMembers] = React.useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingRole, setEditingRole] = React.useState<string>("");
  const [actionMenuOpen, setActionMenuOpen] = React.useState<string | null>(null);

  const fetchMembers = React.useCallback(async () => {
    try {
      const response = await fetch("/api/workspace-members");
      const result = await response.json();
      if (response.ok) {
        setMembers(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/workspace-members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.error || "Failed to update role");
        return;
      }

      toast.success("Role updated successfully");
      setEditingId(null);
      fetchMembers();
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleToggleStatus = async (memberId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      const response = await fetch(`/api/workspace-members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.error || `Failed to ${newStatus === "active" ? "reactivate" : "suspend"} member`);
        return;
      }

      toast.success(`Member ${newStatus === "active" ? "reactivated" : "suspended"}`);
      setActionMenuOpen(null);
      fetchMembers();
    } catch {
      toast.error("Failed to update member status");
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      const response = await fetch(`/api/workspace-members/${memberId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(result.error || "Failed to remove member");
        return;
      }

      toast.success("Member removed from workspace");
      setActionMenuOpen(null);
      fetchMembers();
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const isOwner = user?.role === "client";

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Workspace Members
            </CardTitle>
            <CardDescription>
              Manage your organization&apos;s team members and their permissions
            </CardDescription>
          </div>
          {isOwner && (
            <Button onClick={() => setInviteOpen(true)} size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No workspace members yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Invite your team members to collaborate in this workspace
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {member.profile?.full_name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {member.profile?.full_name || "Unknown"}
                      </p>
                      {member.role === "owner" && (
                        <Shield className="h-3.5 w-3.5 text-primary" />
                      )}
                      {member.status === "pending" && (
                        <Badge variant="outline" className="text-xs border-amber-500/20 text-amber-600 bg-amber-500/10">
                          Pending
                        </Badge>
                      )}
                      {member.status === "suspended" && (
                        <Badge variant="outline" className="text-xs border-destructive/20 text-destructive bg-destructive/10">
                          Suspended
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {member.profile?.email}
                      </p>
                      {member.department && (
                        <p className="text-xs text-muted-foreground">
                          {member.department}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {editingId === member.id ? (
                    <div className="flex items-center gap-1">
                      <Select
                        value={editingRole}
                        onValueChange={setEditingRole}
                      >
                        <SelectTrigger className="w-36 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_LABELS)
                            .filter(([key]) => key !== "owner")
                            .map(([value, label]) => (
                              <SelectItem key={value} value={value} className="text-xs">
                                {label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleUpdateRole(member.id, editingRole)}
                      >
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Badge
                        variant="outline"
                        className={`text-xs ${ROLE_COLORS[member.role] || ""}`}
                      >
                        {ROLE_LABELS[member.role] || member.role}
                      </Badge>

                      {isOwner && member.role !== "owner" && (
                        <div className="relative">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() =>
                              setActionMenuOpen(
                                actionMenuOpen === member.id ? null : member.id
                              )
                            }
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>

                          {actionMenuOpen === member.id && (
                            <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border bg-background shadow-lg">
                              <button
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                                onClick={() => {
                                  setEditingId(member.id);
                                  setEditingRole(member.role);
                                  setActionMenuOpen(null);
                                }}
                              >
                                <Edit2 className="h-4 w-4" />
                                Edit Role
                              </button>
                              <button
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                                onClick={() =>
                                  handleToggleStatus(member.id, member.status)
                                }
                              >
                                {member.status === "active" ? (
                                  <>
                                    <Ban className="h-4 w-4 text-amber-600" />
                                    Suspend
                                  </>
                                ) : (
                                  <>
                                    <RotateCcw className="h-4 w-4 text-green-600" />
                                    Reactivate
                                  </>
                                )}
                              </button>
                              <button
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                onClick={() => handleRemove(member.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <InviteMemberModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvited={fetchMembers}
      />
    </Card>
  );
}
