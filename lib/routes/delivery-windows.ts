/** Lightweight delivery window helpers. */

export function formatWindow(start: Date | null | undefined, end: Date | null | undefined): string | null {
  if (!start && !end) return null;
  const fmt = (d: Date) =>
    d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return `from ${fmt(start)}`;
  if (end) return `by ${fmt(end)}`;
  return null;
}

export function isWindowSoon(end: Date | null | undefined, withinMinutes = 60): boolean {
  if (!end) return false;
  const ms = end.getTime() - Date.now();
  return ms > 0 && ms <= withinMinutes * 60_000;
}
