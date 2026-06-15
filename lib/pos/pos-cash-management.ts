import { formatShiftCloseoutMoney } from "@/lib/pos/pos-shift-closeout-preview";
import type { ClosedShiftSummary } from "@/services/pos/pos-shift-service";

export const POS_CASH_MANAGEMENT_ROUTE = "/dashboard/pos/cash";

export const POS_CASH_MANAGEMENT_STEPS = ["open", "count", "close", "report"] as const;
export type PosCashManagementStep = (typeof POS_CASH_MANAGEMENT_STEPS)[number];

export function isPosCashManagementStep(value: string | null | undefined): value is PosCashManagementStep {
  return POS_CASH_MANAGEMENT_STEPS.includes(value as PosCashManagementStep);
}

export type CashDrawerCountRecord = {
  id: string;
  shiftId: string;
  registerName: string;
  countedAtIso: string;
  countedCash: number;
  expectedCash: number;
  variance: number;
  staffName: string | null;
  notes: string | null;
};

export function buildCashCloseReport(shift: ClosedShiftSummary): string {
  const opened = shift.openedAtIso.slice(0, 16).replace("T", " ");
  const closed = shift.closedAtIso.slice(0, 16).replace("T", " ");
  const varianceLabel =
    Math.abs(shift.variance) < 0.005
      ? "Balanced"
      : `${shift.variance >= 0 ? "+" : ""}${formatShiftCloseoutMoney(shift.variance)}`;

  return [
    "OS Kitchen — Cash close report",
    `Register: ${shift.registerName}`,
    `Shift: ${shift.shiftId}`,
    `Opened: ${opened}`,
    `Closed: ${closed}`,
    shift.closedByName ? `Closed by: ${shift.closedByName}` : null,
    "",
    `Opening float: ${formatShiftCloseoutMoney(shift.openingCash)}`,
    `Expected cash: ${formatShiftCloseoutMoney(shift.expectedCash)}`,
    `Counted cash: ${formatShiftCloseoutMoney(shift.closingCash)}`,
    `Variance: ${varianceLabel}`,
    shift.notes ? `Notes: ${shift.notes}` : null,
  ]
    .filter((line): line is string => line != null)
    .join("\n");
}
