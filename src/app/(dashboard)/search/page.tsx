"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchResults } from "@/components/search/search-results";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Clock, Trash2 } from "lucide-react";

interface SearchResult {
  type: string;
  id: string;
  title: string;
  description: string | null;
  url: string;
  meta: Record<string, unknown>;
}

type CategoryFilter = "all" | "request" | "deliverable" | "document" | "client" | "invoice";

const CATEGORY_TABS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "request", label: "Requests" },
  { value: "deliverable", label: "Deliverables" },
  { value: "document", label: "Documents" },
  { value: "client", label: "Clients" },
  { value: "invoice", label: "Invoices" },
];

const RECENT_SEARCHES_KEY = "gc3-recent-searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (!query || query.length < 2) return;
  const searches = getRecentSearches().filter((s) => s !== query);
  searches.unshift(query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches.slice(0, MAX_RECENT)));
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const performSearch = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const result = await response.json();
      if (response.ok) {
        setResults(result.data);
        saveRecentSearch(q);
        setRecentSearches(getRecentSearches());
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    router.replace(`/search?${params.toString()}`);
  };

  const filteredResults =
    activeCategory === "all"
      ? results
      : results.filter((r) => r.type === activeCategory);

  const categoryCounts = CATEGORY_TABS.map((tab) => ({
    ...tab,
    count: tab.value === "all" ? results.length : results.filter((r) => r.type === tab.value).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground">Search across requests, deliverables, documents, and more</p>
      </div>
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search everything..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="pl-10"
          autoFocus
        />
      </div>

      {!query && recentSearches.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Recent searches
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                clearRecentSearches();
                setRecentSearches([]);
              }}
            >
              <Trash2 className="h-3 w-3 mr-1" /> Clear
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setQuery(s);
                  router.replace(`/search?q=${encodeURIComponent(s)}`);
                }}
                className="text-xs bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-full transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {results.length > 0 && (
        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as CategoryFilter)}>
          <TabsList>
            {categoryCounts.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-1.5 text-[10px] bg-primary/10 text-primary px-1.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <SearchResults results={filteredResults} loading={loading} query={query} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <Skeleton className="h-9 w-32 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
          <Skeleton className="h-10 w-full max-w-xl" />
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
