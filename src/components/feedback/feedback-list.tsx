"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Star, ArrowUpDown } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import type { Feedback } from "@/types";

interface FeedbackWithDetails extends Feedback {
  client: {
    company_name: string;
    profiles: {
      full_name: string;
      email: string;
      avatar_url: string | null;
    };
  } | null;
  deliverable: { title: string } | null;
  request: { title: string } | null;
}

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-muted-foreground text-sm">—</span>;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

const typeColors: Record<string, string> = {
  deliverable: "bg-purple-100 text-purple-800",
  service: "bg-blue-100 text-blue-800",
  general: "bg-gray-100 text-gray-800",
};

type SortOption = "newest" | "highest" | "lowest";

export function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState<FeedbackWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  const fetchFeedbacks = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (typeFilter && typeFilter !== "all") params.set("type", typeFilter);

      const response = await fetch(`/api/feedback?${params}`);
      const result = await response.json();

      if (response.ok) {
        setFeedbacks(result.data);
        setTotalPages(result.totalPages);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [page, typeFilter]);

  const sortedFeedbacks = useMemo(() => {
    const sorted = [...feedbacks];
    switch (sortOption) {
      case "newest":
        return sorted.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "highest":
        return sorted.sort((b, a) => (a.rating ?? 0) - (b.rating ?? 0));
      case "lowest":
        return sorted.sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0));
      default:
        return sorted;
    }
  }, [feedbacks, sortOption]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="deliverable">Deliverable</SelectItem>
            <SelectItem value="service">Service</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="hidden md:table-cell">Comment</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedFeedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No feedback found.
                </TableCell>
              </TableRow>
            ) : (
              sortedFeedbacks.map((fb) => (
                <TableRow key={fb.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {fb.is_anonymous ? (
                        <span className="text-sm text-muted-foreground">Anonymous</span>
                      ) : (
                        <>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={fb.client?.profiles?.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {getInitials(fb.client?.profiles?.full_name || "?")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {fb.client?.company_name || fb.client?.profiles?.full_name || "Unknown"}
                          </span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StarRating rating={fb.rating} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge className={typeColors[fb.type]}>
                      {fb.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-xs truncate">
                    {fb.comment || "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {formatDate(fb.created_at)}
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
