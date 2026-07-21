"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface ConversationMember {
  profile: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

interface ConversationHeaderProps {
  title: string;
  members: ConversationMember[];
  onBack?: () => void;
  showBackButton?: boolean;
}

export function ConversationHeader({
  title,
  members,
  onBack,
  showBackButton,
}: ConversationHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b px-4 py-3">
      {showBackButton && (
        <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="flex -space-x-2">
          {members.slice(0, 3).map((m) => (
            <Avatar key={m.profile.id} className="h-8 w-8 border-2 border-background">
              <AvatarImage src={m.profile.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {getInitials(m.profile.full_name)}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold truncate">{title}</h3>
          <p className="text-xs text-muted-foreground">
            {members.length} {members.length === 1 ? "member" : "members"}
          </p>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Users className="h-4 w-4" />
      </Button>
    </div>
  );
}
