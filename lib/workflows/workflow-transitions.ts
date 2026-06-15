import type { FoodOpsPhaseId } from "./workflow-types";

/** Directed edges: allowed automatic progression in ideal conditions (guards still apply). */
const NORMAL_FLOW: readonly FoodOpsPhaseId[] = [
  "ORDER_CREATED",
  "ORDER_CONFIRMED",
  "PRODUCTION_PLANNED",
  "IN_PRODUCTION",
  "READY_FOR_PACKING",
  "PACKING",
  "PACKED",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
] as const;

const INDEX = new Map<FoodOpsPhaseId, number>();
for (let i = 0; i < NORMAL_FLOW.length; i++) {
  INDEX.set(NORMAL_FLOW[i], i);
}

export function isTerminalPhase(phase: FoodOpsPhaseId): boolean {
  return phase === "COMPLETED" || phase === "CANCELLED";
}

/** Next phase along the happy path, or null if at end / terminal. */
export function nextHappyPathPhase(current: FoodOpsPhaseId): FoodOpsPhaseId | null {
  if (isTerminalPhase(current)) return null;
  const i = INDEX.get(current);
  if (i === undefined) return "ORDER_CONFIRMED";
  const next = NORMAL_FLOW[i + 1];
  return next ?? null;
}

/** Allowed targets from a given phase (includes skip-ahead for admin repair — guarded elsewhere). */
export function allowedTargetPhases(from: FoodOpsPhaseId): readonly FoodOpsPhaseId[] {
  if (from === "CANCELLED" || from === "COMPLETED") return [];
  const out = new Set<FoodOpsPhaseId>(["CANCELLED"]);
  const i = INDEX.get(from);
  if (i !== undefined) {
    for (let j = i + 1; j < NORMAL_FLOW.length; j++) {
      out.add(NORMAL_FLOW[j]);
    }
  }
  return [...out];
}
