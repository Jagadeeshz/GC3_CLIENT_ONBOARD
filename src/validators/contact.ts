import { z } from "zod";

export const createContactSchema = z.object({
  client_id: z.string().uuid("Invalid client ID"),
  full_name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(20).nullable().optional(),
  title: z.string().max(200).nullable().optional(),
  department: z.string().max(200).nullable().optional(),
  is_primary: z.boolean(),
  notes: z.string().max(5000).nullable().optional(),
});

export const updateContactSchema = z.object({
  full_name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).nullable().optional(),
  title: z.string().max(200).nullable().optional(),
  department: z.string().max(200).nullable().optional(),
  is_primary: z.boolean().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
