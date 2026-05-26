import { format, parseISO, startOfDay } from "date-fns";

/** Calendar day anchor for packing batch / wave queries (matches production page pattern). */
export function packingDayFromYyyyMmDd(
  raw: string | null | undefined,
  fallback: Date = startOfDay(new Date()),
): Date {
  if (!raw?.trim()) return fallback;
  const s = raw.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return fallback;
  try {
    return startOfDay(parseISO(s));
  } catch {
    return fallback;
  }
}

/** Strict parse for server actions — returns `null` when missing or invalid. */
export function parsePackingDayOrNull(raw: string | null | undefined): Date | null {
  if (!raw?.trim()) return null;
  const s = raw.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  try {
    return startOfDay(parseISO(s));
  } catch {
    return null;
  }
}

export function formatYyyyMmDdForInput(d: Date): string {
  return format(d, "yyyy-MM-dd");
}
