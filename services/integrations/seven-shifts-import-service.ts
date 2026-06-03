import { addDays, startOfDay } from "date-fns";

import type {
  SevenShiftsImportResult,
  SevenShiftsShiftRow,
} from "@/lib/integrations/seven-shifts-types";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { staffMemberListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

const API_BASE = process.env.SEVENSHIFTS_API_BASE ?? "https://api.7shifts.com/v2";

export function is7shiftsImportConfigured(): boolean {
  return Boolean(
    process.env.SEVENSHIFTS_API_KEY?.trim() && process.env.SEVENSHIFTS_COMPANY_ID?.trim(),
  );
}

export function get7shiftsConfigError(): string | null {
  if (!process.env.SEVENSHIFTS_API_KEY?.trim()) return "Set SEVENSHIFTS_API_KEY";
  if (!process.env.SEVENSHIFTS_COMPANY_ID?.trim()) return "Set SEVENSHIFTS_COMPANY_ID";
  return null;
}

/** Parse 7shifts datetime (`YYYY-MM-DD HH:mm:ss`) into date + HH:mm. */
export function parseSevenShiftsDateTime(value: string): { shiftDate: Date; time: string } {
  const [datePart, timePart] = value.trim().split(/\s+/);
  const [y, m, d] = (datePart ?? "").split("-").map(Number);
  const time = (timePart ?? "00:00:00").slice(0, 5);
  return { shiftDate: new Date(y, (m ?? 1) - 1, d ?? 1), time };
}

export function buildSevenShiftsUserMap(
  staffMappings: Record<string, string> | undefined,
): Map<number, string> {
  const map = new Map<number, string>();
  if (!staffMappings) return map;
  for (const [staffMemberId, externalId] of Object.entries(staffMappings)) {
    const userId = Number(externalId.trim());
    if (staffMemberId && Number.isFinite(userId) && userId > 0) {
      map.set(userId, staffMemberId);
    }
  }
  return map;
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
    });
  }
  return rows;
}

export async function fetchSevenShiftsShifts(
  start: Date,
  end: Date,
): Promise<{ ok: true; shifts: SevenShiftsShiftRow[] } | { ok: false; message: string }> {
  const configError = get7shiftsConfigError();
  if (configError) return { ok: false, message: configError };

  const apiKey = process.env.SEVENSHIFTS_API_KEY!.trim();
  const companyId = process.env.SEVENSHIFTS_COMPANY_ID!.trim();
  const params = new URLSearchParams({
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
    limit: "500",
  });

  const res = await fetch(`${API_BASE}/company/${encodeURIComponent(companyId)}/shifts?${params}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = "";
    try {
      detail = await res.text();
    } catch {
      detail = "";
    }
    return {
      ok: false,
      message: `7shifts API ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`,
    };
  }

  const json = (await res.json()) as unknown;
  return { ok: true, shifts: parseShiftRows(json) };
}

function externalShiftNote(shiftId: number): string {
  return `7shifts:shift:${shiftId}`;
}

export async function importScheduleFrom7shifts(
  userId: string,
  staffMappings?: Record<string, string>,
): Promise<SevenShiftsImportResult> {
  const configError = get7shiftsConfigError();
  if (configError) {
    return { ok: false, message: configError, imported: 0 };
  }

  const userMap = buildSevenShiftsUserMap(staffMappings);
  if (userMap.size === 0) {
    return {
      ok: false,
      message: "Map at least one staff member to a 7shifts user ID before importing.",
      imported: 0,
    };
  }

  const rangeStart = startOfDay(new Date());
  const rangeEnd = addDays(rangeStart, 14);
  const fetched = await fetchSevenShiftsShifts(rangeStart, rangeEnd);
  if (!fetched.ok) {
    return { ok: false, message: fetched.message, imported: 0 };
  }

  const staffScope = await staffMemberListWhereForOwner(userId);
  const allowedStaff = await prisma.staffMember.findMany({
    where: { AND: [staffScope, { id: { in: [...userMap.values()] }, status: "ACTIVE" }] },
    select: { id: true },
  });
  const allowedIds = new Set(allowedStaff.map((s) => s.id));
  const workspaceId = await resolveOwnerWorkspaceId(userId);

  let imported = 0;
  let updated = 0;
  let skippedUnmapped = 0;

  for (const shift of fetched.shifts) {
    const staffMemberId = userMap.get(shift.userId);
    if (!staffMemberId || !allowedIds.has(staffMemberId)) {
      skippedUnmapped += 1;
      continue;
    }

    const start = parseSevenShiftsDateTime(shift.start);
    const end = parseSevenShiftsDateTime(shift.end);
    const tag = externalShiftNote(shift.id);
    const existing = await prisma.staffShift.findFirst({
      where: { userId, staffMemberId, notes: { contains: tag } },
      select: { id: true },
    });

    const data = {
      shiftDate: start.shiftDate,
      startTime: start.time,
      endTime: end.time,
      status: "SCHEDULED" as const,
      notes: shift.notes ? `${tag} — ${shift.notes}` : tag,
      laborCost: 0,
    };

    if (existing) {
      await prisma.staffShift.update({ where: { id: existing.id }, data });
      updated += 1;
    } else {
      await prisma.staffShift.create({
        data: {
          userId,
          workspaceId: workspaceId ?? undefined,
          staffMemberId,
          ...data,
        },
      });
      imported += 1;
    }
  }

  return {
    ok: true,
    fetched: fetched.shifts.length,
    imported,
    updated,
    skippedUnmapped,
    message: `Imported ${imported} shift(s), updated ${updated} (${fetched.shifts.length} fetched from 7shifts).`,
  };
}
