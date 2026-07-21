"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Contact {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  title: string | null;
  is_primary: boolean;
}

interface Request {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

interface ClientData {
  id: string;
  company_name: string;
  industry: string | null;
  website: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  contacts: Contact[];
  requests: Request[];
  hours_wallet: { total_hours: number; used_hours: number; remaining_hours: number } | null;
}

interface ClientDetailProps {
  clientId: string;
}

export function ClientDetail({ clientId }: ClientDetailProps) {
  const [data, setData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clients/${clientId}`)
      .then((r) => r.json())
      .then((d) => setData(d.data))
      .finally(() => setLoading(false));
  }, [clientId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!data) return <p className="text-muted-foreground">Client not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">{data.company_name}</h3>
        <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
          {data.industry && <span>Industry: {data.industry}</span>}
          {data.website && <span>Website: {data.website}</span>}
          {data.city && <span>Location: {[data.city, data.state, data.country].filter(Boolean).join(", ")}</span>}
        </div>
      </div>

      {data.contacts && data.contacts.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Contacts</h4>
          <div className="space-y-1">
            {data.contacts.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{c.full_name}</span>
                  <span className="text-muted-foreground ml-2">{c.email}</span>
                  {c.is_primary && <Badge variant="default" className="ml-2 text-xs">Primary</Badge>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.requests && data.requests.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Requests ({data.requests.length})</h4>
          <div className="space-y-1">
            {data.requests.slice(0, 10).map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <span>{r.title}</span>
                <Badge variant="outline" className="text-xs">{r.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
