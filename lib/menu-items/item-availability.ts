/**
 * JSON shapes for item- and menu-level availability (aligned with Menu.availabilityJson).
 * Keep permissive until a strict Zod schema is shared with Menu Center.
 */

export type DayOfWeekCode =
  | "MON"
  | "TUE"
  | "WED"
  | "THU"
  | "FRI"
  | "SAT"
  | "SUN";

export type TimeWindow = {
  startLocal: string;
  endLocal: string;
};

export type WeeklyWindow = {
  days: DayOfWeekCode[];
  windows: TimeWindow[];
  label?: string;
};

export type ItemAvailabilityJson = {
  weekly?: WeeklyWindow[];
  /** ISO date ranges for events, catering, or seasonal menus */
  dateRanges?: { start: string; end: string; label?: string }[];
  /** Human-readable notes for staff */
  notes?: string;
};

export function emptyItemAvailability(): ItemAvailabilityJson {
  return {};
}
