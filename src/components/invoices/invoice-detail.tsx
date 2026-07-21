"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ArrowLeft, Calendar, FileText, Receipt } from "lucide-react";

interface InvoiceDetailProps {
  invoiceId: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

interface InvoiceData {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  notes: string | null;
  due_date: string;
  paid_at: string | null;
  is_addon: boolean;
  created_at: string;
  client?: {
    id: string;
    company_name: string;
    profiles?: { full_name: string; email: string };
  };
  line_items?: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;
}

export function InvoiceDetail({ invoiceId }: InvoiceDetailProps) {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      const result = await response.json();
      if (response.ok) {
        setInvoice(result.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success("Status updated");
        fetchInvoice();
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!invoice) {
    return <div className="text-center py-8 text-muted-foreground">Invoice not found</div>;
  }

  const lineItems = invoice.line_items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{invoice.invoice_number}</h1>
          <p className="text-muted-foreground">
            {invoice.client?.company_name || "Unknown Client"}
          </p>
        </div>
        <Badge className={statusColors[invoice.status]}>
          {invoice.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoice.description && (
                <p className="text-muted-foreground">{invoice.description}</p>
              )}
              {invoice.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              {lineItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No line items.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(item.unit_price), invoice.currency)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(Number(item.amount), invoice.currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="text-2xl font-bold">
                  {formatCurrency(Number(invoice.amount), invoice.currency)}
                </span>
              </div>

              <Separator />

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Due Date:</span>
                <span>{formatDate(invoice.due_date)}</span>
              </div>

              {invoice.paid_at && (
                <div className="flex items-center gap-2 text-sm">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Paid:</span>
                  <span>{formatDate(invoice.paid_at)}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span>{formatDate(invoice.created_at)}</span>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {["draft", "pending", "paid", "overdue", "cancelled"].map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={invoice.status === s ? "default" : "outline"}
                      onClick={() => updateStatus(s)}
                      disabled={updating || invoice.status === s}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
