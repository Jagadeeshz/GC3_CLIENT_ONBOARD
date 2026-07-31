import { PaymentDetail } from "@/components/payments/payment-detail";

interface PaymentDetailPageProps {
  params: {
    id: string;
  };
}

export default function PaymentDetailPage({ params }: PaymentDetailPageProps) {
  return <PaymentDetail paymentId={params.id} />;
}
