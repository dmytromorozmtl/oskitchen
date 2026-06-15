import type { ProductionWorkStatus } from "@prisma/client";

export const PRODUCTION_WORK_STATUS_LABEL: Record<ProductionWorkStatus, string> = {
  TO_PREP: "To prep",
  IN_PROGRESS: "In progress",
  READY: "Ready",
  HANDOFF: "Station handoff",
  HOLD: "Hold",
  PACK_HANDOFF: "Pack handoff",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

/** Board column order for Kanban-style views. */
export const BOARD_STATUS_ORDER: readonly ProductionWorkStatus[] = [
  "TO_PREP",
  "IN_PROGRESS",
  "READY",
  "HANDOFF",
  "HOLD",
  "PACK_HANDOFF",
  "DONE",
];

export function isWorkLate(dueAt: Date | null, status: ProductionWorkStatus): boolean {
  if (!dueAt || status === "DONE" || status === "CANCELLED") return false;
  return dueAt.getTime() < Date.now();
}
