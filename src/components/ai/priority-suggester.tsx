"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, ArrowRight, Check } from "lucide-react";

interface PrioritySuggesterProps {
  title: string;
  description: string;
  dueDate: string;
  estimatedHours: number;
  currentPriority?: string;
}

const MOCK_SUGGESTION = {
  suggested: "high",
  confidence: 87,
  reasoning:
    "Based on the estimated 40-hour effort, tight deadline in 5 business days, and similarity to 3 previous high-priority requests, this request is recommended for High priority classification.",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

export function PrioritySuggester({
  currentPriority = "medium",
  dueDate,
  estimatedHours,
}: PrioritySuggesterProps) {
  const [accepted, setAccepted] = useState(false);
  const [activePriority, setActivePriority] = useState(currentPriority);

  const handleAccept = () => {
    setActivePriority(MOCK_SUGGESTION.suggested);
    setAccepted(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1.5 rounded-md bg-blue-500/10">
            <Brain className="h-4 w-4 text-blue-600" />
          </div>
          Priority Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Current
            </p>
            <Badge className={priorityColors[activePriority]}>
              {activePriority.charAt(0).toUpperCase() + activePriority.slice(1)}
            </Badge>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Suggested
            </p>
            <Badge className={priorityColors[MOCK_SUGGESTION.suggested]}>
              {MOCK_SUGGESTION.suggested.charAt(0).toUpperCase() +
                MOCK_SUGGESTION.suggested.slice(1)}
            </Badge>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">Confidence</p>
            <p className="text-sm font-semibold">{MOCK_SUGGESTION.confidence}%</p>
          </div>
        </div>

        <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
          {MOCK_SUGGESTION.reasoning}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Due Date</p>
            <p className="font-medium">{dueDate}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Est. Hours</p>
            <p className="font-medium">{estimatedHours}h</p>
          </div>
        </div>

        <Button
          onClick={handleAccept}
          disabled={accepted}
          variant={accepted ? "outline" : "default"}
          className="w-full"
        >
          {accepted ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Suggestion Applied
            </>
          ) : (
            "Accept Suggestion"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
