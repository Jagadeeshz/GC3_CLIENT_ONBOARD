"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Clock, User, Calendar, Tag, Download, Upload, FileText, X, CheckCircle2 } from "lucide-react";
import { CommentThread } from "@/components/shared/comment-thread";
import { uploadFileClient, BUCKETS } from "@/lib/database/storage";
import { createSupabaseClient } from "@/lib/supabase/client";

interface RequestDetailProps {
  requestId: string;
}

interface FileAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  created_at: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  uploaded: boolean;
  path: string | null;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
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
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
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

  const fetchAttachments = useCallback(async () => {
    try {
      const supabase = createSupabaseClient();
      const { data } = await supabase.storage.from(BUCKETS.ATTACHMENTS).list(`requests/${requestId}`);
      if (data) {
        const attachmentsList: FileAttachment[] = await Promise.all(
          data.map(async (file: { id?: string; name: string; metadata?: { size?: number }; created_at?: string }) => {
            const { data: urlData } = await supabase.storage
              .from(BUCKETS.ATTACHMENTS)
              .createSignedUrl(`requests/${requestId}/${file.name}`, 3600);
            return {
              id: file.id || file.name,
              name: file.name,
              url: urlData?.signedUrl || "",
              size: file.metadata?.size || 0,
              created_at: file.created_at || new Date().toISOString(),
            };
          })
        );
        setAttachments(attachmentsList);
      }
    } catch (error) {
      console.error("Error fetching attachments:", error);
    }
  }, [requestId]);

  useEffect(() => {
    fetchRequest();
    fetchAttachments();
  }, [requestId, fetchAttachments]);

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

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newUploads: UploadProgress[] = files.map((file) => ({
      file,
      progress: 0,
      uploaded: false,
      path: null,
    }));
    setUploads((prev) => [...prev, ...newUploads]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = `requests/${requestId}/${Date.now()}-${file.name}`;
      const result = await uploadFileClient(BUCKETS.ATTACHMENTS, path, file, (progress) => {
        setUploads((prev) => prev.map((u, idx) => idx === i ? { ...u, progress } : u));
      });
      if (result) {
        setUploads((prev) => prev.map((u, idx) => idx === i ? { ...u, uploaded: true, path: result } : u));
      }
    }
    toast.success("Files uploaded successfully");
    fetchAttachments();
    setUploads([]);
  }, [requestId, fetchAttachments]);

  const removeUpload = useCallback((index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleDownload = async (attachment: FileAttachment) => {
    if (attachment.url) {
      window.open(attachment.url, "_blank");
    }
  };

  const handleDeliverableDownload = async (deliverable: Record<string, unknown>) => {
    const fileUrl = deliverable.file_url as string | null;
    if (fileUrl) {
      const supabase = createSupabaseClient();
      const { data } = await supabase.storage
        .from(BUCKETS.DELIVERABLES)
        .createSignedUrl(fileUrl, 3600);
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
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
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{d.title as string}</p>
                        <p className="text-sm text-muted-foreground">
                          Version {d.version as number} · {formatDate(d.created_at as string)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[d.status as string]}>
                          {(d.status as string).replace("_", " ")}
                        </Badge>
                        {d.file_url as string && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeliverableDownload(d)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>File Attachments ({attachments.length})</span>
                <div>
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="attachment-upload"
                  />
                  <Label htmlFor="attachment-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </span>
                    </Button>
                  </Label>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {uploads.length > 0 && (
                <div className="space-y-2 mb-4">
                  {uploads.map((u, index) => (
                    <div key={index} className="flex items-center gap-3 rounded-lg border p-3">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(u.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      {u.uploaded ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      ) : u.progress > 0 ? (
                        <span className="text-xs text-muted-foreground">{u.progress}%</span>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => removeUpload(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {attachments.length === 0 && uploads.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No attachments uploaded yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{attachment.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(attachment.size / 1024).toFixed(1)} KB · {formatDate(attachment.created_at)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => handleDownload(attachment)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <CommentThread entityType="request" entityId={requestId} />
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
                        <SelectItem value="draft">Draft</SelectItem>
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
