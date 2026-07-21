"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Download,
  GitCompare,
  FileText,
  User,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export interface DeliverableVersion {
  version: number;
  submittedAt: string;
  submittedBy: string;
  fileName: string;
  fileSize: string;
  status: "submitted" | "approved" | "revision_requested";
  notes: string;
}

interface VersionHistoryProps {
  deliverableTitle: string;
  currentVersion: number;
  versions: DeliverableVersion[];
}

const statusVariant: Record<
  DeliverableVersion["status"],
  "default" | "success" | "warning"
> = {
  submitted: "default",
  approved: "success",
  revision_requested: "warning",
};

const statusLabel: Record<DeliverableVersion["status"], string> = {
  submitted: "Submitted",
  approved: "Approved",
  revision_requested: "Revision Requested",
};

export function VersionHistory({
  deliverableTitle,
  currentVersion,
  versions,
}: VersionHistoryProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {deliverableTitle}
          </h2>
          <p className="text-muted-foreground">
            Current version: <span className="font-medium text-foreground">v{currentVersion}</span> ·{" "}
            {versions.length} total version{versions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => toast.info("Compare versions feature coming soon")}
        >
          <GitCompare className="mr-2 h-4 w-4" />
          Compare Versions
        </Button>
      </div>

      <div className="relative ml-4">
        <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-6">
          {versions.map((v, i) => (
            <div key={v.version} className="relative pl-8">
              <div
                className={`absolute left-0 top-4 h-4 w-4 -translate-x-1/2 rounded-full border-2 ${
                  v.status === "approved"
                    ? "bg-green-500 border-green-500"
                    : v.status === "revision_requested"
                      ? "bg-yellow-500 border-yellow-500"
                      : "bg-primary border-primary"
                } ring-4 ring-background`}
              />

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="font-mono text-sm px-2 py-0.5 rounded bg-muted">
                        v{v.version}
                      </span>
                      {i === 0 && (
                        <Badge variant="success" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </CardTitle>
                    <Badge variant={statusVariant[v.status]}>
                      {statusLabel[v.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(v.submittedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{v.submittedBy}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>
                        {v.fileName} ({v.fileSize})
                      </span>
                    </div>
                  </div>

                  {v.notes && (
                    <p className="text-sm text-muted-foreground border-l-2 border-border pl-3">
                      {v.notes}
                    </p>
                  )}

                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm">
                      <Download className="mr-1 h-3 w-3" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
