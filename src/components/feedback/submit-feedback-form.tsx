"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubmitFeedbackFormProps {
  onSuccess?: () => void;
}

const FEEDBACK_CATEGORIES = [
  { value: "deliverable_quality", label: "Deliverable Quality" },
  { value: "communication", label: "Communication" },
  { value: "timeliness", label: "Timeliness" },
  { value: "overall_satisfaction", label: "Overall Satisfaction" },
] as const;

export function SubmitFeedbackForm({ onSuccess }: SubmitFeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [category, setCategory] = useState<string>("");
  const [type, setType] = useState<string>("general");
  const [deliverableId, setDeliverableId] = useState("");
  const [requestId, setRequestId] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || null,
          type,
          category,
          deliverable_id: deliverableId || null,
          request_id: requestId || null,
          is_anonymous: isAnonymous,
        }),
      });

      if (response.ok) {
        setRating(0);
        setComment("");
        setCategory("");
        setType("general");
        setDeliverableId("");
        setRequestId("");
        setIsAnonymous(false);
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Feedback</CardTitle>
        <CardDescription>
          Share your experience to help us improve
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating *</label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const starIndex = i + 1;
                const filled = starIndex <= (hoveredRating || rating);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(starIndex)}
                    onMouseEnter={() => setHoveredRating(starIndex)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        filled
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-200 hover:text-yellow-200"
                      )}
                    />
                  </button>
                );
              })}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating}/5
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Feedback Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {FEEDBACK_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Feedback Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="deliverable">Deliverable</SelectItem>
                <SelectItem value="service">Service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              placeholder="Tell us about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          {type === "deliverable" && (
            <div className="space-y-2">
              <Label>Deliverable ID (optional)</Label>
              <Input
                placeholder="Deliverable UUID"
                value={deliverableId}
                onChange={(e) => setDeliverableId(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Related Request ID (optional)</Label>
            <Input
              placeholder="Request UUID"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="anonymous">Submit anonymously</Label>
              <p className="text-xs text-muted-foreground">
                Your name will not be shown with this feedback
              </p>
            </div>
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
          </div>

          <Button
            type="submit"
            disabled={submitting || rating === 0 || !category}
            className="w-full"
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
