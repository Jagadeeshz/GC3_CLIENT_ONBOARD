"use client";

import { PaymentList } from "@/components/payments/payment-list";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">Payment history and processing</p>
      </div>
      <PaymentList />
    </div>
  );
}
