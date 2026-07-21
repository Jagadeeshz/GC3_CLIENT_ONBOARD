import { z } from "zod";

export const createRequestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  category: z.string().optional(),
  due_date: z.string().optional(),
  estimated_hours: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateRequestSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  status: z.enum(["pending", "in_review", "in_progress", "completed", "cancelled", "on_hold"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  pod_id: z.string().uuid().nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  category: z.string().optional(),
  due_date: z.string().optional(),
  estimated_hours: z.number().positive().optional(),
  actual_hours: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
