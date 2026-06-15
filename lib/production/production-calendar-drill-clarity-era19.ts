import {
  PRODUCTION_CALENDAR_DRILL_ANCHOR,
  PRODUCTION_CALENDAR_DRILL_CLARITY_ERA19_POLICY_ID,
  PRODUCTION_CALENDAR_DRILL_ROUTE,
} from "@/lib/production/production-calendar-drill-clarity-era19-policy";
import type { ProductionCalendarFocusSummary } from "@/lib/production/production-calendar-today-focus-era18";
import {
  isoDateOnly,
  weekStartMonday,
} from "@/lib/production/production-calendar-week-navigation";

export const PRODUCTION_CALENDAR_DRILL_CLARITY_AGGREGATOR_ERA19_POLICY_ID =
  "era19-production-calendar-drill-clarity-aggregator-v1" as const;

export type ProductionCalendarDrillChecklistStepId =
  | "review_today_focus"
  | "clear_overdue"
  | "mark_in_progress"
  | "mark_completed";

export type ProductionCalendarDrillChecklistStepStatus =
  | "pending"
  | "active"
  | "complete"
  | "blocked";

export type ProductionCalendarDrillChecklistStep = {
  id: ProductionCalendarDrillChecklistStepId;
  label: string;
  detail: string;
  status: ProductionCalendarDrillChecklistStepStatus;
};

export type ProductionCalendarDrillHeroTone = "urgent" | "success" | "neutral";

export function buildProductionCalendarDrillHref(today = new Date()): string {
  const weekStart = isoDateOnly(weekStartMonday(today));
  return `${PRODUCTION_CALENDAR_DRILL_ROUTE}?week=${weekStart}#${PRODUCTION_CALENDAR_DRILL_ANCHOR}`;
}

export function resolveProductionCalendarBriefingDrillHref(input: {
  overdue: number;
  calendarHref: string;
  taskHref?: string | null;
}): string {
  if (input.overdue > 0) {
    return buildProductionCalendarDrillHref();
  }
  return input.taskHref ?? input.calendarHref;
}

function openBatchCount(summary: ProductionCalendarFocusSummary): number {
  return summary.overdue + summary.dueToday;
}

export function buildProductionCalendarDrillChecklist(input: {
  summary: ProductionCalendarFocusSummary;
  hasPlanTasks: boolean;
}): ProductionCalendarDrillChecklistStep[] {
  const { summary, hasPlanTasks } = input;
  const overdueBlocked = summary.overdue > 0;

  const reviewDetail = !hasPlanTasks
    ? "Add a batch task below to start the operator drill."
    : `${summary.overdue} overdue · ${summary.dueToday} due today · ${summary.inProgress} in progress`;

  const clearOverdueDetail = summary.overdue > 0
    ? `Reschedule with ←/→ or mark IN_PROGRESS/COMPLETED on ${summary.overdue} overdue batch(es).`
    : "No overdue batches through today.";

  const inProgressDetail = overdueBlocked
    ? "Clear overdue batches before starting today's prep."
    : summary.inProgress > 0
      ? `${summary.inProgress} batch(es) in progress — keep status current on the calendar.`
      : summary.dueToday > 0
        ? `Mark a due-today batch IN_PROGRESS on the today column below.`
        : "No due-today batches — schedule prep on the calendar when needed.";

  const completedDetail = overdueBlocked
    ? "Overdue batches block drill completion."
    : summary.inProgress > 0
      ? "Mark in-progress batches COMPLETED when prep finishes."
      : openBatchCount(summary) === 0 && summary.completedToday > 0
        ? `${summary.completedToday} batch(es) completed today — drill clear for this shift.`
        : openBatchCount(summary) === 0
          ? "No open batches through today."
          : "Complete due-today batches with the status control on each task card.";

  return [
    {
      id: "review_today_focus",
      label: "Review today focus",
      detail: reviewDetail,
      status: !hasPlanTasks ? "blocked" : "complete",
    },
    {
      id: "clear_overdue",
      label: "Clear overdue batches",
      detail: clearOverdueDetail,
      status: !hasPlanTasks ? "blocked" : summary.overdue > 0 ? "active" : "complete",
    },
    {
      id: "mark_in_progress",
      label: "Mark batch in progress",
      detail: inProgressDetail,
      status: !hasPlanTasks
        ? "blocked"
        : overdueBlocked
          ? "blocked"
          : summary.inProgress > 0 || summary.dueToday === 0
            ? "complete"
            : "active",
    },
    {
      id: "mark_completed",
      label: "Complete today's batches",
      detail: completedDetail,
      status: !hasPlanTasks
        ? "blocked"
        : overdueBlocked
          ? "blocked"
          : summary.inProgress > 0
            ? "active"
            : openBatchCount(summary) === 0
              ? "complete"
              : "pending",
    },
  ];
}

export function buildProductionCalendarDrillHero(input: {
  summary: ProductionCalendarFocusSummary;
  hasPlanTasks: boolean;
}): {
  headline: string;
  subline: string;
  tone: ProductionCalendarDrillHeroTone;
} {
  if (!input.hasPlanTasks) {
    return {
      headline: "Production drill — add your first batch",
      subline: "Create a batch task below, then follow the 4-step operator drill.",
      tone: "neutral",
    };
  }

  if (input.summary.overdue > 0) {
    return {
      headline: `${input.summary.overdue} overdue batch${input.summary.overdue === 1 ? "" : "es"} need action`,
      subline: "Clear overdue work before today's prep can stay on schedule.",
      tone: "urgent",
    };
  }

  if (input.summary.inProgress > 0) {
    return {
      headline: `${input.summary.inProgress} batch${input.summary.inProgress === 1 ? "" : "es"} in progress`,
      subline: "Mark COMPLETED when prep finishes — status updates feed Today briefing.",
      tone: "neutral",
    };
  }

  if (input.summary.dueToday > 0) {
    return {
      headline: `${input.summary.dueToday} batch${input.summary.dueToday === 1 ? "" : "es"} due today`,
      subline: "Start with IN_PROGRESS on the today column, then complete when done.",
      tone: "neutral",
    };
  }

  if (input.summary.completedToday > 0) {
    return {
      headline: "Today's production drill complete",
      subline: `${input.summary.completedToday} batch${input.summary.completedToday === 1 ? "" : "es"} completed — plan tomorrow on the calendar grid.`,
      tone: "success",
    };
  }

  return {
    headline: "Production calendar ready",
    subline: "No overdue or due-today batches — schedule the next prep window below.",
    tone: "success",
  };
}

export function summarizeProductionCalendarDrillChecklist(
  steps: readonly ProductionCalendarDrillChecklistStep[],
): {
  completedCount: number;
  activeStepId: ProductionCalendarDrillChecklistStepId | null;
  drillComplete: boolean;
} {
  const completedCount = steps.filter((step) => step.status === "complete").length;
  const active = steps.find((step) => step.status === "active") ?? null;
  const drillComplete = steps.every(
    (step) => step.status === "complete" || step.status === "blocked",
  ) && steps.some((step) => step.status === "complete");

  return {
    completedCount,
    activeStepId: active?.id ?? null,
    drillComplete,
  };
}

export function productionCalendarDrillChecklistStepClassName(
  status: ProductionCalendarDrillChecklistStepStatus,
): string {
  switch (status) {
    case "complete":
      return "border-green-200/80 bg-green-50/60 dark:border-green-900/50 dark:bg-green-950/20";
    case "active":
      return "border-primary/40 bg-primary/5";
    case "blocked":
      return "border-border/60 bg-muted/20 opacity-80";
    default:
      return "border-border/70 bg-background/80";
  }
}

export function productionCalendarDrillPolicySnapshot(): {
  policyId: typeof PRODUCTION_CALENDAR_DRILL_CLARITY_ERA19_POLICY_ID;
  drillHref: ReturnType<typeof buildProductionCalendarDrillHref>;
} {
  return {
    policyId: PRODUCTION_CALENDAR_DRILL_CLARITY_ERA19_POLICY_ID,
    drillHref: buildProductionCalendarDrillHref(),
  };
}
