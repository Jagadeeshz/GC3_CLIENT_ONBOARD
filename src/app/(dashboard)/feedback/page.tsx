"use client";

import { useState } from "react";
import { SubmitFeedbackForm } from "@/components/feedback/submit-feedback-form";
import { FeedbackList } from "@/components/feedback/feedback-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle } from "lucide-react";

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
        <p className="text-muted-foreground">View and manage feedback</p>
      </div>
      <Tabs defaultValue="submit">
        <TabsList>
          <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
          <TabsTrigger value="list">All Feedback</TabsTrigger>
        </TabsList>
        <TabsContent value="submit" className="mt-6 max-w-xl">
          <SubmitFeedbackForm
            onSuccess={() => {
              setSubmitted(true);
              setTimeout(() => setSubmitted(false), 4000);
            }}
          />
          {submitted && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Feedback submitted successfully!</p>
                <p className="text-xs opacity-80">Thank you for your input. It helps us improve.</p>
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="list" className="mt-6">
          <FeedbackList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
