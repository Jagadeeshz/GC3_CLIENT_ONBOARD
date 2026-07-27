"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupportTicketForm } from "@/components/support/support-ticket-form";
import { SupportTicketList } from "@/components/support/support-ticket-list";
import { FaqList } from "@/components/faq/faq-list";
import { Headphones, Bot, Mail, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SupportPage() {
  const [tab, setTab] = useState("tickets");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Headphones className="h-8 w-8 text-primary" />
          Support
        </h1>
        <p className="text-muted-foreground">Get help with your account, projects, or technical issues.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="new">New Ticket</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="ai">AI Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="mt-6">
          <SupportTicketList onCreateNew={() => setTab("new")} />
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <SupportTicketForm onSuccess={() => setTab("tickets")} />
        </TabsContent>

        <TabsContent value="faq" className="mt-6">
          <FaqList />
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>
                Our AI-powered support assistant is coming soon.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Badge variant="secondary" className="text-sm">Coming Soon</Badge>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                We&apos;re building an intelligent assistant that will help you find answers instantly,
                troubleshoot issues, and guide you through common tasks. Stay tuned!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 max-w-lg mx-auto">
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl border">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium">Smart Chat</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl border">
                  <Headphones className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium">24/7 Help</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl border">
                  <Mail className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium">Instant Answers</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
