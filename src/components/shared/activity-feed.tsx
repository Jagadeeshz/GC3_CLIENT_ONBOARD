"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Activity {
  id: string;
  action: string;
  entity: string;
  entityName: string;
  user: string;
  timestamp: string;
  icon: LucideIcon;
}

interface ActivityFeedProps {
  activities: Activity[];
  className?: string;
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ActivityFeed({ activities, className }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No recent activity.
      </div>
    );
  }

  return (
    <div className={cn("space-y-0", className)}>
      {activities.map((activity, index) => {
        const Icon = activity.icon;
        const isLast = index === activities.length - 1;
        return (
          <div key={activity.id} className="group/entry relative flex gap-4 pb-6 last:pb-0 transition-all duration-200">
            {!isLast && (
              <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gradient-to-b from-border to-transparent" />
            )}
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted transition-all duration-200 group-hover/entry:bg-primary/10 group-hover/entry:shadow-sm">
              <Icon className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover/entry:text-primary" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm leading-relaxed">
                <span className="font-medium">{activity.user}</span>{" "}
                <span className="text-muted-foreground">{activity.action}</span>{" "}
                <span className="font-medium">{activity.entityName}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatRelativeTime(activity.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
