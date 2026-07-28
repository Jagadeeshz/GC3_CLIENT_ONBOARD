"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Inbox,
  Loader2,
} from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Notification, NotificationType } from "@/types";

const typeIcons: Record<NotificationType, React.ReactNode> = {
  info: <Info className="h-3.5 w-3.5 text-blue-500" />,
  success: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
  warning: <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />,
  error: <XCircle className="h-3.5 w-3.5 text-red-500" />,
};

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch("/api/notifications?limit=1&unread=true");
      const result = await response.json();
      if (response.ok) {
        setUnreadCount(result.total || 0);
      }
    } catch {
      // silently fail
    }
  }, [user]);

  const fetchRecentNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch("/api/notifications?limit=8");
      const result = await response.json();
      if (response.ok) {
        setNotifications(result.data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    fetchUnreadCount();

    const supabase = createSupabaseClient();
    const channel = supabase
      .channel("notification-bell")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: { new: Notification }) => {
          setUnreadCount((prev) => prev + 1);
          const newNotif = payload.new;
          setNotifications((prev) => [newNotif, ...prev].slice(0, 8));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: { new: Notification }) => {
          const updated = payload.new;
          if (updated.read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchUnreadCount]);

  useEffect(() => {
    if (open) {
      fetchRecentNotifications();
    }
  }, [open, fetchRecentNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // silently fail
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
      });
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch {
      // silently fail
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 transition-all duration-200 hover:bg-muted/60"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-0.5 -top-0.5 h-4.5 w-4.5 rounded-full p-0 text-[10px] flex items-center justify-center min-w-[18px] shadow-sm shadow-destructive/20 animate-glow pointer-events-none"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 p-0 glass-card"
        align="end"
        forceMount
      >
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="p-0 text-base font-semibold">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={(e) => {
                e.stopPropagation();
                markAllAsRead();
              }}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <ScrollArea className="h-[360px]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                You&apos;re all caught up!
              </p>
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                    !notification.read ? "bg-primary/[0.03]" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="mt-0.5 shrink-0">
                    {typeIcons[notification.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p
                        className={`text-sm truncate ${
                          !notification.read ? "font-semibold" : "font-medium"
                        }`}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {timeAgo(notification.created_at)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        <Separator className="m-0" />
        <div className="p-2">
          <Link
            href="/notifications"
            className="flex items-center justify-center w-full h-8 text-xs font-medium text-primary hover:underline rounded-md transition-colors"
            onClick={() => setOpen(false)}
          >
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
