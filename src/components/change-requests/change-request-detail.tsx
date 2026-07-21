"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, formatCurrency, getInitials } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";
import type { ChangeRequest } from "@/types";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  submitted: "bg-blue-100 text-blue-800",
  under_review: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  implemented: "bg-purple-100 text-purple-800",
};

interface ChangeRequestDetailProps {
  changeRequestId: string;
  userRole: string;
}

export function ChangeRequestDetail({ changeRequestId, userRole }: ChangeRequestDetailProps) {
  const [changeRequest, setChangeRequest] = useState<ChangeRequest & Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const canApprove = ["pod_manager", "cpiu", "leadership"].includes(userRole);

  useEffect(() => {
    fetchDetail();
  }, [changeRequestId]);

  const fetchDetail = async () => {
    try {
      const response = await fetch(`/api/change-requests/${changeRequestId}`);
      const result = await response.json();
      if (response.ok) {
        setChangeRequest(result.data);
        setNotes(result.data.pod_manager_notes || "");
      }
    } catch (error) {
      console.error("Error fetching change request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/change-requests/${changeRequestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, pod_manager_notes: notes }),
      });
      if (response.ok) {
        await fetchDetail();
      }
    } catch (error) {
      console.error("Error updating change request:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!changeRequest) return null;

  const client = changeRequest.client as Record<string, unknown> | undefined;
  const clientProfile = client?.profiles as Record<string, string> | undefined;
  const req = changeRequest.request as Record<string, string> | undefined;
  const reviewer = changeRequest.reviewer as Record<string, string> | undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{changeRequest.title}</h2>
          <p className="text-muted-foreground">{changeRequest.description}</p>
        </div>
        <Badge className={statusColors[changeRequest.status]}>
          {changeRequest.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Related Request</span>
              <span className="font-medium">{req?.title || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Client</span>
              <span className="font-medium">{client?.company_name as string || clientProfile?.full_name || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated Hours</span>
              <span className="font-medium">{changeRequest.estimated_hours || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated Cost</span>
              <span className="font-medium">
                {changeRequest.estimated_cost ? formatCurrency(changeRequest.estimated_cost) : "—"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">{formatDate(changeRequest.created_at)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {changeRequest.reason && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Reason</p>
                <p className="text-sm">{changeRequest.reason}</p>
              </div>
            )}
            {reviewer && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={reviewer.avatar_url as string} />
                  <AvatarFallback className="text-xs">{getInitials(reviewer.full_name as string)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">Reviewed by {reviewer.full_name as string}</span>
              </div>
            )}
            {changeRequest.reviewed_at && (
              <p className="text-sm text-muted-foreground">
                Reviewed on {formatDate(changeRequest.reviewed_at)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add pod manager notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            disabled={!canApprove}
          />
        </CardContent>
      </Card>

      {canApprove &&
        (changeRequest.status === "submitted" || changeRequest.status === "under_review") && (
          <div className="flex gap-3">
            <Button
              onClick={() => handleStatusUpdate("approved")}
              disabled={updating}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleStatusUpdate("rejected")}
              disabled={updating}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        )}
    </div>
  );
}
