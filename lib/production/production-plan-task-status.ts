/**
 * Production plan task statuses for the planning calendar (not kitchen work items).
 */

export const PRODUCTION_PLAN_TASK_STATUSES = [
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
] as const;

export type ProductionPlanTaskStatus = (typeof PRODUCTION_PLAN_TASK_STATUSES)[number];

export const PRODUCTION_PLAN_TASK_STATUS_LABEL: Record<ProductionPlanTaskStatus, string> = {
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

export function isProductionPlanTaskStatus(value: string): value is ProductionPlanTaskStatus {
  return (PRODUCTION_PLAN_TASK_STATUSES as readonly string[]).includes(value);
}

export function parseProductionPlanTaskStatus(
  raw: string,
): ProductionPlanTaskStatus | null {
  const normalized = raw.trim().toUpperCase();
  return isProductionPlanTaskStatus(normalized) ? normalized : null;
}

/** Coerce unknown DB values to a safe display/update baseline. */
export function normalizeProductionPlanTaskStatus(raw: string): ProductionPlanTaskStatus {
  return parseProductionPlanTaskStatus(raw) ?? "SCHEDULED";
}

export function productionPlanTaskStatusCardClass(status: string): string {
  const normalized = normalizeProductionPlanTaskStatus(status);
  if (normalized === "COMPLETED") return "bg-muted";
  if (normalized === "IN_PROGRESS") return "bg-amber-100 dark:bg-amber-950";
  return "bg-primary/10";
}
