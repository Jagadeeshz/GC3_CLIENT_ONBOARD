"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Download, Folder } from "lucide-react";
import { formatDate, truncate } from "@/lib/utils";
import type { Document, DocumentCategory } from "@/types";

const categoryColors: Record<string, string> = {
  contract: "bg-blue-100 text-blue-800",
  proposal: "bg-purple-100 text-purple-800",
  report: "bg-green-100 text-green-800",
  design: "bg-pink-100 text-pink-800",
  development: "bg-orange-100 text-orange-800",
  other: "bg-gray-100 text-gray-800",
};

interface FolderNode {
  name: string;
  path: string;
  count: number;
}

export function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentFolder, setCurrentFolder] = useState("");

  const fetchDocuments = async () => {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" });
      if (categoryFilter && categoryFilter !== "all") params.set("category", categoryFilter);
      if (currentFolder) params.set("folder", currentFolder);

      const response = await fetch(`/api/documents?${params}`);
      const result = await response.json();

      if (response.ok) {
        setDocuments(result.data);
        setTotalPages(result.totalPages);

        const folderMap = new Map<string, number>();
        for (const doc of result.data as Document[]) {
          const f = doc.folder || "/";
          folderMap.set(f, (folderMap.get(f) || 0) + 1);
        }
        setFolders(
          Array.from(folderMap.entries()).map(([path, count]) => ({
            name: path === "/" ? "Root" : path.split("/").pop() || path,
            path,
            count,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [page, categoryFilter, currentFolder]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-20 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="proposal">Proposal</SelectItem>
            <SelectItem value="report">Report</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="development">Development</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        {folders.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {currentFolder && (
              <Button variant="ghost" size="sm" onClick={() => { setCurrentFolder(""); setPage(1); }}>
                &larr; All Folders
              </Button>
            )}
            {folders.map((f) => (
              <Button
                key={f.path}
                variant={currentFolder === f.path ? "default" : "outline"}
                size="sm"
                onClick={() => { setCurrentFolder(f.path); setPage(1); }}
              >
                <Folder className="mr-1 h-4 w-4" />
                {f.name} ({f.count})
              </Button>
            ))}
          </div>
        )}
      </div>

      {currentFolder && (
        <p className="text-sm text-muted-foreground">
          Folder: <span className="font-medium">{currentFolder}</span>
        </p>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Folder</TableHead>
              <TableHead className="hidden md:table-cell">Uploader</TableHead>
              <TableHead className="hidden lg:table-cell">Created</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No documents found.
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <span className="font-medium">{doc.title}</span>
                    {doc.description && (
                      <p className="text-xs text-muted-foreground">
                        {truncate(doc.description, 60)}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={categoryColors[doc.category]}>
                      {(doc.category as DocumentCategory).charAt(0).toUpperCase() + doc.category.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {doc.folder === "/" ? "Root" : doc.folder}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {(doc as unknown as Record<string, unknown>).uploader
                      ? ((doc as unknown as Record<string, unknown>).uploader as Record<string, string>).full_name
                      : "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {formatDate(doc.created_at)}
                  </TableCell>
                  <TableCell>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
