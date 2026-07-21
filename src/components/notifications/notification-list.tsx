"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Bell,
  CheckCheck,
  MessageSquare,
  Inbox,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import type { Notification, NotificationType } from "@/types";

const typeIcons: Record<NotificationType, React.ReactNode> = {
  info: <Info className="h-4 w-4 text-blue-500" />,
  success: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  error: <XCircle className="h-4 w-4 text-red-500" />,
};

const typeBadgeVariants: Record<NotificationType, string> = {
  info: "bg-blue-100 text-blue-700 border-blue-200",
  success: "bg-green-100 text-green-700 border-green-200",
  warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  error: "bg-red-100 text-red-700 border-red-200",
};

const typeBg: Record<NotificationType, string> = {
  info: "bg-blue-50 border-blue-200",
  success: "bg-green-50 border-green-200",
  warning: "bg-yellow-50 border-yellow-200",
  error: "bg-red-50 border-red-200",
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
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatDateTime(dateString);
}

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [markingRead, setMarkingRead] = useState(false);
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/notifications?page=${page}&limit=20`
      );
      const result = await response.json();
      if (response.ok) {
        setNotifications(result.data);
        setTotalPages(result.totalPages);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case "unread":
        return notifications.filter((n) => !n.read);
      case "mentions":
        return notifications.filter(
          (n) =>
            n.title.toLowerCase().includes("mention") ||
            n.message.toLowerCase().includes("mention") ||
            n.message.toLowerCase().includes("mentioned")
        );
      default:
        return notifications;
    }
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
      });
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    setMarkingRead(true);
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
      });
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        toast.success("All notifications marked as read");
      } else {
        throw new Error("Failed to mark all as read");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to mark as read"
      );
    } finally {
      setMarkingRead(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={setFilter} className="w-auto">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <Inbox className="h-3.5 w-3.5" />
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="gap-2">
              <Bell className="h-3.5 w-3.5" />
              Unread
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="mentions" className="gap-2">
              <MessageSquare className="h-3.5 w-3.5" />
              Mentions
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={markingRead}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === "unread"
                ? "You're all caught up!"
                : filter === "mentions"
                ? "No mention notifications yet"
                : "Notifications will appear here"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                !notification.read
                  ? typeBg[notification.type]
                  : "opacity-70"
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <div className="mt-0.5 shrink-0">
                  {typeIcons[notification.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={`text-sm ${
                        !notification.read ? "font-semibold" : "font-medium"
                      }`}
                    >
                      {notification.title}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${typeBadgeVariants[notification.type]}`}
                    >
                      {notification.type}
                    </Badge>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {timeAgo(notification.created_at)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
