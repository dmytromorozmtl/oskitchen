/**
 * Location hours are stored as JSON to keep the migration footprint minimal.
 * We never assume the shape on read — `parseWeeklyHours` is forgiving.
 *
 * Shape:
 *   { mon: { open: "08:00", close: "20:00", closed?: boolean }, tue: …, … }
 *
 * Closures live in a separate `closures_json` field as an array of
 *   { date: "2026-12-25", reason?: string }
 */

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const DAY_KEYS: readonly DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const DAY_LABEL: Record<DayKey, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export type DailyWindow = {
  open: string;
  close: string;
  closed?: boolean;
};

export type WeeklyHours = Partial<Record<DayKey, DailyWindow>>;

export type Closure = {
  date: string;
  reason?: string | null;
};

function isTimeString(v: unknown): v is string {
  return typeof v === "string" && /^\d{1,2}:\d{2}$/.test(v);
}

export function parseWeeklyHours(value: unknown): WeeklyHours {
  if (!value || typeof value !== "object") return {};
  const out: WeeklyHours = {};
  for (const day of DAY_KEYS) {
    const raw = (value as Record<string, unknown>)[day];
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    if (!isTimeString(r.open) || !isTimeString(r.close)) continue;
    out[day] = { open: r.open, close: r.close, closed: Boolean(r.closed) };
  }
  return out;
}

export function parseClosures(value: unknown): Closure[] {
  if (!Array.isArray(value)) return [];
  const out: Closure[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    if (typeof r.date !== "string") continue;
    out.push({ date: r.date, reason: typeof r.reason === "string" ? r.reason : null });
  }
  return out;
}

/** Build a fresh empty weekly hours scaffold so the UI can render uniformly. */
export function emptyWeeklyHours(): WeeklyHours {
  return Object.fromEntries(DAY_KEYS.map((d) => [d, { open: "", close: "", closed: false }])) as WeeklyHours;
}

/** Defensive coercion when serialising the editor form back into JSON. */
export function normalizeWeeklyHoursInput(input: Record<string, { open?: string; close?: string; closed?: boolean | "on" }>): WeeklyHours {
  const out: WeeklyHours = {};
  for (const day of DAY_KEYS) {
    const r = input[day];
    if (!r) continue;
    const open = (r.open ?? "").trim();
    const close = (r.close ?? "").trim();
    if (!open || !close) continue;
    out[day] = { open, close, closed: r.closed === true || r.closed === "on" };
  }
  return out;
}

/**
 * Lightweight check that does not depend on timezone — assumes the supplied
 * Date is already "now in the location's timezone".
 */
export function isOpenAt(hours: WeeklyHours, localNow: Date): boolean {
  const dayIndex = localNow.getDay(); // 0=Sun
  const map: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const day = hours[map[dayIndex]];
  if (!day || day.closed) return false;
  const nowMinutes = localNow.getHours() * 60 + localNow.getMinutes();
  const [oh, om] = day.open.split(":").map(Number);
  const [ch, cm] = day.close.split(":").map(Number);
  const openMins = oh * 60 + om;
  const closeMins = ch * 60 + cm;
  if (closeMins <= openMins) return nowMinutes >= openMins || nowMinutes < closeMins; // overnight wrap
  return nowMinutes >= openMins && nowMinutes < closeMins;
}
