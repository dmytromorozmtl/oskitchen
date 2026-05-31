export type ReservationAvailabilityConfig = {
  openHour: number;
  closeHour: number;
  slotIntervalMinutes: number;
  defaultDurationMinutes: number;
  maxConcurrentCovers: number;
  maxPartySize: number;
  minAdvanceHours: number;
  maxAdvanceDays: number;
};

export type ExistingReservationWindow = {
  reservedAt: Date;
  durationMinutes: number;
  partySize: number;
  status: string;
};

export type AvailabilitySlot = {
  reservedAt: string;
  label: string;
  available: boolean;
  reason?: string;
};

export const DEFAULT_RESERVATION_AVAILABILITY_CONFIG: ReservationAvailabilityConfig = {
  openHour: 11,
  closeHour: 22,
  slotIntervalMinutes: 30,
  defaultDurationMinutes: 90,
  maxConcurrentCovers: 48,
  maxPartySize: 12,
  minAdvanceHours: 1,
  maxAdvanceDays: 90,
};

const INACTIVE_STATUSES = new Set(["CANCELLED", "NO_SHOW", "COMPLETED"]);

export function parseReservationAvailabilityConfig(
  settingsCenterJson: unknown,
): ReservationAvailabilityConfig {
  const base = DEFAULT_RESERVATION_AVAILABILITY_CONFIG;
  if (!settingsCenterJson || typeof settingsCenterJson !== "object") return base;
  const root = settingsCenterJson as Record<string, unknown>;
  const raw = root.reservations;
  if (!raw || typeof raw !== "object") return base;
  const cfg = raw as Record<string, unknown>;
  return {
    openHour: clampInt(cfg.openHour, 0, 23, base.openHour),
    closeHour: clampInt(cfg.closeHour, 1, 24, base.closeHour),
    slotIntervalMinutes: clampInt(cfg.slotIntervalMinutes, 15, 120, base.slotIntervalMinutes),
    defaultDurationMinutes: clampInt(cfg.defaultDurationMinutes, 30, 240, base.defaultDurationMinutes),
    maxConcurrentCovers: clampInt(cfg.maxConcurrentCovers, 4, 500, base.maxConcurrentCovers),
    maxPartySize: clampInt(cfg.maxPartySize, 1, 50, base.maxPartySize),
    minAdvanceHours: clampInt(cfg.minAdvanceHours, 0, 72, base.minAdvanceHours),
    maxAdvanceDays: clampInt(cfg.maxAdvanceDays, 1, 365, base.maxAdvanceDays),
  };
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function isReservationDateBookable(
  dateIso: string,
  config: ReservationAvailabilityConfig,
  now: Date = new Date(),
): boolean {
  const [y, m, d] = parseDateIso(dateIso);
  if (!y || !m || !d) return false;
  const dayStart = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  const minDay = new Date(now);
  minDay.setUTCHours(0, 0, 0, 0);
  const maxDay = new Date(minDay);
  maxDay.setUTCDate(maxDay.getUTCDate() + config.maxAdvanceDays);
  return dayStart >= minDay && dayStart <= maxDay;
}

export function buildDailySlotTimes(
  dateIso: string,
  config: ReservationAvailabilityConfig,
  now: Date = new Date(),
): Date[] {
  if (!isReservationDateBookable(dateIso, config, now)) return [];

  const [y, m, d] = parseDateIso(dateIso);
  if (!y || !m || !d) return [];

  const slots: Date[] = [];
  const closeTime = new Date(Date.UTC(y, m - 1, d, config.closeHour, 0, 0));
  const minBookTime = new Date(now.getTime() + config.minAdvanceHours * 3_600_000);

  for (let minutes = config.openHour * 60; minutes < config.closeHour * 60; minutes += config.slotIntervalMinutes) {
    const hour = Math.floor(minutes / 60);
    const min = minutes % 60;
    const slot = new Date(Date.UTC(y, m - 1, d, hour, min, 0));
    if (slot < minBookTime) continue;

    const endTime = new Date(slot.getTime() + config.defaultDurationMinutes * 60_000);
    if (endTime > closeTime) continue;

    slots.push(slot);
  }

  return slots;
}

export function computeSlotAvailability(
  slotTimes: Date[],
  existing: ExistingReservationWindow[],
  partySize: number,
  config: ReservationAvailabilityConfig,
): AvailabilitySlot[] {
  const active = existing.filter((r) => !INACTIVE_STATUSES.has(r.status));

  return slotTimes.map((slot) => {
    const slotEnd = new Date(slot.getTime() + config.defaultDurationMinutes * 60_000);
    let overlappingCovers = 0;
    let directConflict = false;

    for (const reservation of active) {
      const windowStart = new Date(
        reservation.reservedAt.getTime() - reservation.durationMinutes * 60_000,
      );
      const windowEnd = new Date(
        reservation.reservedAt.getTime() + reservation.durationMinutes * 60_000,
      );

      if (!windowsOverlap(slot, slotEnd, windowStart, windowEnd)) continue;

      overlappingCovers += reservation.partySize;
      if (Math.abs(reservation.reservedAt.getTime() - slot.getTime()) < config.slotIntervalMinutes * 60_000) {
        directConflict = true;
      }
    }

    if (partySize > config.maxPartySize) {
      return slotResult(slot, false, "Party exceeds maximum size.");
    }

    const coversAfter = overlappingCovers + partySize;
    if (directConflict || coversAfter > config.maxConcurrentCovers) {
      return slotResult(slot, false, "Fully booked.");
    }

    return slotResult(slot, true);
  });
}

function slotResult(slot: Date, available: boolean, reason?: string): AvailabilitySlot {
  return {
    reservedAt: slot.toISOString(),
    label: slot.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
    available,
    reason,
  };
}

function windowsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function parseDateIso(dateIso: string): [number, number, number] {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso.trim());
  if (!match) return [0, 0, 0];
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}
