import { z } from "zod";

export const createPaymentSchema = z.object({
  invoice_id: z.string().uuid("Invalid invoice ID"),
  client_id: z.string().uuid("Invalid client ID"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().min(3).max(3).default("USD"),
  status: z.enum(["pending", "processing", "completed", "failed", "refunded"]).default("pending"),
  payment_method: z.string().max(100).optional(),
  notes: z.string().max(5000).optional(),
});

export const updatePaymentSchema = z.object({
  status: z.enum(["pending", "processing", "completed", "failed", "refunded"]).optional(),
  payment_method: z.string().max(100).optional(),
  notes: z.string().max(5000).optional(),
  processed_at: z.string().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
