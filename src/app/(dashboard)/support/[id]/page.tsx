"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Send, Clock, CheckCircle2, AlertCircle, XCircle, Loader2 } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

interface TicketDetail {
  id: string;
  subject: string;
  description: string;
  status: string;
  category: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

interface TicketComment {
  id: string;
  content: string;
  author_name: string;
  is_staff: boolean;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning"; icon: React.ComponentType<{ className?: string }> }> = {
  open: { label: "Open", variant: "warning", icon: AlertCircle },
  in_progress: { label: "In Progress", variant: "default", icon: Clock },
  resolved: { label: "Resolved", variant: "success", icon: CheckCircle2 },
  closed: { label: "Closed", variant: "secondary", icon: XCircle },
};

export default function SupportTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTicket();
    fetchComments();
  }, [ticketId]);

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/support/${ticketId}`);
      if (response.ok) {
        const result = await response.json();
        setTicket(result.data);
      } else {
        toast.error("Ticket not found");
        router.push("/support");
      }
    } catch (err) {
      console.error("Failed to fetch ticket:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/support/${ticketId}/comments`);
      if (response.ok) {
        const result = await response.json();
        setComments(result.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    try {
      const response = await fetch(`/api/support/${ticketId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      if (response.ok) {
        setNewComment("");
        fetchComments();
      } else {
        toast.error("Failed to send comment");
      }
    } catch {
      toast.error("Failed to send comment");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!ticket) return null;

  const statusInfo = statusConfig[ticket.status] || statusConfig.open;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push("/support")} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Support
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{ticket.subject}</CardTitle>
                <Badge variant={statusInfo.variant}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {statusInfo.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="capitalize">{ticket.category.replace("_", " ")}</span>
                <span>·</span>
                <span className="capitalize">Priority: {ticket.priority}</span>
                <span>·</span>
                <span>Created {formatDateTime(ticket.created_at)}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border p-4 bg-muted/30">
            <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {comments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No responses yet. Our team will get back to you soon.
            </p>
          )}
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`rounded-xl border p-4 ${comment.is_staff ? "bg-primary/5 border-primary/20" : "bg-muted/30"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">{comment.author_name}</span>
                {comment.is_staff && (
                  <Badge variant="default" className="text-[10px]">Staff</Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(comment.created_at)}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}

          {ticket.status !== "closed" && (
            <div className="flex gap-2 pt-4 border-t">
              <Textarea
                placeholder="Type your reply..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="flex-1"
              />
              <Button
                onClick={handleSendComment}
                disabled={sending || !newComment.trim()}
                size="icon"
                className="h-auto self-end"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
