"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FoodopsUiStatus, FoodopsWorkflowStepView } from "@/services/workflows/foodops-workflow-service";

const STATUS_LABEL: Record<FoodopsUiStatus, string> = {
  complete: "Complete",
  current: "Current",
  blocked: "Blocked",
  not_required: "Not required",
  pending: "Pending",
};

const STATUS_BADGE: Record<FoodopsUiStatus, "default" | "secondary" | "destructive" | "outline"> = {
  complete: "secondary",
  current: "default",
  blocked: "destructive",
  not_required: "outline",
  pending: "outline",
};

function statusAria(step: FoodopsWorkflowStepView): string {
  return `${step.label}: ${STATUS_LABEL[step.status]}. ${step.explanation}`;
}

export function FoodopsWorkflowStepper({
  steps,
  compact,
  canOpenFixRoutes,
}: {
  steps: FoodopsWorkflowStepView[];
  compact?: boolean;
  /** When false, hide primary fix links (e.g. read-only preview). */
  canOpenFixRoutes?: boolean;
}) {
  const [openDetails, setOpenDetails] = useState(!compact);
  const safeSteps = useMemo(() => (Array.isArray(steps) ? steps : []), [steps]);
  const allowLinks = canOpenFixRoutes !== false;

  if (safeSteps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        FoodOps workflow summary is not available for this order yet.
      </p>
    );
  }

  return (
    <ol className={cn("space-y-2", compact && "space-y-1")} aria-label="FoodOps workflow steps">
      {safeSteps.map((step, idx) => (
        <li
          key={step.id}
          className={cn(
            "rounded-xl border border-border/70 bg-card/60 px-3 py-2",
            step.status === "current" && "border-primary/40 bg-primary/[0.04]",
            step.status === "blocked" && "border-destructive/35 bg-destructive/[0.04]",
            compact && "py-1.5",
          )}
          aria-label={statusAria(step)}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground tabular-nums" aria-hidden>
                  {idx + 1}.
                </span>
                <span className={cn("font-medium", compact ? "text-sm" : "text-base")}>{step.label}</span>
                <Badge variant={STATUS_BADGE[step.status]} className="rounded-full text-[10px] font-normal">
                  {STATUS_LABEL[step.status]}
                </Badge>
                {step.countLabel ? (
                  <span className="text-xs text-muted-foreground tabular-nums">{step.countLabel}</span>
                ) : null}
              </div>
              {!compact || openDetails ? (
                <p className="text-sm text-muted-foreground">{step.explanation}</p>
              ) : null}
              {!compact || openDetails ? (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">Source of truth:</span> {step.sourceOfTruth}
                </p>
              ) : null}
            </div>
            {allowLinks && step.fixHref && (step.status === "blocked" || step.status === "current") ? (
              <Button
                asChild
                size="sm"
                variant={step.status === "blocked" ? "default" : "outline"}
                className="shrink-0 rounded-full"
              >
                <Link href={step.fixHref}>{step.fixLabel ?? "Open"}</Link>
              </Button>
            ) : null}
          </div>
        </li>
      ))}
      {compact ? (
        <li className="list-none">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto gap-1 px-0 text-xs text-muted-foreground"
            onClick={() => setOpenDetails((v) => !v)}
            aria-expanded={openDetails}
          >
            {openDetails ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
            {openDetails ? "Hide technical details" : "Show explanations"}
          </Button>
        </li>
      ) : null}
    </ol>
  );
}
