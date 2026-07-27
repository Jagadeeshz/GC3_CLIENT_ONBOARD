"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { FileText, Search, Plus, Clock, CheckCircle2, AlertCircle, XCircle, Filter } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: string;
  category: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning"; icon: React.ComponentType<{ className?: string }> }> = {
  open: { label: "Open", variant: "warning", icon: AlertCircle },
  in_progress: { label: "In Progress", variant: "default", icon: Clock },
  resolved: { label: "Resolved", variant: "success", icon: CheckCircle2 },
  closed: { label: "Closed", variant: "secondary", icon: XCircle },
};

interface SupportTicketListProps {
  onCreateNew?: () => void;
}

export function SupportTicketList({ onCreateNew }: SupportTicketListProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch("/api/support");
      if (response.ok) {
        const result = await response.json();
        setTickets(result.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = tickets.filter((ticket) => {
    const matchesSearch = !search ||
      ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
      ticket.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Your Support Tickets
            </CardTitle>
            <CardDescription>Track and manage your support requests</CardDescription>
          </div>
          {onCreateNew && (
            <Button onClick={onCreateNew} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-3.5 w-3.5" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {tickets.length === 0 ? "No support tickets yet." : "No tickets match your search."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((ticket) => {
              const statusInfo = statusConfig[ticket.status] || statusConfig.open;
              const StatusIcon = statusInfo.icon;
              return (
                <Link key={ticket.id} href={`/support/${ticket.id}`}>
                  <div className="flex items-start justify-between rounded-xl border p-4 transition-colors hover:bg-muted/50 cursor-pointer">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium truncate">{ticket.subject}</h3>
                        <Badge variant={statusInfo.variant} className="shrink-0 text-[10px]">
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="capitalize">{ticket.category.replace("_", " ")}</span>
                        <span>·</span>
                        <span>{formatDate(ticket.created_at)}</span>
                      </div>
                    </div>
                    <Badge variant={ticket.priority === "high" ? "destructive" : "secondary"} className="shrink-0 ml-3 text-[10px]">
                      {ticket.priority}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
