"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, ShieldCheck } from "lucide-react";

interface RequestSummaryProps {
  requestId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
}

const MOCK_SUMMARIES: Record<string, string> = {
  default:
    "This request involves a comprehensive website redesign project for Acme Corp. The scope includes updating the visual identity, improving UX flows for key conversion pages, and ensuring mobile responsiveness across all breakpoints. Key milestones include wireframe approval, design system creation, and final asset delivery. The project has moderate complexity with three stakeholder review points identified.",
};

export function RequestSummary({
  title,
  status,
  priority,
}: RequestSummaryProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(MOCK_SUMMARIES.default);
  const [confidence] = useState(92);

  const handleRegenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setSummary(
        `Analysis of "${title}" reveals a ${priority.toLowerCase()} priority request currently in ${status.replace("_", " ")} status. The AI model has identified 3 key deliverables and 2 potential risk areas based on historical patterns. Recommend prioritizing stakeholder alignment before proceeding with execution. Estimated completion window: 2-3 weeks based on current team capacity.`
      );
      setLoading(false);
    }, 1500);
  };

  return (
    <Card className="relative overflow-hidden border-primary/20">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            AI Summary
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <ShieldCheck className="h-3 w-3" />
            {confidence}% confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded w-full" />
            <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
            <div className="h-4 bg-muted animate-pulse rounded w-4/6" />
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {summary}
          </p>
        )}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRegenerate}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-3 w-3 ${loading ? "animate-spin" : ""}`}
            />
            Regenerate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
