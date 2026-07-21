import React from "react";
import { DeliverableDetail } from "@/components/deliverables/deliverable-detail";

function DeliverableDetailPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <DeliverableDetail deliverableId={id} />;
}

export default function DeliverableDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <DeliverableDetailPageContent params={params} />;
}
