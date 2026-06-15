import {
  classifyShiftVariance,
  shiftVarianceLabel,
} from "@/lib/pos/pos-shift-closeout-preview";
import type { ClosedShiftSummary } from "@/services/pos/pos-shift-service";

export const CLOSED_SHIFT_CSV_EXPORT_LIMIT = 50;

export const CLOSED_SHIFT_CSV_HEADERS = [
  "shiftId",
  "registerName",
  "openedAt",
  "closedAt",
  "openingCash",
  "expectedCash",
  "closingCash",
  "variance",
  "varianceStatus",
  "closedByName",
  "notes",
] as const;

function csvEscape(cell: string | number | null | undefined): string {
  const value = cell == null ? "" : String(cell);
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function serializeClosedShiftSummariesToCsv(
  shifts: readonly ClosedShiftSummary[],
): string {
  const lines = [
    CLOSED_SHIFT_CSV_HEADERS.join(","),
    ...shifts.map((shift) => {
      const tone = classifyShiftVariance(shift.variance);
      return [
        shift.shiftId,
        shift.registerName,
        shift.openedAtIso,
        shift.closedAtIso,
        shift.openingCash.toFixed(2),
        shift.expectedCash.toFixed(2),
        shift.closingCash.toFixed(2),
        shift.variance.toFixed(2),
        shiftVarianceLabel(tone),
        shift.closedByName,
        shift.notes,
      ]
        .map(csvEscape)
        .join(",");
    }),
  ];
  return `${lines.join("\n")}\n`;
}

export function closedShiftCsvFilename(generatedAt = new Date()): string {
  const stamp = generatedAt.toISOString().slice(0, 10);
  return `kitchenos-pos-shift-closeouts-${stamp}.csv`;
}
