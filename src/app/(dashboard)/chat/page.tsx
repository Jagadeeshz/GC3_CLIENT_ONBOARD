"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatWindow } from "@/components/chat/chat-window";
import { ChatInput } from "@/components/chat/chat-input";
import { ConversationHeader } from "@/components/chat/conversation-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Search, X } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface ConversationMember {
  profile: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

interface ConversationDetail {
  id: string;
  title: string | null;
  is_group: boolean;
  members: ConversationMember[];
}

interface ProfileSearchResult {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

export default function ChatPage() {
  const [userId, setUserId] = useState<string>("");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversationDetail, setConversationDetail] = useState<ConversationDetail | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMemberIds, setNewMemberIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<ProfileSearchResult[]>([]);
  const [userSearching, setUserSearching] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseClient();
    supabase.auth.getUser().then(({ data }: { data: { user: { id: string } | null } }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  useEffect(() => {
    if (!activeConversationId) {
      setConversationDetail(null);
      return;
    }
    fetchConversationDetail();
  }, [activeConversationId]);

  const fetchConversationDetail = async () => {
    try {
      const response = await fetch(`/api/conversations/${activeConversationId}`);
      const result = await response.json();
      if (response.ok) {
        setConversationDetail(result.data);
      }
    } catch (error) {
      console.error("Error fetching conversation detail:", error);
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setShowMobileChat(true);
  };

  useEffect(() => {
    if (!userSearchQuery || userSearchQuery.length < 2) {
      setUserSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setUserSearching(true);
      try {
        const supabase = createSupabaseClient();
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .or(`full_name.ilike.%${userSearchQuery}%,email.ilike.%${userSearchQuery}%`)
          .neq("id", userId)
          .limit(10);
        if (data) setUserSearchResults(data);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setUserSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearchQuery, userId]);

  const handleAddMember = (profile: ProfileSearchResult) => {
    if (!newMemberIds.includes(profile.id)) {
      setNewMemberIds((prev) => [...prev, profile.id]);
    }
    setUserSearchQuery("");
    setUserSearchResults([]);
  };

  const handleRemoveMember = (id: string) => {
    setNewMemberIds((prev) => prev.filter((m) => m !== id));
  };

  const handleNewConversation = async () => {
    if (newMemberIds.length === 0) return;
    setCreating(true);
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle || null,
          member_ids: newMemberIds,
          is_group: newMemberIds.length > 1,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        setActiveConversationId(result.data.id);
        setShowMobileChat(true);
        setNewDialogOpen(false);
        setNewTitle("");
        setNewMemberIds([]);
        setUserSearchQuery("");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleSendMessage = async (content: string, file?: { url: string; name: string }) => {
    if (!activeConversationId) return;
    try {
      await fetch(`/api/conversations/${activeConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          file_url: file?.url,
          file_name: file?.name,
        }),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getConversationTitle = () => {
    if (!conversationDetail) return "";
    if (conversationDetail.title) return conversationDetail.title;
    return conversationDetail.members
      .filter((m) => m.profile.id !== userId)
      .map((m) => m.profile.full_name)
      .join(", ") || "Conversation";
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chat</h1>
          <p className="text-muted-foreground">Real-time messaging</p>
        </div>
        <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <MessageSquare className="mr-2 h-4 w-4" />
              New Conversation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Conversation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title (optional)</label>
                <Input
                  placeholder="Conversation title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Find users</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                {userSearchResults.length > 0 && (
                  <ScrollArea className="max-h-40 border rounded-md">
                    {userSearchResults.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => handleAddMember(profile)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-muted transition-colors text-left"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(profile.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{profile.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                        </div>
                      </button>
                    ))}
                  </ScrollArea>
                )}
                {userSearchQuery.length >= 2 && userSearchResults.length === 0 && !userSearching && (
                  <p className="text-xs text-muted-foreground">No users found</p>
                )}
                {newMemberIds.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newMemberIds.map((id) => (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded-full"
                      >
                        {id.slice(0, 8)}...
                        <button onClick={() => handleRemoveMember(id)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Button
                onClick={handleNewConversation}
                disabled={creating || newMemberIds.length === 0}
                className="w-full"
              >
                {creating ? "Creating..." : "Create Conversation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 min-h-0 border rounded-lg overflow-hidden bg-background">
        <div className="flex h-full">
          <div
            className={`w-full md:w-80 md:border-r shrink-0 ${
              showMobileChat ? "hidden md:block" : "block"
            }`}
          >
            <ChatSidebar
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              onNewConversation={() => setNewDialogOpen(true)}
              currentUserId={userId}
            />
          </div>

          <div
            className={`flex-1 flex flex-col min-w-0 ${
              showMobileChat ? "block" : "hidden md:flex"
            }`}
          >
            {activeConversationId && conversationDetail ? (
              <>
                <ConversationHeader
                  title={getConversationTitle()}
                  members={conversationDetail.members}
                  onBack={() => setShowMobileChat(false)}
                  showBackButton
                />
                <ChatWindow
                  conversationId={activeConversationId}
                  currentUserId={userId}
                />
                <ChatInput onSendMessage={handleSendMessage} />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
