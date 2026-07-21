"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Plus, Search, MessageSquare } from "lucide-react";
import { cn, getInitials, truncate } from "@/lib/utils";
import type { Conversation } from "@/types";

interface ConversationMember {
  profile: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

interface ConversationWithDetails extends Conversation {
  members: ConversationMember[];
  last_message: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    file_url: string | null;
    file_name: string | null;
  } | null;
  unread_count: number;
}

interface ChatSidebarProps {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  currentUserId: string;
}

export function ChatSidebar({
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  currentUserId,
}: ChatSidebarProps) {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations?limit=50");
      const result = await response.json();
      if (response.ok) {
        setConversations(result.data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 15000);
    return () => clearInterval(interval);
  }, []);

  const getOtherMembers = (conv: ConversationWithDetails) => {
    return conv.members.filter((m) => m.profile.id !== currentUserId);
  };

  const getConversationTitle = (conv: ConversationWithDetails) => {
    if (conv.title) return conv.title;
    const others = getOtherMembers(conv);
    return others.map((m) => m.profile.full_name).join(", ") || "Empty conversation";
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const title = getConversationTitle(conv).toLowerCase();
    return title.includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-3 border-b">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="p-2 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Conversations</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onNewConversation}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No conversations yet</p>
            <Button
              variant="link"
              size="sm"
              onClick={onNewConversation}
              className="mt-1 text-xs"
            >
              Start a new conversation
            </Button>
          </div>
        ) : (
          <div className="p-1">
            {filteredConversations.map((conv) => {
              const others = getOtherMembers(conv);
              const isActive = conv.id === activeConversationId;
              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors hover:bg-muted",
                    isActive && "bg-muted"
                  )}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={others[0]?.profile.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(getConversationTitle(conv))}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">
                        {getConversationTitle(conv)}
                      </p>
                      {conv.last_message && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(conv.last_message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                    {conv.last_message && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {conv.last_message.file_name
                          ? `📎 ${conv.last_message.file_name}`
                          : truncate(conv.last_message.content, 50)}
                      </p>
                    )}
                  </div>
                  {conv.unread_count > 0 && (
                    <Badge className="h-5 min-w-5 flex items-center justify-center rounded-full px-1 text-xs">
                      {conv.unread_count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
