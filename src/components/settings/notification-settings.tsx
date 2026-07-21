"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Mail, MessageSquare, FileText } from "lucide-react";
import { toast } from "sonner";

interface NotificationPref {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export function NotificationSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPref[]>([
    {
      key: "email_notifications",
      label: "Email Notifications",
      description: "Receive email notifications for important updates",
      icon: <Mail className="h-4 w-4" />,
      enabled: true,
    },
    {
      key: "request_updates",
      label: "Request Updates",
      description: "Get notified when your requests are updated",
      icon: <FileText className="h-4 w-4" />,
      enabled: true,
    },
    {
      key: "message_notifications",
      label: "Message Notifications",
      description: "Get notified for new chat messages",
      icon: <MessageSquare className="h-4 w-4" />,
      enabled: true,
    },
    {
      key: "deliverable_notifications",
      label: "Deliverable Notifications",
      description:
        "Get notified when deliverables are submitted or approved",
      icon: <Bell className="h-4 w-4" />,
      enabled: true,
    },
    {
      key: "invoice_notifications",
      label: "Invoice Notifications",
      description: "Get notified about new invoices and payment updates",
      icon: <Bell className="h-4 w-4" />,
      enabled: true,
    },
  ]);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const response = await fetch("/api/settings?category=notifications");
        const result = await response.json();
        if (response.ok) {
          const map: Record<string, boolean> = {};
          for (const s of result.data) {
            map[s.key] = s.value as boolean;
          }
          setPrefs((prev) =>
            prev.map((p) => ({
              ...p,
              enabled: map[p.key] ?? p.enabled,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching notification settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const togglePref = async (key: string) => {
    setSaving(true);
    const pref = prefs.find((p) => p.key === key);
    if (!pref) return;

    const newValue = !pref.enabled;
    setPrefs((prev) =>
      prev.map((p) => (p.key === key ? { ...p, enabled: newValue } : p))
    );

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          value: newValue,
          category: "notifications",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save preference");
      }

      toast.success(`${pref.label} ${newValue ? "enabled" : "disabled"}`);
    } catch {
      setPrefs((prev) =>
        prev.map((p) => (p.key === key ? { ...p, enabled: !newValue } : p))
      );
      toast.error("Failed to update notification preference");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose which notifications you want to receive.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {prefs.map((pref) => (
          <div
            key={pref.key}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center gap-3">
              <div className="text-muted-foreground">{pref.icon}</div>
              <div>
                <Label className="text-sm font-medium">{pref.label}</Label>
                <p className="text-xs text-muted-foreground">
                  {pref.description}
                </p>
              </div>
            </div>
            <Switch
              checked={pref.enabled}
              onCheckedChange={() => togglePref(pref.key)}
              disabled={saving}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
