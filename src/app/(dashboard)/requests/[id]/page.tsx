import React from "react";
import { RequestDetail } from "@/components/requests/request-detail";

function RequestDetailPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <RequestDetail requestId={id} />;
}

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <RequestDetailPageContent params={params} />;
}
