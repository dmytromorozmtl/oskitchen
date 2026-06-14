import type { SevenShiftsShiftRow } from "@/lib/integrations/seven-shifts-types";

const API_BASE = process.env.SEVENSHIFTS_API_BASE ?? "https://api.7shifts.com/v2";

function headers(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

function parseShiftRows(payload: unknown): SevenShiftsShiftRow[] {
  if (!payload || typeof payload !== "object") return [];
  const data = (payload as { data?: unknown }).data;
  if (!Array.isArray(data)) return [];
  const rows: SevenShiftsShiftRow[] = [];
  for (const raw of data) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const id = Number(row.id);
    const userId = Number(row.user_id);
    const start = typeof row.start === "string" ? row.start : null;
    const end = typeof row.end === "string" ? row.end : null;
    if (!Number.isFinite(id) || !Number.isFinite(userId) || !start || !end) continue;
    rows.push({
      id,
      userId,
      start,
      end,
      notes: typeof row.notes === "string" ? row.notes : null,
      hourlyWage: Number(row.hourly_wage ?? row.wage ?? 0) || undefined,
      laborCost: Number(row.cost ?? row.labor_cost ?? 0) || undefined,
    });
  }
  return rows;
}

export async function fetchSevenShiftsShiftsApi(input: {
  accessToken: string;
  companyId: string;
  start: Date;
  end: Date;
}): Promise<{ ok: true; shifts: SevenShiftsShiftRow[] } | { ok: false; message: string }> {
  const params = new URLSearchParams({
    start: input.start.toISOString().slice(0, 10),
    end: input.end.toISOString().slice(0, 10),
    limit: "500",
  });

  const res = await fetch(
    `${API_BASE}/company/${encodeURIComponent(input.companyId)}/shifts?${params}`,
    { headers: headers(input.accessToken), cache: "no-store" },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, message: text.slice(0, 300) || `7shifts shifts failed (${res.status})` };
  }

  const json = (await res.json()) as unknown;
  return { ok: true, shifts: parseShiftRows(json) };
}

export async function createSevenShiftsShift(input: {
  accessToken: string;
  companyId: string;
  userId: number;
  start: string;
  end: string;
  notes?: string | null;
}): Promise<{ ok: boolean; message: string; shiftId?: number }> {
  const res = await fetch(`${API_BASE}/company/${encodeURIComponent(input.companyId)}/shifts`, {
    method: "POST",
    headers: headers(input.accessToken),
    body: JSON.stringify({
      user_id: input.userId,
      start: input.start,
      end: input.end,
      notes: input.notes ?? undefined,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, message: text.slice(0, 300) || `7shifts create shift failed (${res.status})` };
  }

  const json = (await res.json()) as { data?: { id?: number } };
  return {
    ok: true,
    message: "Shift exported to 7shifts.",
    shiftId: json.data?.id != null ? Number(json.data.id) : undefined,
  };
}

export async function fetchSevenShiftsLaborReport(input: {
  accessToken: string;
  companyId: string;
  start: Date;
  end: Date;
}): Promise<{ ok: true; totalLaborCost: number; shiftCosts: Array<{ shiftId: number; cost: number }> } | { ok: false; message: string }> {
  const params = new URLSearchParams({
    start: input.start.toISOString().slice(0, 10),
    end: input.end.toISOString().slice(0, 10),
  });

  const res = await fetch(
    `${API_BASE}/company/${encodeURIComponent(input.companyId)}/labor?${params}`,
    { headers: headers(input.accessToken), cache: "no-store" },
  );

  if (!res.ok) {
    const fetched = await fetchSevenShiftsShiftsApi(input);
    if (!fetched.ok) return { ok: false, message: fetched.message };
    const shiftCosts = fetched.shifts
      .filter((s) => s.laborCost != null && s.laborCost > 0)
      .map((s) => ({ shiftId: s.id, cost: s.laborCost! }));
    const totalLaborCost = shiftCosts.reduce((sum, row) => sum + row.cost, 0);
    return { ok: true, totalLaborCost, shiftCosts };
  }

  const json = (await res.json()) as {
    data?: { total_cost?: number; shifts?: Array<{ id?: number; cost?: number }> };
    total_cost?: number;
  };
  const totalLaborCost = Number(json.data?.total_cost ?? json.total_cost ?? 0);
  const shiftCosts = (json.data?.shifts ?? []).map((row) => ({
    shiftId: Number(row.id ?? 0),
    cost: Number(row.cost ?? 0),
  }));
  return { ok: true, totalLaborCost, shiftCosts };
}
