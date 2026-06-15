"use client";

import { Check } from "lucide-react";

import {
  inferTablesideFlowStep,
  isTablesideFlowStepComplete,
  TABLESIDE_FLOW_STEPS,
  type TablesideFlowState,
} from "@/lib/pos/tableside-ordering-flow-policy";
import { cn } from "@/lib/utils";

export function TablesideOrderingFlowStrip({ state }: { state: TablesideFlowState }) {
  const currentStepId = inferTablesideFlowStep(state);
  const currentIndex = TABLESIDE_FLOW_STEPS.findIndex((step) => step.id === currentStepId);

  return (
    <nav
      aria-label="Tableside ordering flow"
      className="rounded-2xl border border-border/70 bg-muted/30 p-3"
      data-testid="tableside-ordering-flow-strip"
    >
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        TouchBistro-parity flow
      </p>
      <ol className="flex flex-wrap gap-2">
        {TABLESIDE_FLOW_STEPS.map((step, index) => {
          const complete = isTablesideFlowStepComplete(step.id, currentStepId);
          const active = step.id === currentStepId;

          return (
            <li
              key={step.id}
              className={cn(
                "flex min-w-[88px] flex-1 flex-col rounded-xl border px-2 py-2 text-center",
                active
                  ? "border-primary bg-primary/5"
                  : complete
                    ? "border-border/60 bg-background"
                    : "border-border/40 bg-background/60 opacity-70",
              )}
              data-testid={`tableside-flow-step-${step.id}`}
              aria-current={active ? "step" : undefined}
            >
              <span className="mx-auto mb-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold">
                {complete ? (
                  <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" aria-hidden />
                ) : (
                  index + 1
                )}
              </span>
              <span className="text-[11px] font-medium leading-tight">{step.label}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs text-muted-foreground">
        Step {currentIndex + 1} of {TABLESIDE_FLOW_STEPS.length}:{" "}
        {TABLESIDE_FLOW_STEPS[currentIndex]?.description}
      </p>
    </nav>
  );
}
