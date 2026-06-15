"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type OnboardingStepperStep = {
  id: string;
  label: string;
  optional?: boolean;
  recommended?: boolean;
};

export function OnboardingStepper({
  steps,
  currentStepIndex,
  onStepClick,
  launchProgressPercent,
  className,
}: {
  steps: readonly OnboardingStepperStep[];
  currentStepIndex: number;
  onStepClick?: (index: number) => void;
  /** Optional secondary metric (e.g. commercial launch checklist %). */
  launchProgressPercent?: number;
  className?: string;
}) {
  const total = steps.length;
  const safeIndex = total === 0 ? 0 : Math.min(Math.max(currentStepIndex, 0), total - 1);
  const progress = total === 0 ? 0 : ((safeIndex + 1) / total) * 100;

  return (
    <nav
      className={cn("space-y-2", className)}
      aria-label="Onboarding progress"
      data-testid="onboarding-stepper"
    >
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Step {safeIndex + 1} of {total}
        </span>
        <span>
          {Math.round(progress)}%
          {launchProgressPercent != null ? ` · Launch checklist ${launchProgressPercent}%` : null}
        </span>
      </div>

      <Progress value={progress} aria-label="Onboarding completion" />

      <div className="flex flex-wrap gap-1.5" role="list">
        {steps.map((step, index) => {
          const isCurrent = index === safeIndex;
          const isComplete = index < safeIndex;
          const isClickable = Boolean(onStepClick) && index <= safeIndex;

          return (
            <button
              key={step.id}
              type="button"
              role="listitem"
              disabled={!isClickable}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`${step.label}${step.optional ? " (optional)" : ""}${isComplete ? ", completed" : ""}`}
              onClick={() => isClickable && onStepClick?.(index)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                isCurrent
                  ? "bg-primary text-primary-foreground"
                  : isComplete
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground",
                isClickable && !isCurrent ? "hover:bg-primary/20" : null,
                !isClickable ? "cursor-default" : null,
              )}
            >
              {step.optional ? "○ " : null}
              {step.label}
              {step.recommended ? " ★" : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
