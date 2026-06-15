export const DAY_LABEL: Record<number, string> = {
  0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat",
};

export const DAY_LONG: Record<number, string> = {
  0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday",
  4: "Thursday", 5: "Friday", 6: "Saturday",
};

export type AvailabilityWindow = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  available: boolean;
};

const TIME_RE = /^(\d{1,2}):(\d{2})$/;

function parseTime(s: string): number {
  const m = TIME_RE.exec(s);
  if (!m) return 0;
  const h = Number(m[1] ?? "0");
  const min = Number(m[2] ?? "0");
  return h * 60 + min;
}

export function normalizeTime(s: string): string {
  const m = TIME_RE.exec(s.trim());
  if (!m) return "00:00";
  const h = Math.max(0, Math.min(23, Number(m[1] ?? "0")));
  const min = Math.max(0, Math.min(59, Number(m[2] ?? "0")));
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}

export function isWindowValid(w: AvailabilityWindow): boolean {
  if (w.dayOfWeek < 0 || w.dayOfWeek > 6) return false;
  if (!TIME_RE.test(w.startTime) || !TIME_RE.test(w.endTime)) return false;
  return parseTime(w.endTime) > parseTime(w.startTime);
}

export function isAvailableNow(
  windows: AvailabilityWindow[],
  now: Date = new Date(),
): boolean {
  const day = now.getUTCDay();
  const minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  return windows.some(
    (w) =>
      w.available &&
      w.dayOfWeek === day &&
      parseTime(w.startTime) <= minutes &&
      parseTime(w.endTime) > minutes,
  );
}

export function summarizeAvailability(windows: AvailabilityWindow[]): string {
  if (windows.length === 0) return "No availability set";
  const grouped = new Map<number, AvailabilityWindow[]>();
  for (const w of windows.filter((w) => w.available)) {
    const arr = grouped.get(w.dayOfWeek) ?? [];
    arr.push(w);
    grouped.set(w.dayOfWeek, arr);
  }
  if (grouped.size === 0) return "Unavailable all week";
  const parts: string[] = [];
  for (let d = 0; d < 7; d += 1) {
    const ws = grouped.get(d);
    if (!ws) continue;
    parts.push(
      `${DAY_LABEL[d]} ${ws.map((w) => `${w.startTime}–${w.endTime}`).join(", ")}`,
    );
  }
  return parts.join(" · ");
}
