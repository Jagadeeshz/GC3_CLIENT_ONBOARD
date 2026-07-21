"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Member {
  id: string;
  role: string;
  member?: { id: string; full_name: string; email: string };
}

interface ManageMembersProps {
  podId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMembersChanged: () => void;
}

export function ManageMembers({ podId, open, onOpenChange, onMembersChanged }: ManageMembersProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("member");
  const [adding, setAdding] = useState(false);

  const fetchMembers = async () => {
    try {
      const r = await fetch(`/api/pods/${podId}/members`);
      const d = await r.json();
      setMembers(d.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    fetchMembers();
  }, [podId, open]);

  const addMember = async () => {
    if (!userId.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/pods/${podId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, role }),
      });
      if (res.ok) {
        setUserId("");
        const data = await res.json();
        setMembers((prev) => [...prev, data.data]);
        onMembersChanged();
      }
    } finally {
      setAdding(false);
    }
  };

  const removeMember = async (userId: string) => {
    const res = await fetch(`/api/pods/${podId}/members?user_id=${userId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.member?.id !== userId));
      onMembersChanged();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Members</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={addMember} disabled={adding || !userId.trim()}>
              {adding ? "..." : "Add"}
            </Button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No members in this pod.</p>
          ) : (
            <div className="space-y-1">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted">
                  <div>
                    <span className="text-sm font-medium">{m.member?.full_name || "Unknown"}</span>
                    <span className="text-xs text-muted-foreground ml-2">{m.member?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">{m.role}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive h-7"
                      onClick={() => removeMember(m.member?.id || m.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
