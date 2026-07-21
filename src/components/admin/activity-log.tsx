"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActivityLog } from "@/types";

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

export function ActivityLogComponent() {
  const [data, setData] = useState<ActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/activity?page=${page}&limit=20`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Activity Log</h3>
        <p className="text-sm text-muted-foreground">{data.total} total entries</p>
      </div>

      {data.data.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">No activity recorded yet.</CardContent>
        </Card>
      ) : (
        <div className="space-y-1">
          {data.data.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {entry.user?.full_name || "System"}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-sm">{entry.action}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {entry.entity_type}
                      {entry.entity_name && `: ${entry.entity_name}`}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
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
