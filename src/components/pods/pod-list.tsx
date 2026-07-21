"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CreatePodForm } from "./create-pod-form";
import { PodDetail } from "./pod-detail";
import type { Pod } from "@/types";

interface PodWithMembers extends Pod {
  manager?: { id: string; full_name: string; email: string; avatar_url: string | null };
  members?: Array<{ id: string; member?: { id: string; full_name: string; role: string } }>;
}

interface PodsResponse {
  data: PodWithMembers[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function PodList() {
  const [pods, setPods] = useState<PodsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPod, setSelectedPod] = useState<string | null>(null);

  const fetchPods = () => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);

    fetch(`/api/pods?${params}`)
      .then((r) => r.json())
      .then(setPods)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPods();
  }, [page, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">Pods</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Search pods..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-[200px]"
          />
          <Button onClick={() => setShowCreate(true)}>Add Pod</Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pod Name</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pods?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No pods found.
                    </TableCell>
                  </TableRow>
                ) : (
                  pods?.data.map((pod) => (
                    <TableRow key={pod.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{pod.name}</p>
                          {pod.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {pod.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {pod.manager?.full_name || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {pod.members?.length || 0} members
                      </TableCell>
                      <TableCell>
                        <Badge variant={pod.is_active ? "success" : "secondary"}>
                          {pod.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedPod(pod.id)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {pods && pods.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, pods.total)} of {pods.total}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= pods.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <CreatePodForm open={showCreate} onOpenChange={setShowCreate} onCreated={fetchPods} />

      {selectedPod && (
        <PodDetail
          podId={selectedPod}
          open={!!selectedPod}
          onOpenChange={(open) => {
            if (!open) setSelectedPod(null);
          }}
        />
      )}
    </div>
  );
}
