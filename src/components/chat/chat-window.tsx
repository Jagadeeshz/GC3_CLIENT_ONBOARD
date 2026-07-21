"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Paperclip, Download, CheckCheck, Check } from "lucide-react";
import { cn, getInitials, timeAgo } from "@/lib/utils";
import { createSupabaseClient } from "@/lib/supabase/client";
import type { Message } from "@/types";

interface MessageWithSender extends Message {
  sender: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
}

export function ChatWindow({ conversationId, currentUserId }: ChatWindowProps) {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages?limit=100`);
      const result = await response.json();
      if (response.ok) {
        setMessages(result.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    const supabase = createSupabaseClient();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_id === currentUserId) return;

          const { data: sender } = await supabase
            .from("profiles")
            .select("id, full_name, email, avatar_url")
            .eq("id", newMsg.sender_id)
            .single();

          if (sender) {
            setMessages((prev) => [
              ...prev,
              { ...newMsg, sender } as MessageWithSender,
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-3 w-full max-w-md p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "justify-start" : "justify-end")}>
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-12 w-48 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 px-4" ref={scrollRef}>
      <div className="py-4 space-y-4">
        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id}
              className={cn("flex gap-3", isOwn ? "justify-end" : "justify-start")}
            >
              {!isOwn && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={msg.sender?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(msg.sender?.full_name || "?")}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={cn("max-w-[70%]", isOwn && "order-first")}>
                {!isOwn && (
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {msg.sender?.full_name}
                  </p>
                )}
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm",
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                  {msg.file_url && (
                    <div className="mt-1 flex items-center gap-2">
                      <a
                        href={msg.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "flex items-center gap-1 text-xs underline",
                          isOwn ? "text-primary-foreground/80" : "text-muted-foreground"
                        )}
                      >
                        {msg.file_name ? (
                          <>
                            <Paperclip className="h-3 w-3" />
                            {msg.file_name}
                            <Download className="h-3 w-3" />
                          </>
                        ) : (
                          <>
                            <Download className="h-3 w-3" />
                            Attachment
                          </>
                        )}
                      </a>
                    </div>
                  )}
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1.5 mt-1",
                    isOwn ? "justify-end" : "justify-start"
                  )}
                >
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(msg.created_at)}
                  </span>
                  {isOwn && (
                    msg.read_at ? (
                      <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                    ) : (
                      <Check className="h-3.5 w-3.5 text-muted-foreground" />
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
