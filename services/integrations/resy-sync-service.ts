import { addDays, startOfDay } from "date-fns";

import type {
  ResyExportResult,
  ResyImportResult,
  ResyReservationRow,
  ResyReservationStatus,
} from "@/lib/integrations/resy-types";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { storefrontSettingsListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

const API_BASE = process.env.RESY_API_BASE ?? "https://api.resy.com";

export function isResySyncConfigured(): boolean {
  return Boolean(
    process.env.RESY_API_KEY?.trim() && process.env.RESY_VENUE_ID?.trim(),
  );
}

export function getResyConfigError(): string | null {
  if (!process.env.RESY_API_KEY?.trim()) return "Set RESY_API_KEY";
  if (!process.env.RESY_VENUE_ID?.trim()) return "Set RESY_VENUE_ID";
  return null;
}

export function externalResyNote(reservationId: string): string {
  return `resy:res:${reservationId}`;
}

export function mapResyStatus(raw: string | null | undefined): ResyReservationStatus {
  const value = (raw ?? "").trim().toLowerCase();
  if (value.includes("seat")) return "SEATED";
  if (value.includes("cancel")) return "CANCELLED";
  if (value.includes("no_show") || value.includes("no-show")) return "NO_SHOW";
  if (value.includes("complete")) return "COMPLETED";
  if (value.includes("confirm")) return "CONFIRMED";
  return "PENDING";
}

export function parseResyDateTime(value: string): Date {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return startOfDay(new Date());
  }
  return parsed;
}

function readString(row: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return null;
}

function readNumber(row: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const n = Number(value);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

export function parseResyReservationRows(payload: unknown): ResyReservationRow[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const data = Array.isArray(root.reservations)
    ? root.reservations
    : Array.isArray(root.data)
      ? root.data
      : Array.isArray(root.results)
        ? root.results
        : Array.isArray(payload)
          ? payload
          : [];

  const rows: ResyReservationRow[] = [];
  for (const raw of data) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const id = readString(row, ["reservation_id", "id", "resy_id", "uuid"]);
    if (!id) continue;

    const firstName = readString(row, ["first_name", "guest_first_name"]);
    const lastName = readString(row, ["last_name", "guest_last_name"]);
    const guestName =
      readString(row, ["guest_name", "name", "full_name"]) ??
      [firstName, lastName].filter(Boolean).join(" ").trim() ??
      "Resy guest";

    const reservedAt =
      readString(row, ["time_slot", "reserved_at", "date_time", "start_time", "slot_start"]) ??
      readString(row, ["date", "day"]);

    if (!reservedAt) continue;

    rows.push({
      id,
      guestName,
      guestEmail: readString(row, ["email", "guest_email"]),
      guestPhone: readString(row, ["phone", "guest_phone", "mobile"]),
      partySize: readNumber(row, ["num_seats", "party_size", "covers", "size"]) ?? 2,
      reservedAt,
      status: readString(row, ["status", "state"]),
      notes: readString(row, ["notes", "special_request", "comment"]),
    });
  }
  return rows;
}

async function assertStorefrontOwned(userId: string, storefrontId: string): Promise<boolean> {
  const scope = await storefrontSettingsListWhereForOwner(userId);
  const row = await prisma.storefrontSettings.findFirst({
    where: { AND: [scope, { id: storefrontId }] },
    select: { id: true },
  });
  return Boolean(row);
}

async function fetchResyReservations(
  start: Date,
  end: Date,
): Promise<{ ok: true; rows: ResyReservationRow[] } | { ok: false; message: string }> {
  const apiKey = process.env.RESY_API_KEY?.trim();
  const venueId = process.env.RESY_VENUE_ID?.trim();
  if (!apiKey || !venueId) return { ok: false, message: "Resy not configured" };

  const rows: ResyReservationRow[] = [];
  for (let day = startOfDay(start); day <= end; day = addDays(day, 1)) {
    const date = day.toISOString().slice(0, 10);
    const params = new URLSearchParams({ venue_id: venueId, date });
    const res = await fetch(`${API_BASE}/4/venue/reservations?${params}`, {
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
        message: `Resy API ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`,
      };
    }

    const json = (await res.json()) as unknown;
    rows.push(...parseResyReservationRows(json));
  }

  return { ok: true, rows };
}

export async function importReservationsFromResy(
  userId: string,
  storefrontId: string,
): Promise<ResyImportResult> {
  const configError = getResyConfigError();
  if (configError) {
    return { ok: false, fetched: 0, imported: 0, updated: 0, skipped: 0, message: configError };
  }

  if (!(await assertStorefrontOwned(userId, storefrontId))) {
    return { ok: false, fetched: 0, imported: 0, updated: 0, skipped: 0, message: "Storefront not found" };
  }

  const rangeStart = startOfDay(new Date());
  const rangeEnd = addDays(rangeStart, 14);
  const fetched = await fetchResyReservations(rangeStart, rangeEnd);
  if (!fetched.ok) {
    return { ok: false, fetched: 0, imported: 0, updated: 0, skipped: 0, message: fetched.message };
  }

  const workspaceId = await resolveOwnerWorkspaceId(userId);
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of fetched.rows) {
    const tag = externalResyNote(row.id);
    const reservedAt = parseResyDateTime(row.reservedAt);
    const status = mapResyStatus(row.status);
    if (status === "CANCELLED" || status === "NO_SHOW") {
      skipped += 1;
      continue;
    }

    const existing = await prisma.storefrontReservation.findFirst({
      where: { storefrontId, notes: { contains: tag } },
      select: { id: true },
    });

    const data = {
      guestName: row.guestName,
      guestEmail: row.guestEmail ?? null,
      guestPhone: row.guestPhone ?? null,
      partySize: row.partySize,
      reservedAt,
      status,
      notes: row.notes ? `${tag} — ${row.notes}` : tag,
    };

    if (existing) {
      await prisma.storefrontReservation.update({ where: { id: existing.id }, data });
      updated += 1;
    } else {
      await prisma.storefrontReservation.create({
        data: {
          userId,
          workspaceId: workspaceId ?? undefined,
          storefrontId,
          ...data,
        },
      });
      imported += 1;
    }
  }

  return {
    ok: true,
    fetched: fetched.rows.length,
    imported,
    updated,
    skipped,
    message: `Imported ${imported}, updated ${updated} (${fetched.rows.length} fetched from Resy).`,
  };
}

async function createResyReservation(row: {
  guestName: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
  partySize: number;
  reservedAt: Date;
  notes?: string | null;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const apiKey = process.env.RESY_API_KEY?.trim();
  const venueId = process.env.RESY_VENUE_ID?.trim();
  if (!apiKey || !venueId) return { ok: false, error: "Resy not configured" };

  const [firstName, ...rest] = row.guestName.trim().split(/\s+/);
  const res = await fetch(`${API_BASE}/4/reservation/book`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      venue_id: venueId,
      date: row.reservedAt.toISOString().slice(0, 10),
      time: row.reservedAt.toISOString().slice(11, 16),
      party_size: row.partySize,
      first_name: firstName ?? row.guestName,
      last_name: rest.join(" ") || "Guest",
      email: row.guestEmail ?? undefined,
      phone: row.guestPhone ?? undefined,
      notes: row.notes ?? undefined,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: text || `Resy ${res.status}` };
  }

  const json = (await res.json()) as Record<string, unknown>;
  const id =
    (typeof json.reservation_id === "string" && json.reservation_id) ||
    (typeof json.id === "string" && json.id) ||
    `local-${Date.now()}`;
  return { ok: true, id };
}

export async function exportReservationsToResy(
  userId: string,
  storefrontId: string,
): Promise<ResyExportResult> {
  const configError = getResyConfigError();
  if (configError) {
    return { ok: false, exported: 0, failed: 0, message: configError };
  }

  if (!(await assertStorefrontOwned(userId, storefrontId))) {
    return { ok: false, exported: 0, failed: 0, message: "Storefront not found" };
  }

  const upcoming = await prisma.storefrontReservation.findMany({
    where: {
      userId,
      storefrontId,
      reservedAt: { gte: new Date() },
      status: { in: ["PENDING", "CONFIRMED"] },
      OR: [{ notes: null }, { notes: { not: { contains: "resy:res:" } } }],
    },
    take: 100,
    orderBy: { reservedAt: "asc" },
  });

  let exported = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const reservation of upcoming) {
    const result = await createResyReservation({
      guestName: reservation.guestName,
      guestEmail: reservation.guestEmail,
      guestPhone: reservation.guestPhone,
      partySize: reservation.partySize,
      reservedAt: reservation.reservedAt,
      notes: reservation.notes,
    });

    if (!result.ok) {
      failed += 1;
      if (errors.length < 5) errors.push(`${reservation.guestName}: ${result.error}`);
      continue;
    }

    const tag = externalResyNote(result.id);
    await prisma.storefrontReservation.update({
      where: { id: reservation.id },
      data: {
        notes: reservation.notes ? `${tag} — ${reservation.notes}` : tag,
        status: "CONFIRMED",
      },
    });
    exported += 1;
  }

  return {
    ok: failed === 0,
    exported,
    failed,
    message: `Exported ${exported} reservation(s) to Resy (${failed} failed).`,
    errors: errors.length ? errors : undefined,
  };
}
