import { RequestDetail } from "@/components/requests/request-detail";

interface RequestDetailPageProps {
  params: {
    id: string;
  };
}

export default function RequestDetailPage({ params }: RequestDetailPageProps) {
  return <RequestDetail requestId={params.id} />;
}
