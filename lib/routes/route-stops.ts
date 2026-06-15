import type { DeliveryStopStatus } from "@prisma/client";

import { isTerminalStopStatus } from "@/lib/routes/route-status";

export type StopForReorder = { id: string; sequence: number };

/** Generate the updated sequence assignments after a manual move (drag/reorder). */
export function applyReorder(
  current: readonly StopForReorder[],
  fromId: string,
  toIndex: number,
): { id: string; sequence: number }[] {
  const ordered = current.slice().sort((a, b) => a.sequence - b.sequence);
  const fromIndex = ordered.findIndex((s) => s.id === fromId);
  if (fromIndex < 0) return ordered.map((s, i) => ({ id: s.id, sequence: i }));
  const safeTo = Math.max(0, Math.min(toIndex, ordered.length - 1));
  const [moved] = ordered.splice(fromIndex, 1);
  ordered.splice(safeTo, 0, moved);
  return ordered.map((s, i) => ({ id: s.id, sequence: i }));
}

/**
 * Guard for the next allowed status transition. Used by server actions to
 * reject nonsense state changes (e.g. DELIVERED -> PENDING).
 */
export function canTransitionStop(from: DeliveryStopStatus, to: DeliveryStopStatus): boolean {
  if (from === to) return true;
  if (isTerminalStopStatus(from) && to !== "RETURNED") return false;

  const FORWARD: Record<DeliveryStopStatus, DeliveryStopStatus[]> = {
    PENDING: ["PACKED", "READY", "LOADED", "FAILED", "SKIPPED"],
    PACKED: ["READY", "LOADED", "OUT_FOR_DELIVERY", "FAILED", "SKIPPED"],
    READY: ["LOADED", "OUT_FOR_DELIVERY", "FAILED", "SKIPPED"],
    LOADED: ["OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "RETURNED"],
    OUT_FOR_DELIVERY: ["DELIVERED", "FAILED", "RETURNED"],
    DELIVERED: ["RETURNED"],
    FAILED: ["RETURNED"],
    SKIPPED: [],
    RETURNED: [],
  };
  return FORWARD[from].includes(to);
}
