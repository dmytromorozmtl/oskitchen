import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Groups related fields with consistent spacing and optional helper copy. */
export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn("space-y-4 rounded-xl border border-border/70 bg-card/40 p-4", className)}>
      <legend className="px-1 text-sm font-semibold text-foreground">{title}</legend>
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      <div className="space-y-3">{children}</div>
    </fieldset>
  );
}
