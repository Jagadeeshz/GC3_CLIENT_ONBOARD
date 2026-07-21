"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CreateChangeRequestFormProps {
  onRequestCreated?: () => void;
}

export function CreateChangeRequestForm({ onRequestCreated }: CreateChangeRequestFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requestId, setRequestId] = useState("");
  const [reason, setReason] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !requestId.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/change-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          request_id: requestId.trim(),
          reason: reason.trim() || null,
          estimated_hours: estimatedHours ? parseFloat(estimatedHours) : null,
          estimated_cost: estimatedCost ? parseFloat(estimatedCost) : null,
        }),
      });

      if (response.ok) {
        setTitle("");
        setDescription("");
        setRequestId("");
        setReason("");
        setEstimatedHours("");
        setEstimatedCost("");
        onRequestCreated?.();
      }
    } catch (error) {
      console.error("Error creating change request:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Change Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              placeholder="Change request title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description *</label>
            <Textarea
              placeholder="Describe the change request"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Related Request ID *</label>
            <Input
              placeholder="Request UUID"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason for Change</label>
            <Textarea
              placeholder="Why is this change needed?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Hours</label>
              <Input
                type="number"
                step="0.5"
                placeholder="0"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Cost ($)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Creating..." : "Create Change Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
