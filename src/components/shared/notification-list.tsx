"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";
import type { NotificationType } from "@/types";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: string;
  link?: string | null;
}

interface NotificationListProps {
  notifications: Notification[];
  className?: string;
}

const TYPE_CONFIG: Record<
  NotificationType,
  { border: string; icon: typeof CheckCircle; iconColor: string; badgeVariant: "success" | "warning" | "default" | "destructive" }
> = {
  success: {
    border: "border-l-green-500",
    icon: CheckCircle,
    iconColor: "text-green-500",
    badgeVariant: "success",
  },
  warning: {
    border: "border-l-yellow-500",
    icon: AlertTriangle,
    iconColor: "text-yellow-500",
    badgeVariant: "warning",
  },
  info: {
    border: "border-l-blue-500",
    icon: Info,
    iconColor: "text-blue-500",
    badgeVariant: "default",
  },
  error: {
    border: "border-l-red-500",
    icon: AlertCircle,
    iconColor: "text-red-500",
    badgeVariant: "destructive",
  },
};

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

export function NotificationList({ notifications, className }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No notifications.
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {notifications.map((notification) => {
        const config = TYPE_CONFIG[notification.type];
        const Icon = config.icon;
        const content = (
          <div
            className={cn(
              "flex items-start gap-3 rounded-lg border-l-4 bg-card p-4 transition-colors hover:bg-accent/50",
              config.border,
              !notification.read && "bg-accent/20"
            )}
          >
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", config.iconColor)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={cn("text-sm font-medium", !notification.read && "font-semibold")}>
                  {notification.title}
                </p>
                {!notification.read && (
                  <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                )}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                {notification.message}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatRelativeTime(notification.timestamp)}
              </p>
            </div>
          </div>
        );

        if (notification.link) {
          return (
            <Link key={notification.id} href={notification.link}>
              {content}
            </Link>
          );
        }

        return <div key={notification.id}>{content}</div>;
      })}
    </div>
  );
}
