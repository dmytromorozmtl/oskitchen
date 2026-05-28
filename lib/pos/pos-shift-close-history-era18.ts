import {
  classifyShiftVariance,
  formatShiftCloseoutMoney,
  formatShiftVarianceDisplay,
  shiftVarianceBadgeClassName,
  shiftVarianceLabel,
} from "@/lib/pos/pos-shift-closeout-preview";
import type { ClosedShiftSummary } from "@/services/pos/pos-shift-service";

export function formatShiftClosedAt(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function summarizeClosedShiftHistory(shifts: readonly ClosedShiftSummary[]): {
  total: number;
  withVariance: number;
} {
  let withVariance = 0;
  for (const shift of shifts) {
    if (classifyShiftVariance(shift.variance) !== "balanced") {
      withVariance += 1;
    }
  }
  return { total: shifts.length, withVariance };
}

export { formatShiftVarianceDisplay, shiftVarianceBadgeClassName, shiftVarianceLabel, formatShiftCloseoutMoney };
