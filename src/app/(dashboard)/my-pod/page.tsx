"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";
import {
  Users,
  Package,
  Crown,
  UserPlus,
  Trash2,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Pencil,
  Loader2,
  Briefcase,
  Circle,
} from "lucide-react";
import { toast } from "sonner";

interface PodManager {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
}

interface PodMemberProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
}

interface PodMemberEntry {
  id: string;
  role: string;
  joined_at: string;
  member: PodMemberProfile | null;
}

interface PodEngagement {
  id: string;
  title: string;
  status: string;
  priority: string;
}

interface PodData {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  manager: PodManager | null;
  members: PodMemberEntry[];
  engagements: PodEngagement[];
}

const ROLE_BADGE_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  manager: "default",
  poc: "default",
  lead: "secondary",
  member: "outline",
};

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-500",
  busy: "bg-amber-500",
  away: "bg-zinc-400",
};

export default function MyPodPage() {
  useAuth();
  const [pod, setPod] = useState<PodData | null>(null);
  const [allMembers, setAllMembers] = useState<PodMemberEntry[]>([]);
  const [engagements, setEngagements] = useState<PodEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [showManagePOC, setShowManagePOC] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState("poc");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<PodMemberEntry | null>(null);

  const [editMember, setEditMember] = useState<PodMemberEntry | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editRole, setEditRole] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const podsRes = await fetch("/api/pods/my/pocs");
      const podsJson = await podsRes.json();

      if (!podsJson.pod) {
        setError("You are not assigned to any pod yet.");
        return;
      }

      setPod(podsJson.pod);
      setAllMembers(podsJson.data || []);
      setEngagements(podsJson.engagements || []);
    } catch (err) {
      console.error("Failed to fetch pod data:", err);
      setError("Failed to load pod data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredMembers = allMembers.filter((entry) => {
    if (!search) return true;
    const m = entry.member;
    if (!m) return false;
    const q = search.toLowerCase();
    return (
      m.full_name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      entry.role.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredMembers.length / pageSize);
  const paginatedMembers = filteredMembers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const totalMembers = allMembers.length + (pod?.manager ? 1 : 0);
  const availableMembers = allMembers.filter(
    (m) => m.member?.is_active
  ).length + (pod?.manager?.role ? 1 : 0);

  const handleAddMember = async () => {
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
        setAddRole("poc");
        toast.success("Member added to pod");
        await fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add member");
      }
    } catch {
      toast.error("Failed to add member");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove?.member) return;
    setRemovingId(memberToRemove.member.id);
    try {
      const res = await fetch(
        `/api/pods/my/pocs?profile_id=${memberToRemove.member.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success("Member removed from pod");
        await fetchData();
      } else {
        toast.error("Failed to remove member");
      }
    } catch {
      toast.error("Failed to remove member");
    } finally {
      setRemovingId(null);
      setRemoveDialogOpen(false);
      setMemberToRemove(null);
    }
  };

  const handleEditMember = async () => {
    if (!editMember?.member || !editRole) return;
    setSavingEdit(true);
    try {
      const res = await fetch("/api/pods/my/pocs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: editMember.member.id,
          role: editRole,
        }),
      });
      if (res.ok) {
        toast.success("Member role updated");
        setEditDialogOpen(false);
        setEditMember(null);
        await fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update member");
      }
    } catch {
      toast.error("Failed to update member");
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
        </Card>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !pod) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pod Team</h1>
          <p className="text-muted-foreground">Your assigned pod and team overview</p>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No Pod Assigned</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {error || "You are not currently assigned to any pod. Contact your administrator to get assigned."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pod Team</h1>
          <p className="text-muted-foreground">
            Your assigned pod and team overview
          </p>
        </div>
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

      {/* Pod Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{pod.name}</CardTitle>
                <Badge variant={pod.is_active ? "default" : "secondary"}>
                  {pod.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                {pod.description || "No description available."}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">Including manager</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Circle className="h-4 w-4 text-green-500 fill-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableMembers}</div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Engagements</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagements.length}</div>
            <p className="text-xs text-muted-foreground">Active assignments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Role</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold capitalize">
              {pod.manager?.id &&
              allMembers.some((m) => m.member?.id === pod.manager?.id)
                ? "Manager"
                : "Member"}
            </div>
            <p className="text-xs text-muted-foreground">Your pod role</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Team Members List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Members ({totalMembers})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Pod Manager */}
            {pod.manager && (
              <>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={pod.manager.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-primary/20 text-primary">
                      {getInitials(pod.manager.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {pod.manager.full_name}
                      </p>
                      <Badge variant="default" className="gap-1 shrink-0 text-[10px]">
                        <Crown className="h-3 w-3" />
                        Pod Manager
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {pod.manager.email}
                    </p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Members */}
            {allMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No team members assigned yet.
              </p>
            ) : (
              allMembers.map((entry) => {
                const member = entry.member;
                if (!member) return null;
                const isPOC = entry.role === "poc";
                const isLead = entry.role === "lead";
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(member.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${STATUS_COLORS[member.is_active ? "available" : "away"]}`}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium truncate">
                            {member.full_name}
                          </p>
                          {isPOC && (
                            <Shield className="h-3 w-3 text-primary shrink-0" />
                          )}
                          {isLead && (
                            <Crown className="h-3 w-3 text-amber-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge
                        variant={ROLE_BADGE_VARIANTS[entry.role] || "outline"}
                        className="capitalize text-[10px]"
                      >
                        {entry.role}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          setEditMember(entry);
                          setEditRole(entry.role);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => {
                          setMemberToRemove(entry);
                          setRemoveDialogOpen(true);
                        }}
                        disabled={removingId === member.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Active Engagements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Active Engagements ({engagements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {engagements.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto mb-3">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No active engagements
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {engagements.map((eng) => (
                  <div
                    key={eng.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{eng.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {eng.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">
                          {eng.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full Team Table with Search & Pagination */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              All Team Members
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                {search ? "No members match your search." : "No team members."}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead className="hidden md:table-cell">Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedMembers.map((entry) => {
                      const m = entry.member;
                      if (!m) return null;
                      return (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={m.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(m.full_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-medium">
                                    {m.full_name}
                                  </span>
                                  {entry.role === "poc" && (
                                    <Shield className="h-3 w-3 text-primary" />
                                  )}
                                  {entry.role === "lead" && (
                                    <Crown className="h-3 w-3 text-amber-500" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={ROLE_BADGE_VARIANTS[entry.role] || "outline"}
                              className="capitalize text-[10px]"
                            >
                              {entry.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                              <Mail className="h-3 w-3" />
                              {m.email}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                              <Phone className="h-3 w-3" />
                              {m.phone || "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={m.is_active ? "default" : "secondary"}
                              className="text-[10px] gap-1"
                            >
                              <div
                                className={`h-1.5 w-1.5 rounded-full ${m.is_active ? "bg-green-500" : "bg-zinc-400"}`}
                              />
                              {m.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setEditMember(entry);
                                  setEditRole(entry.role);
                                  setEditDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setMemberToRemove(entry);
                                  setRemoveDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

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
            <div className="space-y-2">
              <Label htmlFor="add-member-id">Profile ID or Email</Label>
              <div className="flex gap-2">
                <Input
                  id="add-member-id"
                  placeholder="Enter profile ID or email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddMember();
                  }}
                />
                <Select value={addRole} onValueChange={setAddRole}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="poc">POC</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleAddMember}
                  disabled={adding || !addEmail.trim()}
                >
                  {adding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {allMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No members in this pod.
              </p>
            ) : (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {allMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={m.member?.avatar_url || undefined} />
                        <AvatarFallback className="text-[10px]">
                          {getInitials(m.member?.full_name || "U")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="text-sm font-medium">
                          {m.member?.full_name || "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {m.member?.email}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {m.role}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive h-7"
                        onClick={() => {
                          setMemberToRemove(m);
                          setRemoveDialogOpen(true);
                        }}
                      >
                        Remove
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

      {/* Edit Member Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Member Role</DialogTitle>
            <DialogDescription>
              Update the role for {editMember?.member?.full_name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poc">POC (Point of Contact)</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={savingEdit}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditMember}
              disabled={savingEdit || !editRole}
            >
              {savingEdit && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{memberToRemove?.member?.full_name || "this member"}</strong>{" "}
              from the pod? This action can be undone by re-adding them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleRemoveMember}
              disabled={removingId !== null}
            >
              {removingId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
