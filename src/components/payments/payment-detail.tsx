"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDate, formatCurrency, formatDateTime } from "@/lib/utils";
import { ArrowLeft, Calendar, CreditCard, ExternalLink } from "lucide-react";

interface PaymentDetailProps {
  paymentId: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-purple-100 text-purple-800",
};

interface PaymentData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  stripe_payment_id: string | null;
  stripe_receipt_url: string | null;
  notes: string | null;
  processed_at: string | null;
  created_at: string;
  invoice?: { id: string; invoice_number: string; amount: number; due_date: string } | null;
  client?: {
    id: string;
    company_name: string;
    profiles?: { full_name: string; email: string; avatar_url: string | null };
  };
}

export function PaymentDetail({ paymentId }: PaymentDetailProps) {
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const fetchPayment = async () => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`);
      const result = await response.json();
      if (response.ok) {
        setPayment(result.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, [paymentId]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success("Status updated");
        fetchPayment();
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

  if (!payment) {
    return <div className="text-center py-8 text-muted-foreground">Payment not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            Payment — {formatCurrency(Number(payment.amount), payment.currency)}
          </h1>
          <p className="text-muted-foreground">
            {payment.client?.company_name || "Unknown Client"}
          </p>
        </div>
        <Badge className={statusColors[payment.status]}>
          {payment.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amount Paid</span>
                <span className="text-2xl font-bold">
                  {formatCurrency(Number(payment.amount), payment.currency)}
                </span>
              </div>

              <Separator />

              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Method:</span>
                <span>{payment.payment_method || "Not specified"}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span>{formatDateTime(payment.created_at)}</span>
              </div>

              {payment.processed_at && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Processed:</span>
                  <span>{formatDateTime(payment.processed_at)}</span>
                </div>
              )}

              {payment.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm">{payment.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {payment.invoice && (
            <Card>
              <CardHeader>
                <CardTitle>Linked Invoice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{payment.invoice.invoice_number}</p>
                    <p className="text-sm text-muted-foreground">
                      Amount: {formatCurrency(Number(payment.invoice.amount))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Due: {formatDate(payment.invoice.due_date)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/invoices/${payment.invoice.id}`}>View Invoice</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {payment.stripe_payment_id && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">Stripe Payment ID</p>
                  <p className="font-mono text-xs break-all">{payment.stripe_payment_id}</p>
                </div>
              )}

              {payment.stripe_receipt_url && (
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={payment.stripe_receipt_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Receipt
                  </a>
                </Button>
              )}

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {["pending", "processing", "completed", "failed", "refunded"].map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={payment.status === s ? "default" : "outline"}
                      onClick={() => updateStatus(s)}
                      disabled={updating || payment.status === s}
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
