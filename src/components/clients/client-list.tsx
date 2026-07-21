"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateClientForm } from "./create-client-form";
import type { Client } from "@/types";

interface ClientWithRelations extends Client {
  profile?: { full_name: string; email: string; avatar_url: string | null } | null;
  contacts?: Array<{ full_name: string; email: string; is_primary: boolean }>;
  hours_wallet?: { total_hours: number; used_hours: number; remaining_hours: number } | null;
}

interface ClientsResponse {
  data: ClientWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function ClientList() {
  const [clients, setClients] = useState<ClientsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientWithRelations | null>(null);

  const fetchClients = () => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);

    fetch(`/api/clients?${params}`)
      .then((r) => r.json())
      .then(setClients)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClients();
  }, [page, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold">Clients</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-[200px]"
          />
          <Button onClick={() => setShowCreate(true)}>Add Client</Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No clients found.
                    </TableCell>
                  </TableRow>
                ) : (
                  clients?.data.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.company_name}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{client.profile?.full_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{client.profile?.email || ""}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {client.industry || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {client.hours_wallet
                          ? `${client.hours_wallet.used_hours || 0}h / ${client.hours_wallet.total_hours || 0}h`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={client.is_active ? "success" : "secondary"}>
                          {client.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedClient(client)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {clients && clients.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, clients.total)} of {clients.total}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= clients.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <CreateClientForm open={showCreate} onOpenChange={setShowCreate} onCreated={fetchClients} />

      {selectedClient && (
        <ClientDetailDialog
          clientId={selectedClient.id}
          open={!!selectedClient}
          onOpenChange={(open) => {
            if (!open) setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
}

function ClientDetailDialog({
  clientId,
  open,
  onOpenChange,
}: {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [data, setData] = useState<ClientWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    fetch(`/api/clients/${clientId}`)
      .then((r) => r.json())
      .then((d) => setData(d.data))
      .finally(() => setLoading(false));
  }, [clientId, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => onOpenChange(false)}>
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{data.company_name}</h3>
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
            </div>
            {data.industry && <p className="text-sm text-muted-foreground">Industry: {data.industry}</p>}
            {data.website && <p className="text-sm text-muted-foreground">Website: {data.website}</p>}

            {data.contacts && data.contacts.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Contacts</h4>
                <div className="space-y-1">
                  {data.contacts.map((c, i) => (
                    <div key={i} className="flex items-center text-sm">
                      <span className="font-medium">{c.full_name}</span>
                      <span className="text-muted-foreground ml-2">{c.email}</span>
                      {c.is_primary && <Badge variant="default" className="ml-2 text-xs">Primary</Badge>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">Client not found.</p>
        )}
      </div>
    </div>
  );
}
