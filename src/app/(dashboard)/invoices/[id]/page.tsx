import { InvoiceDetail } from "@/components/invoices/invoice-detail";

interface InvoiceDetailPageProps {
  params: {
    id: string;
  };
}

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  return <InvoiceDetail invoiceId={params.id} />;
}
