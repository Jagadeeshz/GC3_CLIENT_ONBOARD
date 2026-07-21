"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Clock, User, Calendar, Tag } from "lucide-react";

interface RequestDetailProps {
  requestId: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_review: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
  on_hold: "bg-orange-100 text-orange-800",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

export function RequestDetail({ requestId }: RequestDetailProps) {
  const [request, setRequest] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [actualHours, setActualHours] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  const canManage = user?.role === "pod_manager" || user?.role === "cpiu" || user?.role === "leadership";

  const fetchRequest = async () => {
    try {
      const response = await fetch(`/api/requests/${requestId}`);
      const result = await response.json();
      if (response.ok) {
        setRequest(result.data);
        setActualHours(result.data.actual_hours?.toString() || "");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [requestId]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success("Status updated");
        fetchRequest();
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const updateHours = async () => {
    if (!actualHours) return;
    setUpdating(true);
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actual_hours: parseFloat(actualHours) }),
      });

      if (response.ok) {
        toast.success("Hours updated");
        fetchRequest();
      }
    } catch {
      toast.error("Failed to update hours");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!request) {
    return <div className="text-center py-8 text-muted-foreground">Request not found</div>;
  }

  const client = request.client as Record<string, unknown> | undefined;
  const clientProfile = client?.profiles as Record<string, string> | undefined;
  const pod = request.pod as Record<string, string> | undefined;
  const assignee = request.assignee as Record<string, string> | undefined;
  const deliverables = (request.deliverables || []) as Array<Record<string, unknown>>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{request.title as string}</h1>
          <p className="text-muted-foreground">
            Request #{(request.id as string).slice(0, 8)}
          </p>
        </div>
        <Badge className={statusColors[request.status as string]}>
          {(request.status as string).replace("_", " ")}
        </Badge>
        <Badge className={priorityColors[request.priority as string]}>
          {request.priority as string}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {request.description as string}
              </p>
            </CardContent>
          </Card>

          {deliverables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Deliverables ({deliverables.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deliverables.map((d) => (
                    <div key={d.id as string} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <p className="font-medium">{d.title as string}</p>
                        <p className="text-sm text-muted-foreground">
                          Version {d.version as number} · {formatDate(d.created_at as string)}
                        </p>
                      </div>
                      <Badge className={statusColors[d.status as string]}>
                        {(d.status as string).replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Client:</span>
                <span>{clientProfile?.full_name || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Assigned:</span>
                <span>{assignee?.full_name || "Unassigned"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Pod:</span>
                <span>{(pod as Record<string, string>)?.name || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Due:</span>
                <span>{request.due_date ? formatDate(request.due_date as string) : "No due date"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Est. Hours:</span>
                <span>{request.estimated_hours ? String(request.estimated_hours) : "\u2014"}</span>
              </div>

              {canManage && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Update Status</Label>
                    <Select
                      value={request.status as string}
                      onValueChange={updateStatus}
                      disabled={updating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Actual Hours</Label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.5"
                        value={actualHours}
                        onChange={(e) => setActualHours(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="0"
                      />
                      <Button size="sm" onClick={updateHours} disabled={updating}>
                        Save
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
