"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border border-dashed py-16 px-4 text-center overflow-hidden",
        className
      )}
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 mesh-gradient opacity-30" />

      {/* Floating orb */}
      <div className="absolute left-1/2 top-1/3 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[60px] animate-float-slow" />

      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-muted to-muted/50 shadow-sm">
        <Icon className="h-8 w-8 text-muted-foreground/60" />
      </div>
      <h3 className="relative mt-5 text-lg font-semibold">{title}</h3>
      <p className="relative mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">{description}</p>
      {action && onAction && (
        <Button onClick={onAction} className="relative mt-6">
          {action}
        </Button>
      )}
    </div>
  );
}
