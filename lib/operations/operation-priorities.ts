import type { OrderBlockerSeverity } from "@/lib/orders/order-lifecycle-types";

/** Higher number = more urgent for triage queues. */
export function priorityScoreFromSeverity(severity: OrderBlockerSeverity): number {
  switch (severity) {
    case "CRITICAL":
      return 100;
    case "HIGH":
      return 75;
    case "MEDIUM":
      return 50;
    case "LOW":
      return 25;
    default:
      return 0;
  }
}

export const OPERATIONAL_PRIORITY_LABELS = ["P0", "P1", "P2", "P3"] as const;
export type OperationalPriorityLabel = (typeof OPERATIONAL_PRIORITY_LABELS)[number];

export function priorityLabelFromScore(score: number): OperationalPriorityLabel {
  if (score >= 90) return "P0";
  if (score >= 70) return "P1";
  if (score >= 40) return "P2";
  return "P3";
}
