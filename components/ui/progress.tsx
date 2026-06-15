import * as React from "react";

import { cn } from "@/lib/utils";

export type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value: number;
  /** 0-100. Defaults to 100. */
  max?: number;
};

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, ...props }, ref) => {
    const clamped = Math.max(0, Math.min(max, Number.isFinite(value) ? value : 0));
    const pct = max === 0 ? 0 : (clamped / max) * 100;
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={clamped}
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
        {...props}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  },
);
Progress.displayName = "Progress";
