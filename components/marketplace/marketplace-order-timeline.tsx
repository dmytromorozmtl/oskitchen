import { CheckCircle2, Circle, CircleDot } from "lucide-react";

import type { MarketplaceOrderTimelineStep } from "@/lib/marketplace/order-status";
import { cn } from "@/lib/utils";

export function MarketplaceOrderTimeline({
  steps,
}: {
  steps: MarketplaceOrderTimelineStep[];
}) {
  return (
    <ol className="space-y-4">
      {steps.map((step) => {
        const Icon =
          step.state === "complete"
            ? CheckCircle2
            : step.state === "current"
              ? CircleDot
              : Circle;

        return (
          <li key={step.key} className="flex gap-3">
            <Icon
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                step.state === "complete" && "text-emerald-600",
                step.state === "current" && "text-primary",
                step.state === "upcoming" && "text-muted-foreground",
                step.state === "skipped" && "text-muted-foreground",
              )}
            />
            <div className="min-w-0">
              <p
                className={cn(
                  "text-sm font-medium",
                  step.state === "upcoming" && "text-muted-foreground",
                )}
              >
                {step.label}
              </p>
              {step.at ? (
                <p className="text-xs text-muted-foreground">
                  {new Date(step.at).toLocaleString()}
                </p>
              ) : null}
              {step.detail ? (
                <p className="text-xs text-muted-foreground">{step.detail}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
