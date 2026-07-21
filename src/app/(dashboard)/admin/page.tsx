"use client";

import { useEffect, useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Activity,
  BarChart3,
  UserPlus,
  Mail,
  Loader2,
  Copy,
  Check,
  DollarSign,
  Briefcase,
  Layers,
  FileText,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  UserCheck,
  UserX,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/rbac/permissions";
import type { UserProfile, UserRole, ActivityLog } from "@/types";

// ──────────────────── Types ────────────────────

interface UsersResponse {
  data: UserProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PlatformStats {
  users: { total: number; active: number; byRole: Record<string, number> };
  clients: { total: number; active: number };
  pods: { total: number; active: number };
  requests: { total: number; byStatus: Record<string, number> };
  revenue: number;
  hoursUsed: number;
}

interface ActivityEntry extends ActivityLog {
  user?: { id: string; full_name: string; email: string; avatar_url: string | null };
}

interface ActivityResponse {
  data: ActivityEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface InvitedUser {
  id: string;
  email: string;
  role: string;
  invited_at: string;
}

// ──────────────────── Admin Page ────────────────────

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground">System administration and management</p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Stats
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagementTab />
        </TabsContent>

        <TabsContent value="stats">
          <PlatformStatsTab />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityLogTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ──────────────────── Users Tab ────────────────────

function UserManagementTab() {
  const [users, setUsers] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (roleFilter !== "all") params.set("role", roleFilter);

    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, [page, roleFilter, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateRole = async (userId: string, newRole: UserRole) => {
    setUpdating(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            data: prev.data.map((u) =>
              u.id === userId ? { ...u, role: newRole } : u
            ),
          };
        });
      }
    } finally {
      setUpdating(null);
    }
  };

  const toggleActive = async (userId: string, isActive: boolean) => {
    setUpdating(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, is_active: !isActive }),
      });
      if (res.ok) {
        setUsers((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            data: prev.data.map((u) =>
              u.id === userId ? { ...u, is_active: !isActive } : u
            ),
          };
        });
      }
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">User Management</h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 w-[200px]"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={(v) => {
              setRoleFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="pod_member">Pod Member</SelectItem>
              <SelectItem value="pod_manager">Pod Manager</SelectItem>
              <SelectItem value="cpiu">CPIU</SelectItem>
              <SelectItem value="leadership">Leadership</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users?.data.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                            {user.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(v) => updateRole(user.id, v as UserRole)}
                          disabled={updating === user.id}
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "success" : "secondary"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.last_login_at
                          ? new Date(user.last_login_at).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={user.is_active ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => toggleActive(user.id, user.is_active)}
                          disabled={updating === user.id}
                        >
                          {updating === user.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : user.is_active ? (
                            <>
                              <UserX className="mr-1 h-3 w-3" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-1 h-3 w-3" />
                              Activate
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {users && users.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, users.total)} of {users.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= users.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Separator className="my-6" />

      <InviteUserSection />
    </div>
  );
}

// ──────────────────── Invite User Section ────────────────────

function InviteUserSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState({
    email: "",
    full_name: "",
    role: "client" as UserRole,
    company_name: "",
    message: "",
  });

  const handleSubmit = async () => {
    if (!form.email || !form.full_name) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (response.ok) {
        setInvitedUsers((prev) => [result.data, ...prev]);
        setForm({ email: "", full_name: "", role: "client", company_name: "", message: "" });
        setDialogOpen(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyEmail = async (email: string) => {
    await navigator.clipboard.writeText(email);
    setCopiedId(email);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Invite User</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>
                Send a magic link invitation. The user will receive an email to complete their
                registration.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="inv-name">Full Name *</Label>
                  <Input
                    id="inv-name"
                    placeholder="John Doe"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inv-email">Email Address *</Label>
                  <Input
                    id="inv-email"
                    type="email"
                    placeholder="name@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={form.role}
                    onValueChange={(v) => setForm({ ...form, role: v as UserRole })}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="pod_member">Pod Member</SelectItem>
                      <SelectItem value="pod_manager">Pod Manager</SelectItem>
                      <SelectItem value="cpiu">CPIU</SelectItem>
                      <SelectItem value="leadership">Leadership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.role === "client" && (
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input
                      placeholder="Acme Corp"
                      value={form.company_name}
                      onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Personal Message (optional)</Label>
                <Textarea
                  placeholder="Welcome to GC3! We're excited to have you on board..."
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !form.email || !form.full_name}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-sm text-muted-foreground">
        Send a magic link invitation to onboard new users to the platform.
      </p>

      {invitedUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Role: {ROLE_LABELS[user.role as UserRole]} · Invited{" "}
                      {new Date(user.invited_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => copyEmail(user.email)}>
                    {copiedId === user.email ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ──────────────────── Stats Tab ────────────────────

function PlatformStatsTab() {
  const [data, setData] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    {
      title: "Total Users",
      value: data.users.total,
      sub: `${data.users.active} active`,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Active Users",
      value: data.users.active,
      sub: `${data.users.total > 0 ? Math.round((data.users.active / data.users.total) * 100) : 0}% of total`,
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Clients",
      value: data.clients.total,
      sub: `${data.clients.active} active`,
      icon: Briefcase,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Pods",
      value: data.pods.total,
      sub: `${data.pods.active} active`,
      icon: Layers,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      title: "Revenue",
      value: formatCurrency(data.revenue),
      sub: "Paid invoices",
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Requests",
      value: data.requests.total,
      sub: `${Object.keys(data.requests.byStatus).length} status types`,
      icon: FileText,
      color: "text-cyan-600",
      bg: "bg-cyan-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
              <div className={`rounded-lg p-2 ${c.bg}`}>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
              <p className="text-xs text-muted-foreground">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Users by Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(data.users.byRole).map(([role, count]) => {
              const pct =
                data.users.total > 0 ? Math.round((count / data.users.total) * 100) : 0;
              return (
                <div key={role} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">{role.replace("_", " ")}</span>
                    <span className="font-medium">
                      {count} <span className="text-muted-foreground">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Requests by Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(data.requests.byStatus).map(([status, count]) => {
              const pct =
                data.requests.total > 0
                  ? Math.round((count / data.requests.total) * 100)
                  : 0;
              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">{status.replace("_", " ")}</span>
                    <span className="font-medium">
                      {count} <span className="text-muted-foreground">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ──────────────────── Activity Log Tab ────────────────────

function ActivityLogTab() {
  const [data, setData] = useState<ActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchActivity = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
    });
    if (entityFilter !== "all") params.set("entity_type", entityFilter);

    fetch(`/api/admin/activity?${params}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [page, entityFilter]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const filteredData = data
    ? {
        ...data,
        data: data.data.filter((entry) => {
          if (!userSearch.trim()) return true;
          const lower = userSearch.toLowerCase();
          return (
            entry.user?.full_name?.toLowerCase().includes(lower) ||
            entry.user?.email?.toLowerCase().includes(lower) ||
            entry.action.toLowerCase().includes(lower)
          );
        }),
      }
    : null;

  const entityTypes = data
    ? Array.from(new Set(data.data.map((e) => e.entity_type))).sort()
    : [];

  const getActionColor = (action: string) => {
    const lower = action.toLowerCase();
    if (lower.includes("create") || lower.includes("add")) return "text-green-600";
    if (lower.includes("delete") || lower.includes("remove")) return "text-red-600";
    if (lower.includes("update") || lower.includes("edit")) return "text-blue-600";
    if (lower.includes("deactivate") || lower.includes("disable")) return "text-orange-600";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Activity Log</h3>
          <p className="text-sm text-muted-foreground">{data?.total ?? 0} total entries</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter by user..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="pl-10 w-[200px]"
            />
          </div>
          <Select
            value={entityFilter}
            onValueChange={(v) => {
              setEntityFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Entity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              {entityTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !filteredData || filteredData.data.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No activity entries found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredData.data.map((entry) => (
            <Card key={entry.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div
                  className="flex items-start justify-between gap-4 cursor-pointer"
                  onClick={() =>
                    setExpandedId(expandedId === entry.id ? null : entry.id)
                  }
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium shrink-0 mt-0.5">
                      {entry.user?.full_name
                        ? entry.user.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : "SY"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {entry.user?.full_name || "System"}
                        </span>
                        <span className={`text-sm font-medium ${getActionColor(entry.action)}`}>
                          {entry.action}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-xs">
                          {entry.entity_type}
                        </Badge>
                        {entry.entity_name && (
                          <span className="text-xs text-muted-foreground truncate">
                            {entry.entity_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleString()}
                    </span>
                    {expandedId === entry.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                {expandedId === entry.id && (
                  <div className="mt-3 ml-11 pt-3 border-t space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground">Entity ID: </span>
                        <span className="font-mono text-xs">{entry.entity_id || "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">IP: </span>
                        <span className="font-mono text-xs">{entry.ip_address || "N/A"}</span>
                      </div>
                      {entry.user && (
                        <>
                          <div>
                            <span className="text-muted-foreground">User Email: </span>
                            <span>{entry.user.email}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">User ID: </span>
                            <span className="font-mono text-xs">{entry.user.id}</span>
                          </div>
                        </>
                      )}
                    </div>
                    {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                      <div>
                        <span className="text-muted-foreground">Metadata: </span>
                        <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                          {JSON.stringify(entry.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
