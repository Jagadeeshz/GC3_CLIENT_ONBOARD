"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Package,
  FolderOpen,
  Receipt,
  Building2,
  Star,
  SearchX,
  Lightbulb,
} from "lucide-react";

interface SearchResult {
  type: string;
  id: string;
  title: string;
  description: string | null;
  url: string;
  meta: Record<string, unknown>;
}

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  query: string;
}

const typeConfig: Record<string, { icon: typeof FileText; label: string; color: string }> = {
  request: { icon: FileText, label: "Requests", color: "bg-blue-100 text-blue-800" },
  deliverable: { icon: Package, label: "Deliverables", color: "bg-purple-100 text-purple-800" },
  document: { icon: FolderOpen, label: "Documents", color: "bg-green-100 text-green-800" },
  invoice: { icon: Receipt, label: "Invoices", color: "bg-orange-100 text-orange-800" },
  client: { icon: Building2, label: "Clients", color: "bg-cyan-100 text-cyan-800" },
  feedback: { icon: Star, label: "Feedback", color: "bg-yellow-100 text-yellow-800" },
};

export function SearchResults({ results, loading, query }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (!query || query.length < 2) {
    return (
      <div className="text-center py-12">
        <SearchX className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-muted-foreground">Type at least 2 characters to search</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <SearchX className="h-12 w-12 text-muted-foreground/50 mx-auto" />
        <div>
          <p className="text-lg font-medium">No results found for &ldquo;{query}&rdquo;</p>
          <p className="text-sm text-muted-foreground mt-1">Try different keywords or check your spelling</p>
        </div>
        <div className="max-w-md mx-auto text-left">
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
            <Lightbulb className="h-3.5 w-3.5" /> Suggestions
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Make sure all words are spelled correctly</li>
            <li>Try broader or fewer keywords</li>
            <li>Try searching by document title or client name</li>
            <li>Check the &ldquo;All&rdquo; category tab for broader results</li>
          </ul>
        </div>
      </div>
    );
  }

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {results.length} result{results.length !== 1 ? "s" : ""} found
      </p>
      {Object.entries(grouped).map(([type, items]) => {
        const config = typeConfig[type] || { icon: FileText, label: type, color: "bg-gray-100 text-gray-800" };
        const Icon = config.icon;
        return (
          <div key={type}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className="h-4 w-4" />
              <h3 className="font-semibold text-sm">{config.label}</h3>
              <Badge variant="secondary" className="text-xs">
                {items.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  className="block p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                    {typeof item.meta.status === "string" && (
                      <Badge className={`${config.color} shrink-0`}>
                        {item.meta.status.replace("_", " ")}
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
