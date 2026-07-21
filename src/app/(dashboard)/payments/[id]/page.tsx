import React from "react";
import { PaymentDetail } from "@/components/payments/payment-detail";

function PaymentDetailPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <PaymentDetail paymentId={id} />;
}

export default function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <PaymentDetailPageContent params={params} />;
}
