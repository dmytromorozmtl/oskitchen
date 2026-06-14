import { addDays, startOfDay } from "date-fns";

import type {
  HomebaseImportResult,
  HomebaseShiftRow,
} from "@/lib/integrations/homebase-types";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { staffMemberListWhereForOwner, staffShiftListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

const API_BASE = process.env.HOMEBASE_API_BASE ?? "https://api.joinhomebase.com";

export function isHomebaseImportConfigured(): boolean {
  return Boolean(
    process.env.HOMEBASE_API_KEY?.trim() && process.env.HOMEBASE_LOCATION_ID?.trim(),
  );
}

export function getHomebaseConfigError(): string | null {
  if (!process.env.HOMEBASE_API_KEY?.trim()) return "Set HOMEBASE_API_KEY";
  if (!process.env.HOMEBASE_LOCATION_ID?.trim()) return "Set HOMEBASE_LOCATION_ID";
  return null;
}

/** Parse Homebase ISO datetime into date + HH:mm. */
export function parseHomebaseDateTime(value: string): { shiftDate: Date; time: string } {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { shiftDate: startOfDay(new Date()), time: "00:00" };
  }
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");
  return {
    shiftDate: startOfDay(parsed),
    time: `${hours}:${minutes}`,
  };
}

export function buildHomebaseUserMap(
  staffMappings: Record<string, string> | undefined,
): Map<string, string> {
  const map = new Map<string, string>();
  if (!staffMappings) return map;
  for (const [staffMemberId, externalId] of Object.entries(staffMappings)) {
    const userId = externalId.trim();
    if (staffMemberId && userId) {
      map.set(userId, staffMemberId);
    }
  }
  return map;
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

export async function fetchHomebaseShifts(
  start: Date,
  end: Date,
): Promise<{ ok: true; shifts: HomebaseShiftRow[] } | { ok: false; message: string }> {
  const configError = getHomebaseConfigError();
  if (configError) return { ok: false, message: configError };

  const apiKey = process.env.HOMEBASE_API_KEY!.trim();
  const locationId = process.env.HOMEBASE_LOCATION_ID!.trim();
  const params = new URLSearchParams({
    start_date: start.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10),
  });

  const res = await fetch(
    `${API_BASE}/locations/${encodeURIComponent(locationId)}/shifts?${params}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    let detail = "";
    try {
      detail = await res.text();
    } catch {
      detail = "";
    }
    return {
      ok: false,
      message: `Homebase API ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`,
    };
  }

  const json = (await res.json()) as unknown;
  return { ok: true, shifts: parseShiftRows(json) };
}

function externalShiftNote(shiftId: string): string {
  return `homebase:shift:${shiftId}`;
}

export async function importScheduleFromHomebase(
  userId: string,
  staffMappings?: Record<string, string>,
): Promise<HomebaseImportResult> {
  const configError = getHomebaseConfigError();
  if (configError) {
    return { ok: false, message: configError, imported: 0 };
  }

  const userMap = buildHomebaseUserMap(staffMappings);
  if (userMap.size === 0) {
    return {
      ok: false,
      message: "Map at least one staff member to a Homebase employee ID before importing.",
      imported: 0,
    };
  }

  const rangeStart = startOfDay(new Date());
  const rangeEnd = addDays(rangeStart, 14);
  const fetched = await fetchHomebaseShifts(rangeStart, rangeEnd);
  if (!fetched.ok) {
    return { ok: false, message: fetched.message, imported: 0 };
  }

  const staffScope = await staffMemberListWhereForOwner(userId);
  const shiftScope = await staffShiftListWhereForOwner(userId);
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

    const start = parseHomebaseDateTime(shift.startAt);
    const end = parseHomebaseDateTime(shift.endAt);
    const tag = externalShiftNote(shift.id);
    const existing = await prisma.staffShift.findFirst({
      where: { AND: [shiftScope, { staffMemberId, notes: { contains: tag } }] },
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
    message: `Imported ${imported} shift(s), updated ${updated} (${fetched.shifts.length} fetched from Homebase).`,
  };
}
