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
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface TransactionListProps {
  walletId: string;
}

export function TransactionList({ walletId }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams({
        wallet_id: walletId,
        page: page.toString(),
        limit: "50",
      });

      const response = await fetch(`/api/hours-wallet/transactions?${params}`);
      const result = await response.json();

      if (response.ok) {
        setTransactions(result.data);
        setTotalPages(result.totalPages);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [walletId, page]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="hidden md:table-cell">Request</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((txn) => (
                <TableRow key={txn.id as string}>
                  <TableCell>
                    <Badge variant={txn.type === "credit" ? "success" : "destructive"}>
                      {(txn.type as string).charAt(0).toUpperCase() + (txn.type as string).slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">
                    {txn.type === "credit" ? "+" : "-"}
                    {Number(txn.hours).toFixed(1)}
                  </TableCell>
                  <TableCell>
                    {txn.description ? (txn.description as string) : "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {(txn.request as Record<string, string>)?.title || "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDateTime(txn.created_at as string)}
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
