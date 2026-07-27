"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MeetingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-8 w-8 text-primary" />
            Meetings
          </h1>
          <p className="text-muted-foreground">Schedule and manage your meetings</p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Meeting
        </Button>
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Video className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Meeting Scheduling</CardTitle>
          <CardDescription>
            Calendar integration is coming soon. You&apos;ll be able to schedule, join, and manage meetings directly from the portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Badge variant="secondary" className="text-sm">Coming Soon</Badge>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            We&apos;re building seamless calendar integration with Google Calendar, Outlook, and Zoom.
            Stay tuned for updates!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 max-w-lg mx-auto">
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl border">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Calendar Sync</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl border">
              <Video className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Video Calls</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl border">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Team Invite</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No upcoming meetings</p>
            <p className="text-xs text-muted-foreground mt-1">
              Meeting scheduling will be available soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
