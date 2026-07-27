"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRequestSchema, type CreateRequestInput } from "@/validators/request";
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
import { Progress } from "@/components/ui/progress";
import { Loader2, Plus, ArrowLeft, ArrowRight, Upload, X, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { uploadFileClient, BUCKETS } from "@/lib/database/storage";

interface CreateRequestFormProps {
  trigger?: React.ReactNode;
}

interface FileAttachment {
  file: File;
  progress: number;
  uploaded: boolean;
  path: string | null;
}

const STEPS = [
  { title: "Basic Info", description: "Title and description" },
  { title: "Details", description: "Priority and scheduling" },
  { title: "Attachments", description: "Upload files" },
  { title: "Review", description: "Confirm and submit" },
];

export function CreateRequestForm({ trigger }: CreateRequestFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      priority: "medium",
      tags: [],
    },
  });

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newAttachments: FileAttachment[] = selectedFiles.map((file) => ({
      file,
      progress: 0,
      uploaded: false,
      path: null,
    }));
    setFiles((prev) => [...prev, ...newAttachments]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const uploadFiles = async (): Promise<string[]> => {
    const paths: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const currentPath = files[i].path;
      if (files[i].uploaded && currentPath) {
        paths.push(currentPath);
        continue;
      }
      const file = files[i].file;
      const path = `requests/${Date.now()}-${file.name}`;
      const result = await uploadFileClient(BUCKETS.ATTACHMENTS, path, file, (progress) => {
        setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, progress } : f));
      });
      if (result) {
        paths.push(result);
        setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, uploaded: true, path: result } : f));
      }
    }
    return paths;
  };

  const onSubmit = async (data: CreateRequestInput) => {
    setIsSubmitting(true);
    try {
      const attachmentPaths = await uploadFiles();
      const payload = {
        ...data,
        tags: attachmentPaths.length > 0 ? attachmentPaths : undefined,
      };

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create request");
      }

      toast.success("Request created successfully!");
      handleClose();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsDraftSaving(true);
    try {
      const data = watch();
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, status: "draft" }),
      });

      if (!response.ok) {
        throw new Error("Failed to save draft");
      }

      toast.success("Draft saved!");
      handleClose();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save draft");
    } finally {
      setIsDraftSaving(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentStep(0);
    setFiles([]);
    reset();
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const stepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of your request"
                {...register("title")}
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about your request..."
                rows={5}
                {...register("description")}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority *</Label>
                <Select
                  value={watch("priority")}
                  onValueChange={(value) => setValue("priority", value as "low" | "medium" | "high" | "urgent")}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g. Design, Development"
                  {...register("category")}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  {...register("due_date")}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated_hours">Estimated Hours</Label>
                <Input
                  id="estimated_hours"
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="0"
                  {...register("estimated_hours", { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-dashed p-6 text-center hover:border-primary/50 transition-colors">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium mb-1">Drop files here or click to upload</p>
              <p className="text-xs text-muted-foreground mb-3">
                Attach supporting documents, screenshots, or reference files
              </p>
              <Input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button type="button" variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Files
                </Button>
              </Label>
            </div>
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((f, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-lg border p-3">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{f.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(f.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    {f.uploaded ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    ) : f.progress > 0 ? (
                      <span className="text-xs text-muted-foreground">{f.progress}%</span>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <h4 className="font-medium">Request Summary</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Title: </span>
                  <span className="font-medium">{watch("title") || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Description: </span>
                  <span>{watch("description")?.slice(0, 100)}{watch("description")?.length > 100 ? "..." : ""}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Priority: </span>
                  <span className="capitalize">{watch("priority")}</span>
                </div>
                {watch("category") && (
                  <div>
                    <span className="text-muted-foreground">Category: </span>
                    <span>{watch("category")}</span>
                  </div>
                )}
                {watch("due_date") && (
                  <div>
                    <span className="text-muted-foreground">Due Date: </span>
                    <span>{watch("due_date")}</span>
                  </div>
                )}
                {watch("estimated_hours") && (
                  <div>
                    <span className="text-muted-foreground">Est. Hours: </span>
                    <span>{watch("estimated_hours")}</span>
                  </div>
                )}
                {files.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Attachments: </span>
                    <span>{files.length} file(s)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => v ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create New Request</DialogTitle>
          <DialogDescription>
            Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        <Progress value={((currentStep + 1) / STEPS.length) * 100} className="h-2" />

        <div className="min-h-[300px] py-4">
          {stepContent()}
        </div>

        <DialogFooter className="flex-row justify-between">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={prevStep} disabled={isSubmitting}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSubmitting || isDraftSaving}
            >
              {isDraftSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Save Draft"
              )}
            </Button>
            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={nextStep} disabled={isSubmitting}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
