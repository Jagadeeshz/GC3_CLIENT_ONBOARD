import { DeliverableDetail } from "@/components/deliverables/deliverable-detail";

interface DeliverableDetailPageProps {
  params: {
    id: string;
  };
}

export default function DeliverableDetailPage({ params }: DeliverableDetailPageProps) {
  return <DeliverableDetail deliverableId={params.id} />;
}
