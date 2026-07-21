"use client";

import { InvoiceList } from "@/components/invoices/invoice-list";
import { CreateInvoiceForm } from "@/components/invoices/create-invoice-form";

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">View and manage invoices</p>
        </div>
        <CreateInvoiceForm />
      </div>
      <InvoiceList />
    </div>
  );
}
