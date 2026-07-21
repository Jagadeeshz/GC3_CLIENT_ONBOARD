"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tags, Check, X } from "lucide-react";

interface CategorySuggestion {
  id: string;
  label: string;
  confidence: number;
}

interface TaskCategorizerProps {
  title: string;
  description: string;
}

const MOCK_SUGGESTIONS: CategorySuggestion[] = [
  { id: "cat-1", label: "Design", confidence: 94 },
  { id: "cat-2", label: "Marketing", confidence: 82 },
  { id: "cat-3", label: "Development", confidence: 71 },
  { id: "cat-4", label: "Strategy", confidence: 65 },
];

export function TaskCategorizer({ title, description }: TaskCategorizerProps) {
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [rejected, setRejected] = useState<Record<string, boolean>>({});

  const toggleAccept = (id: string) => {
    setAccepted((prev) => ({ ...prev, [id]: !prev[id] }));
    if (rejected[id]) setRejected((prev) => ({ ...prev, [id]: false }));
  };

  const toggleReject = (id: string) => {
    setRejected((prev) => ({ ...prev, [id]: !prev[id] }));
    if (accepted[id]) setAccepted((prev) => ({ ...prev, [id]: false }));
  };

  const activeCount = Object.values(accepted).filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-md bg-emerald-500/10">
              <Tags className="h-4 w-4 text-emerald-600" />
            </div>
            Suggested Categories
          </CardTitle>
          <Badge variant="secondary">{activeCount} selected</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground hidden">
          Categorizing: {title} - {description}
        </p>
        {MOCK_SUGGESTIONS.map((suggestion) => {
          const isAccepted = accepted[suggestion.id];
          const isRejected = rejected[suggestion.id];

          return (
            <div
              key={suggestion.id}
              className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                isAccepted
                  ? "bg-green-50 border-green-200"
                  : isRejected
                    ? "bg-red-50 border-red-200 opacity-50"
                    : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{suggestion.label}</span>
                <span className="text-xs text-muted-foreground">
                  {suggestion.confidence}%
                </span>
                <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${suggestion.confidence}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant={isAccepted ? "default" : "ghost"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => toggleAccept(suggestion.id)}
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  variant={isRejected ? "destructive" : "ghost"}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => toggleReject(suggestion.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
