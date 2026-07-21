"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  Mail,
  Phone,
  Building,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Users,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Contact } from "@/types";

// ──────────────────── Types ────────────────────

interface ContactWithRelations extends Contact {
  client?: { id: string; company_name: string };
}

interface ContactFormData {
  client_id: string;
  full_name: string;
  email: string;
  phone: string;
  title: string;
  department: string;
  is_primary: boolean;
  notes: string;
}

const defaultFormData: ContactFormData = {
  client_id: "",
  full_name: "",
  email: "",
  phone: "",
  title: "",
  department: "",
  is_primary: false,
  notes: "",
};

// ──────────────────── Contacts Page ────────────────────

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">Manage your contacts</p>
        </div>
        <CreateContactDialog />
      </div>
      <ContactList />
    </div>
  );
}

// ──────────────────── Create Contact Dialog ────────────────────

function CreateContactDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<ContactFormData>(defaultFormData);

  const handleSubmit = async () => {
    if (!form.full_name || !form.email || !form.client_id) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (response.ok) {
        setOpen(false);
        setForm(defaultFormData);
        onCreated?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Contact</DialogTitle>
          <DialogDescription>Add a new contact to your client list.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="c-client-id">Client ID *</Label>
            <Input
              id="c-client-id"
              placeholder="UUID of the client"
              value={form.client_id}
              onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="c-name">Full Name *</Label>
              <Input
                id="c-name"
                placeholder="John Smith"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-email">Email *</Label>
              <Input
                id="c-email"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="c-phone">Phone</Label>
              <Input
                id="c-phone"
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-title">Title</Label>
              <Input
                id="c-title"
                placeholder="e.g. Project Manager"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-dept">Department</Label>
            <Input
              id="c-dept"
              placeholder="e.g. Engineering"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="c-primary"
              checked={form.is_primary}
              onCheckedChange={(checked) =>
                setForm({ ...form, is_primary: checked === true })
              }
              disabled={isSubmitting}
            />
            <Label htmlFor="c-primary" className="cursor-pointer">
              Primary contact
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-notes">Notes</Label>
            <Textarea
              id="c-notes"
              placeholder="Additional notes about this contact..."
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !form.full_name || !form.email || !form.client_id}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Contact
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ──────────────────── Edit Contact Dialog ────────────────────

function EditContactDialog({
  contact,
  open,
  onOpenChange,
  onSaved,
}: {
  contact: ContactWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<ContactFormData>({
    client_id: contact.client_id,
    full_name: contact.full_name,
    email: contact.email,
    phone: contact.phone || "",
    title: contact.title || "",
    department: contact.department || "",
    is_primary: contact.is_primary,
    notes: contact.notes || "",
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (response.ok) {
        onOpenChange(false);
        onSaved();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
          <DialogDescription>Update contact information.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.is_primary}
              onCheckedChange={(checked) =>
                setForm({ ...form, is_primary: checked === true })
              }
              disabled={isSubmitting}
            />
            <Label className="cursor-pointer">Primary contact</Label>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ──────────────────── Contact Detail Dialog ────────────────────

function ContactDetailDialog({
  contact,
  open,
  onOpenChange,
  onEdit,
}: {
  contact: ContactWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}) {
  const initials = contact.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">
              {initials}
            </div>
            <div>
              <DialogTitle className="flex items-center gap-2">
                {contact.full_name}
                {contact.is_primary && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Primary
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                {contact.title || "No title"}
                {contact.department ? ` · ${contact.department}` : ""}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <a href={`mailto:${contact.email}`} className="text-sm hover:underline font-medium">
                {contact.email}
              </a>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-medium">{contact.phone || "Not provided"}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Building className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Company</p>
              <p className="text-sm font-medium">
                {contact.client?.company_name || "N/A"}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm font-medium">{formatDate(contact.created_at)}</p>
            </div>
          </div>

          {contact.notes && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {contact.notes}
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="mr-1 h-3 w-3" />
            Edit
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`mailto:${contact.email}`}>
              <Mail className="mr-1 h-3 w-3" />
              Email
            </a>
          </Button>
          {contact.phone && (
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${contact.phone}`}>
                <Phone className="mr-1 h-3 w-3" />
                Call
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <a href={`/clients/${contact.client_id}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-3 w-3" />
              Client Portal
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ──────────────────── Contact List ────────────────────

function ContactList() {
  const [contacts, setContacts] = useState<ContactWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [detailContact, setDetailContact] = useState<ContactWithRelations | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editContact, setEditContact] = useState<ContactWithRelations | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (search) params.set("search", search);

      const response = await fetch(`/api/contacts?${params}`);
      const result = await response.json();

      if (response.ok) {
        setContacts(result.data);
        setTotalPages(result.totalPages);
      } else {
        setContacts(MOCK_CONTACTS);
        setTotalPages(1);
      }
    } catch {
      setContacts(MOCK_CONTACTS);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const openDetail = (contact: ContactWithRelations) => {
    setDetailContact(contact);
    setDetailOpen(true);
  };

  const openEdit = (contact: ContactWithRelations) => {
    setDetailOpen(false);
    setEditContact(contact);
    setEditOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit} className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
      </form>

      {contacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No contacts yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-4">
              Get started by adding your first contact. Contacts help you manage communication
              with client team members.
            </p>
            <CreateContactDialog onCreated={() => fetchContacts()} />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden md:table-cell">Company</TableHead>
                  <TableHead className="hidden lg:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => {
                  const initials = contact.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <TableRow
                      key={contact.id}
                      className="cursor-pointer"
                      onClick={() => openDetail(contact)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{contact.full_name}</span>
                              {contact.is_primary && (
                                <Badge variant="secondary" className="gap-1 text-xs">
                                  <Star className="h-3 w-3 fill-current" />
                                  Primary
                                </Badge>
                              )}
                            </div>
                            {contact.title && (
                              <p className="text-xs text-muted-foreground">
                                {contact.title}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {contact.email}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {contact.phone || "—"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {contact.client?.company_name || "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {formatDate(contact.created_at)}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`mailto:${contact.email}`, "_blank");
                            }}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          {contact.phone && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`tel:${contact.phone}`, "_blank");
                              }}
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(contact);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {contact.full_name}? This
                                  action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={async () => {
                                    await fetch(`/api/contacts/${contact.id}`, {
                                      method: "DELETE",
                                    });
                                    fetchContacts();
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {detailContact && (
        <ContactDetailDialog
          contact={detailContact}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onEdit={() => openEdit(detailContact)}
        />
      )}

      {editContact && (
        <EditContactDialog
          contact={editContact}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSaved={() => {
            setEditOpen(false);
            fetchContacts();
          }}
        />
      )}
    </div>
  );
}

// ──────────────────── Mock Data ────────────────────

const MOCK_CONTACTS: ContactWithRelations[] = [
  {
    id: "c1",
    client_id: "cl1",
    full_name: "Sarah Johnson",
    email: "sarah.johnson@acmecorp.com",
    phone: "+1 (555) 123-4567",
    title: "VP of Engineering",
    department: "Engineering",
    is_primary: true,
    notes: "Main point of contact for all project communications. Prefers email over phone.",
    created_at: "2024-06-15T10:00:00Z",
    updated_at: "2025-01-10T14:30:00Z",
    client: { id: "cl1", company_name: "Acme Corp" },
  },
  {
    id: "c2",
    client_id: "cl1",
    full_name: "Michael Chen",
    email: "m.chen@acmecorp.com",
    phone: "+1 (555) 234-5678",
    title: "Product Manager",
    department: "Product",
    is_primary: false,
    notes: null,
    created_at: "2024-08-20T10:00:00Z",
    updated_at: "2024-12-05T09:15:00Z",
    client: { id: "cl1", company_name: "Acme Corp" },
  },
  {
    id: "c3",
    client_id: "cl2",
    full_name: "Emily Rodriguez",
    email: "emily.r@globex.io",
    phone: "+1 (555) 345-6789",
    title: "CTO",
    department: "Technology",
    is_primary: true,
    notes: "Decision maker for technical initiatives.",
    created_at: "2024-03-10T10:00:00Z",
    updated_at: "2025-02-01T11:00:00Z",
    client: { id: "cl2", company_name: "Globex Industries" },
  },
  {
    id: "c4",
    client_id: "cl2",
    full_name: "David Park",
    email: "david@globex.io",
    phone: null,
    title: "Frontend Lead",
    department: "Engineering",
    is_primary: false,
    notes: null,
    created_at: "2024-09-05T10:00:00Z",
    updated_at: "2024-11-20T16:45:00Z",
    client: { id: "cl2", company_name: "Globex Industries" },
  },
  {
    id: "c5",
    client_id: "cl3",
    full_name: "Lisa Wang",
    email: "lisa.wang@initech.com",
    phone: "+1 (555) 567-8901",
    title: "Director of Operations",
    department: "Operations",
    is_primary: true,
    notes: "Available Mon-Fri 9am-5pm EST.",
    created_at: "2024-05-01T10:00:00Z",
    updated_at: "2025-03-15T08:20:00Z",
    client: { id: "cl3", company_name: "Initech Solutions" },
  },
  {
    id: "c6",
    client_id: "cl3",
    full_name: "James Mitchell",
    email: "j.mitchell@initech.com",
    phone: "+1 (555) 678-9012",
    title: "QA Lead",
    department: "Quality Assurance",
    is_primary: false,
    notes: "Handles all testing-related communications.",
    created_at: "2024-07-18T10:00:00Z",
    updated_at: "2025-01-25T13:10:00Z",
    client: { id: "cl3", company_name: "Initech Solutions" },
  },
  {
    id: "c7",
    client_id: "cl4",
    full_name: "Amanda Foster",
    email: "a.foster@umbrella.co",
    phone: "+44 20 7946 0958",
    title: "Project Director",
    department: "PMO",
    is_primary: true,
    notes: "UK-based. Prefers meetings after 2pm GMT.",
    created_at: "2024-01-22T10:00:00Z",
    updated_at: "2025-04-01T10:00:00Z",
    client: { id: "cl4", company_name: "Umbrella Corp" },
  },
  {
    id: "c8",
    client_id: "cl4",
    full_name: "Robert Taylor",
    email: "r.taylor@umbrella.co",
    phone: null,
    title: "Backend Engineer",
    department: "Engineering",
    is_primary: false,
    notes: null,
    created_at: "2024-10-12T10:00:00Z",
    updated_at: "2025-02-28T15:30:00Z",
    client: { id: "cl4", company_name: "Umbrella Corp" },
  },
];
