"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { formatDateTime, getInitials } from "@/lib/utils";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  created_at: string;
}

interface CommentThreadProps {
  entityType: string;
  entityId: string;
}

export function CommentThread({ entityType, entityId }: CommentThreadProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [entityType, entityId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/notifications?limit=100`);
      if (response.ok) {
        setComments([]);
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id,
          title: `Comment on ${entityType}`,
          message: newComment,
          type: "info",
        }),
      });

      if (response.ok) {
        setNewComment("");
        toast.success("Comment added");
      }
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading comments...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet. Start the conversation below.
          </p>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={comment.author.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {getInitials(comment.author.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{comment.author.full_name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(comment.created_at)}
                </span>
              </div>
              <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
            </div>
          </div>
        ))}

        <div className="flex gap-2 pt-2 border-t">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={2}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
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
      </CardContent>
    </Card>
  );
}
