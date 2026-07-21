"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Deliverable } from "@/types";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_review: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
  on_hold: "bg-orange-100 text-orange-800",
};

export function DeliverableList() {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [requestFilter] = useState("");

  const fetchDeliverables = async () => {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      if (requestFilter && requestFilter !== "all") params.set("request_id", requestFilter);

      const response = await fetch(`/api/deliverables?${params}`);
      const result = await response.json();

      if (response.ok) {
        setDeliverables(result.data);
        setTotalPages(result.totalPages);
      }
    } catch (error) {
      console.error("Error fetching deliverables:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliverables();
  }, [page, statusFilter, requestFilter]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead className="hidden md:table-cell">Assigned To</TableHead>
              <TableHead className="hidden md:table-cell">Submitted</TableHead>
              <TableHead className="hidden lg:table-cell">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliverables.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No deliverables found.
                </TableCell>
              </TableRow>
            ) : (
              deliverables.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <Link
                      href={`/deliverables/${d.id}`}
                      className="font-medium hover:underline"
                    >
                      {d.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[d.status]}>
                      {d.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>v{d.version}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {(d as unknown as Record<string, unknown>).assignee
                      ? ((d as unknown as Record<string, unknown>).assignee as Record<string, string>).full_name
                      : "Unassigned"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {d.submitted_at ? formatDate(d.submitted_at) : "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {formatDate(d.created_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
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
    </div>
  );
}
