import type { FoodOpsPhaseId } from "./workflow-types";

export type WorkflowSideEffectHint = "AUDIT" | "NOTIFICATION" | "ANALYTICS" | "TASK";

export function sideEffectsForTransition(
  _from: FoodOpsPhaseId,
  to: FoodOpsPhaseId,
): readonly WorkflowSideEffectHint[] {
  const base: WorkflowSideEffectHint[] = ["AUDIT"];
  if (to === "COMPLETED" || to === "CANCELLED") return [...base, "ANALYTICS"];
  if (to === "READY_FOR_PACKING" || to === "PACKING") return [...base, "NOTIFICATION", "TASK"];
  return base;
}

export function describeTransitionForOperators(from: FoodOpsPhaseId, to: FoodOpsPhaseId): string {
  if (to === "CANCELLED") return "Cancel order — irreversible for fulfillment.";
  if (from === to) return "No phase change.";
  return `Advance kitchen pipeline: ${from.replace(/_/g, " ").toLowerCase()} → ${to.replace(/_/g, " ").toLowerCase()}.`;
}
