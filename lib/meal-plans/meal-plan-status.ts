import type { MealPlanCycleStatus, MealPlanStatus } from "@prisma/client";

export const MEAL_PLAN_STATUS_VALUES = [
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "CANCELLED",
  "EXPIRED",
  "NEEDS_REVIEW",
  "COMPLETED",
] as const satisfies readonly MealPlanStatus[];

export const MEAL_PLAN_STATUS_LABEL: Record<MealPlanStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  PAUSED: "Paused",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
  NEEDS_REVIEW: "Needs review",
  COMPLETED: "Completed",
};

export const MEAL_PLAN_STATUS_BADGE: Record<MealPlanStatus, "default" | "secondary" | "outline" | "destructive"> = {
  DRAFT: "outline",
  ACTIVE: "default",
  PAUSED: "outline",
  CANCELLED: "destructive",
  EXPIRED: "outline",
  NEEDS_REVIEW: "outline",
  COMPLETED: "secondary",
};

export const MEAL_PLAN_CYCLE_STATUS_LABEL: Record<MealPlanCycleStatus, string> = {
  UPCOMING: "Upcoming",
  NEEDS_SELECTION: "Needs selection",
  READY_TO_GENERATE: "Ready to generate",
  GENERATED: "Generated",
  SKIPPED: "Skipped",
  PAUSED: "Paused",
  CANCELLED: "Cancelled",
};

export const MEAL_PLAN_CYCLE_STATUS_BADGE: Record<MealPlanCycleStatus, "default" | "secondary" | "outline" | "destructive"> = {
  UPCOMING: "outline",
  NEEDS_SELECTION: "secondary",
  READY_TO_GENERATE: "default",
  GENERATED: "secondary",
  SKIPPED: "outline",
  PAUSED: "outline",
  CANCELLED: "destructive",
};

/**
 * Pause / cancel / archive transitions. Operators can move freely between
 * non-terminal states, but cancelled/expired plans can only resume back to
 * NEEDS_REVIEW so the operator can update selections first.
 */
export function canTransitionMealPlan(from: MealPlanStatus, to: MealPlanStatus): boolean {
  if (from === to) return false;
  if (from === "ACTIVE") return to === "PAUSED" || to === "NEEDS_REVIEW" || to === "CANCELLED" || to === "EXPIRED" || to === "COMPLETED";
  if (from === "PAUSED") return to === "ACTIVE" || to === "CANCELLED" || to === "NEEDS_REVIEW";
  if (from === "NEEDS_REVIEW") return to === "ACTIVE" || to === "PAUSED" || to === "CANCELLED";
  if (from === "DRAFT") return to === "ACTIVE" || to === "NEEDS_REVIEW" || to === "CANCELLED";
  if (from === "COMPLETED" || from === "EXPIRED" || from === "CANCELLED") return to === "NEEDS_REVIEW";
  return false;
}

export const OPERATIONAL_PLAN_STATUSES: readonly MealPlanStatus[] = ["ACTIVE", "NEEDS_REVIEW"];
