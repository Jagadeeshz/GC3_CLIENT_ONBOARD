"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, AlertTriangle, TrendingUp } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  currentLoad: number;
  predictedCapacity: number;
  activeTasks: number;
}

const TEAM: TeamMember[] = [
  { name: "Sarah Johnson", role: "Designer", currentLoad: 85, predictedCapacity: 90, activeTasks: 7 },
  { name: "Mike Chen", role: "Developer", currentLoad: 70, predictedCapacity: 75, activeTasks: 5 },
  { name: "Emily Davis", role: "PM", currentLoad: 92, predictedCapacity: 95, activeTasks: 9 },
  { name: "Alex Rivera", role: "Developer", currentLoad: 45, predictedCapacity: 60, activeTasks: 3 },
  { name: "Lisa Wong", role: "Designer", currentLoad: 60, predictedCapacity: 55, activeTasks: 4 },
];

function getRiskLevel(member: TeamMember): "at-risk" | "elevated" | "healthy" {
  if (member.predictedCapacity >= 90) return "at-risk";
  if (member.predictedCapacity >= 75) return "elevated";
  return "healthy";
}

const riskColors = {
  "at-risk": "bg-red-500",
  elevated: "bg-yellow-500",
  healthy: "bg-green-500",
};

const riskBadgeVariant = {
  "at-risk": "destructive" as const,
  elevated: "warning" as const,
  healthy: "success" as const,
};

const riskLabel = {
  "at-risk": "At Risk",
  elevated: "Elevated",
  healthy: "Healthy",
};

export function WorkloadPredictor() {
  const atRiskCount = TEAM.filter(
    (m) => getRiskLevel(m) === "at-risk"
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-md bg-purple-500/10">
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </div>
            Workload Forecast
          </CardTitle>
          {atRiskCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {atRiskCount} at risk
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Next 2 weeks capacity prediction
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {TEAM.map((member) => {
          const risk = getRiskLevel(member);
          return (
            <div key={member.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${riskColors[risk]}`} />
                  <span className="text-sm font-medium">{member.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {member.role}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {member.activeTasks} tasks
                  </span>
                  <Badge variant={riskBadgeVariant[risk]} className="text-xs">
                    {riskLabel[risk]}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Progress
                  value={member.predictedCapacity}
                  className={`h-2 flex-1 ${
                    risk === "at-risk"
                      ? "[&>div]:bg-red-500"
                      : risk === "elevated"
                        ? "[&>div]:bg-yellow-500"
                        : "[&>div]:bg-green-500"
                  }`}
                />
                <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                  {member.predictedCapacity}%
                </span>
              </div>
            </div>
          );
        })}

        <div className="flex items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          Capacity predictions based on current velocity and upcoming deadlines
        </div>
      </CardContent>
    </Card>
  );
}
