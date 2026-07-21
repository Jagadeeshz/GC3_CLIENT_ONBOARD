import { z } from "zod";

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required").max(500),
  quantity: z.number().positive(),
  unit_price: z.number().positive("Unit price must be positive"),
  amount: z.number().positive("Amount must be positive"),
});

export const createInvoiceSchema = z.object({
  client_id: z.string().uuid("Invalid client ID"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().min(3).max(3),
  status: z.enum(["draft", "pending", "paid", "overdue", "cancelled"]),
  description: z.string().max(5000).optional(),
  notes: z.string().max(5000).optional(),
  due_date: z.string().min(1, "Due date is required"),
  is_addon: z.boolean(),
  change_request_id: z.string().uuid().nullable().optional(),
  line_items: z.array(lineItemSchema).min(1, "At least one line item is required"),
});

export const updateInvoiceSchema = z.object({
  amount: z.number().positive().optional(),
  currency: z.string().min(3).max(3).optional(),
  status: z.enum(["draft", "pending", "paid", "overdue", "cancelled"]).optional(),
  description: z.string().max(5000).optional(),
  notes: z.string().max(5000).optional(),
  due_date: z.string().optional(),
  is_addon: z.boolean().optional(),
  line_items: z.array(lineItemSchema).optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
