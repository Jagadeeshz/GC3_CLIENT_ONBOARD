"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatDateTime } from "@/lib/utils";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";

interface DeliverableDetailProps {
  deliverableId: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_review: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
  on_hold: "bg-orange-100 text-orange-800",
};

export function DeliverableDetail({ deliverableId }: DeliverableDetailProps) {
  const [deliverable, setDeliverable] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDeliverable = async () => {
    try {
      const response = await fetch(`/api/deliverables/${deliverableId}`);
      const result = await response.json();
      if (response.ok) {
        setDeliverable(result.data);
      }
    } catch (error) {
      console.error("Error fetching deliverable:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliverable();
  }, [deliverableId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!deliverable) {
    return (
      <div className="text-center text-muted-foreground py-12">
        Deliverable not found.
      </div>
    );
  }

  const versions = (deliverable.versions || []) as Array<Record<string, unknown>>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/deliverables">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{deliverable.title as string}</h2>
          <p className="text-sm text-muted-foreground">
            v{deliverable.version as number} &middot;{" "}
            {formatDate(deliverable.created_at as string)}
          </p>
        </div>
        <Badge className={statusColors[deliverable.status as string]}>
          {(deliverable.status as string).replace("_", " ")}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm">
                {deliverable.description
                  ? (deliverable.description as string)
                  : "No description"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Submitted At</p>
              <p className="text-sm">
                {deliverable.submitted_at
                  ? formatDateTime(deliverable.submitted_at as string)
                  : "Not submitted"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved At</p>
              <p className="text-sm">
                {deliverable.approved_at
                  ? formatDateTime(deliverable.approved_at as string)
                  : "Not approved"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">File</p>
              <p className="text-sm">
                {deliverable.file_url ? (
                  <a
                    href={deliverable.file_url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Download className="h-4 w-4" />
                    {deliverable.file_name as string || "Download"}
                  </a>
                ) : (
                  "No file attached"
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Version History ({versions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Uploaded At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    No version history.
                  </TableCell>
                </TableRow>
              ) : (
                versions.map((v) => (
                  <TableRow key={v.id as string}>
                    <TableCell>v{v.version as number}</TableCell>
                    <TableCell>
                      {v.file_url ? (
                        <a
                          href={v.file_url as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Download className="h-4 w-4" />
                          {v.file_name as string || "Download"}
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{formatDateTime(v.created_at as string)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
