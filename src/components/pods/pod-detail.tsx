"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ManageMembers } from "./manage-members";

interface Member {
  id: string;
  role: string;
  member?: { id: string; full_name: string; email: string; avatar_url: string | null };
}

interface PodRequest {
  id: string;
  title: string;
  status: string;
  priority: string;
}

interface PodData {
  id: string;
  name: string;
  description: string | null;
  manager?: { id: string; full_name: string; email: string; avatar_url: string | null };
  members: Member[];
  requests: PodRequest[];
}

interface PodDetailProps {
  podId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PodDetail({ podId, open, onOpenChange }: PodDetailProps) {
  const [data, setData] = useState<PodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMembers, setShowMembers] = useState(false);

  const loadPod = async () => {
    try {
      const r = await fetch(`/api/pods/${podId}`);
      const d = await r.json();
      setData(d.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    loadPod();
  }, [podId, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => onOpenChange(false)}>
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">{data.name}</h3>
                {data.description && (
                  <p className="text-sm text-muted-foreground">{data.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowMembers(true)}>
                  Manage Members
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Members ({data.members?.length || 0})</h4>
              {!data.members || data.members.length === 0 ? (
                <p className="text-sm text-muted-foreground">No members assigned.</p>
              ) : (
                <div className="space-y-1">
                  {data.members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-sm py-1">
                      <div>
                        <span className="font-medium">{m.member?.full_name || "Unknown"}</span>
                        <span className="text-muted-foreground ml-2">{m.member?.email}</span>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">{m.role}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {data.requests && data.requests.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Assigned Requests ({data.requests.length})</h4>
                <div className="space-y-1">
                  {data.requests.slice(0, 8).map((r) => (
                    <div key={r.id} className="flex items-center justify-between text-sm">
                      <span>{r.title}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs capitalize">{r.priority}</Badge>
                        <Badge variant="secondary" className="text-xs">{r.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">Pod not found.</p>
        )}
      </div>

      <ManageMembers
        podId={podId}
        open={showMembers}
        onOpenChange={setShowMembers}
        onMembersChanged={() => {
          fetch(`/api/pods/${podId}`)
            .then((r) => r.json())
            .then((d) => setData(d.data));
        }}
      />
    </div>
  );
}
