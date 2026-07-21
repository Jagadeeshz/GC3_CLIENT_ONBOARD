"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInvoiceSchema, type CreateInvoiceInput } from "@/validators/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CreateInvoiceFormProps {
  trigger?: React.ReactNode;
}

export function CreateInvoiceForm({ trigger }: CreateInvoiceFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateInvoiceInput>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      currency: "USD",
      status: "draft",
      is_addon: false,
      line_items: [{ description: "", quantity: 1, unit_price: 0, amount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "line_items",
  });

  const lineItems = watch("line_items");
  const totalAmount = lineItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

  const onSubmit = async (data: CreateInvoiceInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, amount: totalAmount }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create invoice");
      }

      toast.success("Invoice created successfully!");
      setOpen(false);
      reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create invoice");
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
            New Invoice
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice with line items for a client.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client_id">Client ID *</Label>
            <Input
              id="client_id"
              placeholder="UUID of the client"
              {...register("client_id")}
              disabled={isSubmitting}
            />
            {errors.client_id && (
              <p className="text-sm text-destructive">{errors.client_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date *</Label>
            <Input
              id="due_date"
              type="date"
              {...register("due_date")}
              disabled={isSubmitting}
            />
            {errors.due_date && (
              <p className="text-sm text-destructive">{errors.due_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Invoice description..."
              rows={3}
              {...register("description")}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>Line Items *</Label>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Input
                      placeholder="Description"
                      {...register(`line_items.${index}.description`)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="1"
                      min="1"
                      placeholder="Qty"
                      {...register(`line_items.${index}.quantity`, { valueAsNumber: true })}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Unit Price"
                      {...register(`line_items.${index}.unit_price`, { valueAsNumber: true })}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Amount"
                      {...register(`line_items.${index}.amount`, { valueAsNumber: true })}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={isSubmitting || fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ description: "", quantity: 1, unit_price: 0, amount: 0 })}
              disabled={isSubmitting}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Line Item
            </Button>
            {errors.line_items && (
              <p className="text-sm text-destructive">{errors.line_items.message}</p>
            )}
          </div>

          <div className="flex justify-end text-lg font-bold">
            Total: ${totalAmount.toFixed(2)}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              rows={2}
              {...register("notes")}
              disabled={isSubmitting}
            />
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
                "Create Invoice"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
