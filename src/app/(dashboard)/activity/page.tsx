"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Clock,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  Upload,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { getInitials, timeAgo } from "@/lib/utils";

interface ActivityLog {
  id: string;
  user: string;
  action: "created" | "updated" | "deleted" | "approved" | "uploaded" | "viewed" | "submitted";
  entityType: string;
  entityName: string;
  entityId: string;
  timestamp: string;
  ipAddress: string;
  details?: string;
}

const ENTITY_TYPES = ["All", "Requests", "Deliverables", "Documents", "Clients", "Invoices"] as const;
type EntityTypeFilter = (typeof ENTITY_TYPES)[number];

const USERS = ["All", "John Smith", "Sarah Johnson", "Mike Chen", "Emily Davis", "Alex Rivera", "Lisa Wong"];

const actionConfig: Record<
  ActivityLog["action"],
  { color: string; icon: typeof Plus; label: string }
> = {
  created: { color: "bg-green-500", icon: Plus, label: "Created" },
  updated: { color: "bg-blue-500", icon: Pencil, label: "Updated" },
  deleted: { color: "bg-red-500", icon: Trash2, label: "Deleted" },
  approved: { color: "bg-emerald-500", icon: CheckCircle, label: "Approved" },
  uploaded: { color: "bg-purple-500", icon: Upload, label: "Uploaded" },
  viewed: { color: "bg-gray-400", icon: Eye, label: "Viewed" },
  submitted: { color: "bg-amber-500", icon: ArrowLeft, label: "Submitted" },
};

const MOCK_ACTIVITIES: ActivityLog[] = [
  {
    id: "1",
    user: "John Smith",
    action: "created",
    entityType: "Requests",
    entityName: "Website Redesign Phase 2",
    entityId: "req-123",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    ipAddress: "192.168.1.45",
    details: "New request created for client Acme Corp",
  },
  {
    id: "2",
    user: "Sarah Johnson",
    action: "approved",
    entityType: "Deliverables",
    entityName: "Brand Identity Guidelines v3",
    entityId: "del-456",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    ipAddress: "10.0.0.123",
    details: "Approved with minor revisions noted",
  },
  {
    id: "3",
    user: "Mike Chen",
    action: "uploaded",
    entityType: "Documents",
    entityName: "Q4 Marketing Strategy.pdf",
    entityId: "doc-789",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    ipAddress: "172.16.0.88",
    details: "Uploaded 2.4 MB file",
  },
  {
    id: "4",
    user: "Emily Davis",
    action: "updated",
    entityType: "Clients",
    entityName: "Acme Corp",
    entityId: "cli-101",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    ipAddress: "192.168.2.67",
    details: "Updated contact information",
  },
  {
    id: "5",
    user: "Alex Rivera",
    action: "submitted",
    entityType: "Deliverables",
    entityName: "Mobile App Wireframes",
    entityId: "del-502",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    ipAddress: "10.0.1.55",
    details: "Submitted for client review",
  },
  {
    id: "6",
    user: "Lisa Wong",
    action: "created",
    entityType: "Invoices",
    entityName: "Invoice #INV-2024-0089",
    entityId: "inv-089",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.5).toISOString(),
    ipAddress: "192.168.3.12",
    details: "Created for November services - $12,500",
  },
  {
    id: "7",
    user: "John Smith",
    action: "deleted",
    entityType: "Documents",
    entityName: "Draft Proposal (Outdated)",
    entityId: "doc-334",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    ipAddress: "192.168.1.45",
    details: "Removed superseded document",
  },
  {
    id: "8",
    user: "Sarah Johnson",
    action: "viewed",
    entityType: "Requests",
    entityName: "Content Strategy Audit",
    entityId: "req-200",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2.5).toISOString(),
    ipAddress: "10.0.0.123",
  },
  {
    id: "9",
    user: "Mike Chen",
    action: "created",
    entityType: "Deliverables",
    entityName: "SEO Performance Report",
    entityId: "del-610",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    ipAddress: "172.16.0.88",
    details: "Monthly deliverable created",
  },
  {
    id: "10",
    user: "Emily Davis",
    action: "approved",
    entityType: "Invoices",
    entityName: "Invoice #INV-2024-0085",
    entityId: "inv-085",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    ipAddress: "192.168.2.67",
    details: "Payment approved and processed",
  },
  {
    id: "11",
    user: "Alex Rivera",
    action: "updated",
    entityType: "Requests",
    entityName: "Social Media Campaign",
    entityId: "req-315",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    ipAddress: "10.0.1.55",
    details: "Priority changed from Medium to High",
  },
  {
    id: "12",
    user: "Lisa Wong",
    action: "submitted",
    entityType: "Documents",
    entityName: "Client Onboarding Checklist",
    entityId: "doc-450",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    ipAddress: "192.168.3.12",
    details: "Template submitted for approval",
  },
];

const PAGE_SIZE = 8;

export default function ActivityPage() {
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState<EntityTypeFilter>("All");
  const [userFilter, setUserFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return MOCK_ACTIVITIES.filter((a) => {
      if (entityFilter !== "All" && a.entityType !== entityFilter) return false;
      if (userFilter !== "All" && a.user !== userFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          a.entityName.toLowerCase().includes(q) ||
          a.user.toLowerCase().includes(q) ||
          a.action.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [entityFilter, userFilter, search]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exportCSV = () => {
    const header = "User,Action,Entity Type,Entity Name,Timestamp,IP Address\n";
    const rows = filtered
      .map(
        (a) =>
          `"${a.user}","${a.action}","${a.entityType}","${a.entityName}","${a.timestamp}","${a.ipAddress}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
          <p className="text-muted-foreground">
            Track all system activities and changes
          </p>
        </div>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={entityFilter}
              onValueChange={(v) => setEntityFilter(v as EntityTypeFilter)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                {USERS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-1">
        {visible.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No activities match your filters.
            </CardContent>
          </Card>
        )}

        {visible.map((activity) => {
          const cfg = actionConfig[activity.action];
          const ActionIcon = cfg.icon;
          const isExpanded = expandedIds.has(activity.id);

          return (
            <Card key={activity.id} className="relative overflow-hidden">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="relative flex flex-col items-center pt-1">
                  <div
                    className={`h-3 w-3 rounded-full ${cfg.color} ring-2 ring-background`}
                  />
                  <div className="w-px flex-1 bg-border mt-1" />
                </div>

                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                    {getInitials(activity.user)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm leading-snug">
                    <span className="font-semibold">{activity.user}</span>{" "}
                    <span className="text-muted-foreground">{cfg.label.toLowerCase()}</span>{" "}
                    <span className="font-medium">{activity.entityType.toLowerCase()}</span>{" "}
                    <span className="font-semibold text-primary">{activity.entityName}</span>
                  </p>

                  {activity.details && (
                    <p className="text-xs text-muted-foreground">
                      {activity.details}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{timeAgo(activity.timestamp)}</span>
                    <button
                      onClick={() => toggleExpand(activity.id)}
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                      IP: {isExpanded ? activity.ipAddress : "***.***.***.***"}
                    </button>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className="shrink-0 text-xs gap-1"
                >
                  <ActionIcon className="h-3 w-3" />
                  {cfg.label}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          >
            Load More ({filtered.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
