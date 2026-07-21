"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { Settings, User, Bell, Palette } from "lucide-react";
import { toast } from "sonner";

export function SettingsForm() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
        <TabsTrigger value="profile" className="gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Profile</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-2">
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">Notifications</span>
        </TabsTrigger>
        {isAdmin() && (
          <>
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Features</span>
            </TabsTrigger>
          </>
        )}
      </TabsList>

      <TabsContent value="profile">
        <ProfileSettings />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationSettings />
      </TabsContent>

      {isAdmin() && (
        <>
          <TabsContent value="general">
            <GeneralSettings />
          </TabsContent>
          <TabsContent value="features">
            <FeatureSettings />
          </TabsContent>
        </>
      )}
    </Tabs>
  );
}

function GeneralSettings() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const result = await response.json();
      if (response.ok) {
        const map: Record<string, unknown> = {};
        for (const s of result.data) {
          map[s.key] = s.value;
        }
        setSettings(map);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleFieldChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fieldsToSave = [
        "company_name",
        "timezone",
        "date_format",
        "default_currency",
      ];

      const results = await Promise.allSettled(
        fieldsToSave.map((key) =>
          fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              key,
              value: settings[key] || "",
              category: "general",
            }),
          })
        )
      );

      const failures = results.filter((r) => r.status === "rejected");
      if (failures.length > 0) {
        throw new Error("Some settings failed to save");
      }

      const failedResponses = (
        await Promise.all(
          results
            .filter(
              (r): r is PromiseFulfilledResult<Response> =>
                r.status === "fulfilled"
            )
            .map((r) => r.value)
        )
      ).filter((r) => !r.ok);

      if (failedResponses.length > 0) {
        throw new Error("Some settings failed to save");
      }

      toast.success("Settings saved successfully!");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save settings"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>Configure platform-wide settings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Name</label>
            <input
              type="text"
              value={(settings.company_name as string) || ""}
              onChange={(e) => handleFieldChange("company_name", e.target.value)}
              placeholder="Your Company"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Timezone</label>
            <select
              value={(settings.timezone as string) || "UTC"}
              onChange={(e) => handleFieldChange("timezone", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={saving}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Format</label>
            <select
              value={(settings.date_format as string) || "MM/DD/YYYY"}
              onChange={(e) => handleFieldChange("date_format", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={saving}
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Currency</label>
            <select
              value={(settings.default_currency as string) || "USD"}
              onChange={(e) =>
                handleFieldChange("default_currency", e.target.value)
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={saving}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:pointer-events-none disabled:opacity-50"
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureSettings() {
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<Record<string, boolean>>({
    chat_enabled: true,
    feedback_enabled: true,
    change_requests_enabled: true,
    document_upload_enabled: true,
  });

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch("/api/settings?category=features");
        const result = await response.json();
        if (response.ok) {
          const map: Record<string, boolean> = {};
          for (const s of result.data) {
            map[s.key] = s.value as boolean;
          }
          setFeatures((prev) => ({ ...prev, ...map }));
        }
      } catch (error) {
        console.error("Error fetching features:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatures();
  }, []);

  const toggleFeature = async (key: string) => {
    const newValue = !features[key];
    setFeatures((prev) => ({ ...prev, [key]: newValue }));
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: newValue, category: "features" }),
      });
      if (!response.ok) {
        throw new Error("Failed to toggle feature");
      }
    } catch (error) {
      setFeatures((prev) => ({ ...prev, [key]: !newValue }));
      console.error("Error toggling feature:", error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Toggles</CardTitle>
        <CardDescription>Enable or disable platform features.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(features).map(([key, enabled]) => (
          <div key={key} className="flex items-center justify-between py-2">
            <span className="text-sm font-medium capitalize">
              {key.replace(/_/g, " ").replace(/enabled/, "").trim()}
            </span>
            <button
              type="button"
              onClick={() => toggleFeature(key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enabled ? "bg-primary" : "bg-input"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background shadow-lg transition-transform ${
                  enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
