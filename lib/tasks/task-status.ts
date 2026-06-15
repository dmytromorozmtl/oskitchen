import type { KitchenTaskStatus, KitchenTaskPriority } from "@prisma/client";

/**
 * Status ordering used by Kanban + filters. `OVERDUE` is **derived**, never
 * stored — keeps existing queries (`status notIn DONE/CANCELLED`) working.
 */
export const TASK_STATUS_VALUES = [
  "OPEN",
  "TODO",
  "IN_PROGRESS",
  "BLOCKED",
  "WAITING",
  "DONE",
  "CANCELLED",
] as const satisfies readonly KitchenTaskStatus[];

export type DerivedTaskStatus = KitchenTaskStatus | "OVERDUE";

export const TASK_STATUS_LABEL: Record<DerivedTaskStatus, string> = {
  OPEN: "Open",
  TODO: "To do",
  IN_PROGRESS: "In progress",
  BLOCKED: "Blocked",
  WAITING: "Waiting",
  DONE: "Done",
  CANCELLED: "Cancelled",
  OVERDUE: "Overdue",
};

export const KANBAN_LANES: { id: KitchenTaskStatus; label: string }[] = [
  { id: "OPEN", label: "To do" },
  { id: "IN_PROGRESS", label: "In progress" },
  { id: "BLOCKED", label: "Blocked" },
  { id: "WAITING", label: "Waiting" },
  { id: "DONE", label: "Done" },
];

const FORWARD: Record<KitchenTaskStatus, KitchenTaskStatus[]> = {
  OPEN: ["IN_PROGRESS", "BLOCKED", "WAITING", "DONE", "CANCELLED", "TODO"],
  TODO: ["IN_PROGRESS", "BLOCKED", "WAITING", "DONE", "CANCELLED", "OPEN"],
  IN_PROGRESS: ["BLOCKED", "WAITING", "DONE", "CANCELLED", "OPEN"],
  BLOCKED: ["OPEN", "IN_PROGRESS", "WAITING", "CANCELLED", "DONE"],
  WAITING: ["OPEN", "IN_PROGRESS", "BLOCKED", "CANCELLED", "DONE"],
  DONE: ["OPEN", "IN_PROGRESS"], // reopen
  CANCELLED: ["OPEN"], // re-activate
};

export function canTransitionStatus(from: KitchenTaskStatus, to: KitchenTaskStatus): boolean {
  if (from === to) return true;
  return FORWARD[from].includes(to);
}

/**
 * Compute a derived status that may include OVERDUE. Stored status is unchanged.
 */
export function effectiveStatus(
  status: KitchenTaskStatus,
  dueAt: Date | null | undefined,
  now: Date = new Date(),
): DerivedTaskStatus {
  if (status === "DONE" || status === "CANCELLED") return status;
  if (dueAt && dueAt.getTime() < now.getTime()) return "OVERDUE";
  return status;
}

/** Priority sort weight — lower = more important first. */
export function priorityWeight(p: KitchenTaskPriority): number {
  switch (p) {
    case "CRITICAL": return 0;
    case "URGENT":   return 1;
    case "HIGH":     return 2;
    case "NORMAL":
    case "MEDIUM":   return 3;
    case "LOW":      return 4;
  }
}
