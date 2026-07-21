"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronDown, HelpCircle } from "lucide-react";
import type { FAQ } from "@/types";

export function FaqList() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const fetchFaqs = async () => {
    try {
      const response = await fetch("/api/faq");
      const result = await response.json();
      if (response.ok) {
        setFaqs(result.data);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const filteredFaqs = useMemo(() => {
    if (!search.trim()) return faqs;
    const lower = search.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(lower) ||
        faq.answer.toLowerCase().includes(lower)
    );
  }, [faqs, search]);

  const groupedFaqs = useMemo(() => {
    const groups: Record<string, FAQ[]> = {};
    for (const faq of filteredFaqs) {
      const cat = faq.category || "General";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(faq);
    }
    return groups;
  }, [filteredFaqs]);

  const categories = Object.keys(groupedFaqs).sort();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full max-w-md" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 2 }).map((_, j) => (
                <Skeleton key={j} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No FAQs found.</p>
          </CardContent>
        </Card>
      ) : (
        categories.map((category) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {groupedFaqs[category].map((faq) => (
                <div key={faq.id} className="border rounded-lg">
                  <button
                    type="button"
                    onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                    className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-medium text-sm pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                        openId === faq.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openId === faq.id && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground border-t">
                      <p className="pt-3 whitespace-pre-wrap">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
