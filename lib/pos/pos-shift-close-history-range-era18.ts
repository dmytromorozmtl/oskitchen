/** Bounded date-range presets for closed shift history and CSV export. */

export const SHIFT_CLOSE_HISTORY_RANGE_PRESETS = ["7d", "30d", "90d"] as const;

export type ShiftCloseHistoryRangePreset = (typeof SHIFT_CLOSE_HISTORY_RANGE_PRESETS)[number];

export const DEFAULT_SHIFT_CLOSE_HISTORY_RANGE: ShiftCloseHistoryRangePreset = "7d";

export const SHIFT_CLOSE_HISTORY_RANGE_MAX_DAYS = 90;

/** Max rows returned when a date range is active (history table + CSV). */
export const SHIFT_CLOSE_HISTORY_FILTERED_LIMIT = 50;

export const SHIFT_CLOSE_HISTORY_RANGE_LABEL: Record<ShiftCloseHistoryRangePreset, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

export type ShiftCloseHistoryRangeBounds = {
  closedAfter: Date;
  closedBefore: Date;
};

export function parseShiftCloseHistoryRangeParam(
  raw: string | null | undefined,
): ShiftCloseHistoryRangePreset {
  if (raw === "30d" || raw === "90d") return raw;
  return DEFAULT_SHIFT_CLOSE_HISTORY_RANGE;
}

export function shiftCloseHistoryRangeDays(preset: ShiftCloseHistoryRangePreset): number {
  switch (preset) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return SHIFT_CLOSE_HISTORY_RANGE_MAX_DAYS;
  }
}

export function resolveShiftCloseHistoryRangeBounds(
  preset: ShiftCloseHistoryRangePreset,
  now = new Date(),
): ShiftCloseHistoryRangeBounds {
  const closedBefore = new Date(now);
  const closedAfter = new Date(now);
  closedAfter.setUTCDate(closedAfter.getUTCDate() - shiftCloseHistoryRangeDays(preset));
  closedAfter.setUTCHours(0, 0, 0, 0);
  return { closedAfter, closedBefore };
}

export function buildShiftCloseHistoryExportHref(
  preset: ShiftCloseHistoryRangePreset,
): string {
  return `/api/pos/shifts/export?range=${preset}`;
}
