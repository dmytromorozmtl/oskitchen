"use client";

import { CheckCircle2, Circle, CircleDot, Lock } from "lucide-react";

import {
  buildPosShiftCloseChecklist,
  posShiftCloseChecklistStepClassName,
  summarizePosShiftCloseChecklist,
  type PosShiftCloseChecklistStepStatus,
} from "@/lib/pos/pos-shift-close-clarity-era19";
import type { ShiftCloseoutLivePreview } from "@/lib/pos/pos-shift-closeout-preview";

type PosShiftCloseChecklistProps = {
  hasOpenShift: boolean;
  preview: ShiftCloseoutLivePreview | null;
  varianceAcknowledged: boolean;
  notes: string;
};

function StepIcon({ status }: { status: PosShiftCloseChecklistStepStatus }) {
  if (status === "complete") {
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" aria-hidden />;
  }
  if (status === "active") {
    return <CircleDot className="h-4 w-4 shrink-0 text-primary" aria-hidden />;
  }
  if (status === "blocked") {
    return <Lock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />;
  }
  return <Circle className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />;
}

export function PosShiftCloseChecklist(props: PosShiftCloseChecklistProps) {
  const steps = buildPosShiftCloseChecklist(props);
  const summary = summarizePosShiftCloseChecklist(steps);

  return (
    <div
      className="rounded-xl border border-border/80 bg-muted/20 p-3 sm:p-4"
      data-testid="pos-shift-close-checklist"
      aria-label="Shift closeout checklist"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">Closeout checklist</p>
        <p className="text-xs text-muted-foreground">
          {summary.completedCount}/{steps.length} complete
          {summary.readyToClose ? " · ready to close" : null}
        </p>
      </div>
      <ol className="space-y-2">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={`flex items-start gap-3 rounded-lg border px-3 py-2 ${posShiftCloseChecklistStepClassName(step.status)}`}
            data-testid={`pos-shift-close-step-${step.id}`}
            data-step-status={step.status}
            aria-current={step.status === "active" ? "step" : undefined}
          >
            <span className="mt-0.5 flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground tabular-nums">
                {index + 1}
              </span>
              <StepIcon status={step.status} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug">{step.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
