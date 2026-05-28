import { CheckCircle2, Circle, CircleDot, ClipboardList, Lock } from "lucide-react";

import {
  buildProductionCalendarDrillChecklist,
  productionCalendarDrillChecklistStepClassName,
  summarizeProductionCalendarDrillChecklist,
  type ProductionCalendarDrillChecklistStepStatus,
} from "@/lib/production/production-calendar-drill-clarity-era19";
import type { ProductionCalendarFocusSummary } from "@/lib/production/production-calendar-today-focus-era18";

function StepIcon({ status }: { status: ProductionCalendarDrillChecklistStepStatus }) {
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

export function ProductionCalendarDrillChecklist(props: {
  summary: ProductionCalendarFocusSummary;
  hasPlanTasks: boolean;
}) {
  const steps = buildProductionCalendarDrillChecklist(props);
  const checklistSummary = summarizeProductionCalendarDrillChecklist(steps);

  return (
    <div
      id="production-calendar-drill"
      className="scroll-mt-28 rounded-xl border border-border/80 bg-muted/20 p-3 sm:p-4 lg:scroll-mt-24"
      data-testid="production-calendar-drill-checklist"
      aria-label="Production calendar operator drill checklist"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          <ClipboardList className="h-4 w-4 text-muted-foreground" aria-hidden />
          Operator drill
        </p>
        <p className="text-xs text-muted-foreground">
          {checklistSummary.completedCount}/{steps.length} complete
          {checklistSummary.drillComplete ? " · shift drill clear" : null}
        </p>
      </div>
      <ol className="space-y-2">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={`flex items-start gap-3 rounded-lg border px-3 py-2 ${productionCalendarDrillChecklistStepClassName(step.status)}`}
            data-testid={`production-calendar-drill-step-${step.id}`}
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
