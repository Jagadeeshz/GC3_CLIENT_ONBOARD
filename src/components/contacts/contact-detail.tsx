"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Mail, Phone, Building, Calendar, Star } from "lucide-react";

interface ContactDetailProps {
  contactId: string;
}

interface ContactData {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  title: string | null;
  department: string | null;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    company_name: string;
    profiles?: { full_name: string; email: string };
  };
}

export function ContactDetail({ contactId }: ContactDetailProps) {
  const [contact, setContact] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchContact = async () => {
    try {
      const response = await fetch(`/api/contacts/${contactId}`);
      const result = await response.json();
      if (response.ok) {
        setContact(result.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, [contactId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!contact) {
    return <div className="text-center py-8 text-muted-foreground">Contact not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{contact.full_name}</h1>
            {contact.is_primary && (
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3 fill-current" />
                Primary
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {contact.client?.company_name || "Unknown Company"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${contact.email}`} className="hover:underline">
                    {contact.email}
                  </a>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p>{contact.phone || "Not provided"}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Title / Department</p>
                  <p>{contact.title || "No title"}{contact.department ? ` · ${contact.department}` : ""}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {contact.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{contact.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Company:</span>
                <span>{contact.client?.company_name || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span>{formatDate(contact.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Updated:</span>
                <span>{formatDate(contact.updated_at)}</span>
              </div>

              <Separator />

              <Button variant="outline" className="w-full" asChild>
                <a href={`mailto:${contact.email}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
