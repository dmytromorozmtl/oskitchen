import type { HomebaseShiftRow } from "@/lib/integrations/homebase-types";
import type { HomebaseTimePunchRow } from "@/lib/integrations/homebase-live-types";

const API_BASE = process.env.HOMEBASE_API_BASE ?? "https://api.joinhomebase.com";

function headers(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

function readString(row: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function parseShiftRows(payload: unknown): HomebaseShiftRow[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const data = Array.isArray(root.shifts)
    ? root.shifts
    : Array.isArray(root.data)
      ? root.data
      : [];
  const rows: HomebaseShiftRow[] = [];

  for (const raw of data) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const id = readString(row, ["id", "uuid", "shift_id"]);
    const userId = readString(row, ["user_id", "employee_id", "user_uuid"]);
    const startAt = readString(row, [
      "scheduled_start_at",
      "start_at",
      "start_time",
      "starts_at",
    ]);
    const endAt = readString(row, ["scheduled_end_at", "end_at", "end_time", "ends_at"]);
    if (!id || !userId || !startAt || !endAt) continue;
    rows.push({
      id,
      userId,
      startAt,
      endAt,
      notes: readString(row, ["notes", "note"]),
    });
  }

  return rows;
}

function parseTimePunchRows(payload: unknown): HomebaseTimePunchRow[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const data = Array.isArray(root.timecards)
    ? root.timecards
    : Array.isArray(root.time_punches)
      ? root.time_punches
      : Array.isArray(root.data)
        ? root.data
        : [];

  const rows: HomebaseTimePunchRow[] = [];
  for (const raw of data) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const id = readString(row, ["id", "uuid", "timecard_id"]);
    const userId = readString(row, ["user_id", "employee_id", "user_uuid"]);
    const clockIn = readString(row, ["clock_in", "clock_in_at", "start_at", "started_at"]);
    if (!id || !userId || !clockIn) continue;
    rows.push({
      id,
      userId,
      clockIn,
      clockOut: readString(row, ["clock_out", "clock_out_at", "end_at", "ended_at"]),
    });
  }
  return rows;
}

export async function fetchHomebaseShiftsApi(input: {
  accessToken: string;
  locationId: string;
  start: Date;
  end: Date;
}): Promise<{ ok: true; shifts: HomebaseShiftRow[] } | { ok: false; message: string }> {
  const params = new URLSearchParams({
    start_date: input.start.toISOString().slice(0, 10),
    end_date: input.end.toISOString().slice(0, 10),
  });

  const res = await fetch(
    `${API_BASE}/locations/${encodeURIComponent(input.locationId)}/shifts?${params}`,
    { headers: headers(input.accessToken), cache: "no-store" },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, message: text.slice(0, 300) || `Homebase shifts failed (${res.status})` };
  }

  const json = (await res.json()) as unknown;
  return { ok: true, shifts: parseShiftRows(json) };
}

export async function createHomebaseShift(input: {
  accessToken: string;
  locationId: string;
  userId: string;
  startAt: string;
  endAt: string;
  notes?: string | null;
}): Promise<{ ok: boolean; message: string; shiftId?: string }> {
  const res = await fetch(
    `${API_BASE}/locations/${encodeURIComponent(input.locationId)}/shifts`,
    {
      method: "POST",
      headers: headers(input.accessToken),
      body: JSON.stringify({
        user_id: input.userId,
        scheduled_start_at: input.startAt,
        scheduled_end_at: input.endAt,
        notes: input.notes ?? undefined,
      }),
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, message: text.slice(0, 300) || `Homebase create shift failed (${res.status})` };
  }

  const json = (await res.json()) as { id?: string; shift?: { id?: string } };
  return {
    ok: true,
    message: "Shift exported to Homebase.",
    shiftId: json.shift?.id ?? json.id,
  };
}

export async function fetchHomebaseTimePunches(input: {
  accessToken: string;
  locationId: string;
  start: Date;
  end: Date;
}): Promise<{ ok: true; punches: HomebaseTimePunchRow[] } | { ok: false; message: string }> {
  const params = new URLSearchParams({
    start_date: input.start.toISOString().slice(0, 10),
    end_date: input.end.toISOString().slice(0, 10),
  });

  const res = await fetch(
    `${API_BASE}/locations/${encodeURIComponent(input.locationId)}/timecards?${params}`,
    { headers: headers(input.accessToken), cache: "no-store" },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, message: text.slice(0, 300) || `Homebase timecards failed (${res.status})` };
  }

  const json = (await res.json()) as unknown;
  return { ok: true, punches: parseTimePunchRows(json) };
}
