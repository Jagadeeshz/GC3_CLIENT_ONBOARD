"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface CreateDeliverableFormProps {
  trigger?: React.ReactNode;
}

export function CreateDeliverableForm({ trigger }: CreateDeliverableFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState<Array<{ id: string; title: string }>>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requestId, setRequestId] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (open) {
      fetch("/api/requests?limit=100")
        .then((res) => res.json())
        .then((result) => {
          if (result.data) setRequests(result.data);
        })
        .catch(console.error);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !requestId) {
      toast.error("Title and request are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/deliverables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, request_id: requestId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create deliverable");
      }

      toast.success("Deliverable created successfully!");
      setOpen(false);
      setTitle("");
      setDescription("");
      setRequestId("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create deliverable");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Deliverable
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Deliverable</DialogTitle>
          <DialogDescription>
            Create a new deliverable for a request.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Deliverable title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Description of the deliverable..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>Request *</Label>
            <Select value={requestId} onValueChange={setRequestId} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select a request" />
              </SelectTrigger>
              <SelectContent>
                {requests.map((req) => (
                  <SelectItem key={req.id} value={req.id}>
                    {req.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Deliverable"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
