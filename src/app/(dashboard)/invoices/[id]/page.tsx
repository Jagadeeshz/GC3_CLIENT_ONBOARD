import React from "react";
import { InvoiceDetail } from "@/components/invoices/invoice-detail";

function InvoiceDetailPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <InvoiceDetail invoiceId={id} />;
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <InvoiceDetailPageContent params={params} />;
}
