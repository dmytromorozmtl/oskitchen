import { prisma } from "@/lib/prisma";
import { getStorefrontForPublic } from "@/lib/storefront/public-access";
import {
  buildDailySlotTimes,
  computeSlotAvailability,
  isReservationDateBookable,
  parseReservationAvailabilityConfig,
  type AvailabilitySlot,
  type ReservationAvailabilityConfig,
} from "@/services/storefront/reservation-availability-service";
import {
  createStorefrontReservation,
  type CreateReservationInput,
} from "@/services/storefront/reservation-service";

export type PublicReservationAvailability = {
  date: string;
  partySize: number;
  config: Pick<
    ReservationAvailabilityConfig,
    "maxPartySize" | "defaultDurationMinutes" | "slotIntervalMinutes"
  >;
  slots: AvailabilitySlot[];
};

export async function loadPublicReservationAvailability(
  storeSlug: string,
  dateIso: string,
  partySize: number,
): Promise<PublicReservationAvailability | null> {
  const sf = await prisma.storefrontSettings.findUnique({
    where: { storeSlug },
    select: {
      id: true,
      enabled: true,
      published: true,
      userId: true,
      settingsCenterJson: true,
    },
  });
  if (!sf?.enabled || !sf.published) return null;

  const config = parseReservationAvailabilityConfig(sf.settingsCenterJson);
  if (!isReservationDateBookable(dateIso, config)) {
    return {
      date: dateIso,
      partySize,
      config: publicConfigSummary(config),
      slots: [],
    };
  }

  const [y, m, d] = dateIso.split("-").map(Number);
  const dayStart = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  const dayEnd = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));

  const reservations = await prisma.storefrontReservation.findMany({
    where: {
      storefrontId: sf.id,
      reservedAt: { gte: dayStart, lte: dayEnd },
    },
    select: {
      reservedAt: true,
      durationMinutes: true,
      partySize: true,
      status: true,
    },
  });

  const slotTimes = buildDailySlotTimes(dateIso, config);
  const slots = computeSlotAvailability(slotTimes, reservations, partySize, config);

  return {
    date: dateIso,
    partySize,
    config: publicConfigSummary(config),
    slots,
  };
}

export async function createPublicStorefrontReservation(
  storeSlug: string,
  input: CreateReservationInput,
) {
  const sf = await getStorefrontForPublic(storeSlug);
  if (!sf) {
    throw new Error("Storefront not found.");
  }

  const config = parseReservationAvailabilityConfig(sf.settingsCenterJson);
  if (input.partySize > config.maxPartySize) {
    throw new Error(`Party size cannot exceed ${config.maxPartySize}.`);
  }

  const dateIso = input.reservedAt.toISOString().slice(0, 10);
  if (!isReservationDateBookable(dateIso, config)) {
    throw new Error("Selected date is outside the booking window.");
  }

  const availability = await loadPublicReservationAvailability(
    storeSlug,
    dateIso,
    input.partySize,
  );
  const slot = availability?.slots.find(
    (s) => s.reservedAt === input.reservedAt.toISOString() && s.available,
  );
  if (!slot) {
    throw new Error("Selected time is no longer available.");
  }

  return createStorefrontReservation(sf.userId, sf.id, {
    ...input,
    durationMinutes: input.durationMinutes ?? config.defaultDurationMinutes,
  });
}

export async function loadOwnerReservationAvailability(
  storefrontId: string,
  settingsCenterJson: unknown,
  dateIso: string,
  partySize: number,
): Promise<PublicReservationAvailability> {
  const config = parseReservationAvailabilityConfig(settingsCenterJson);
  if (!isReservationDateBookable(dateIso, config)) {
    return {
      date: dateIso,
      partySize,
      config: publicConfigSummary(config),
      slots: [],
    };
  }

  const [y, m, d] = dateIso.split("-").map(Number);
  const dayStart = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  const dayEnd = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));

  const reservations = await prisma.storefrontReservation.findMany({
    where: {
      storefrontId,
      reservedAt: { gte: dayStart, lte: dayEnd },
    },
    select: {
      reservedAt: true,
      durationMinutes: true,
      partySize: true,
      status: true,
    },
  });

  const slotTimes = buildDailySlotTimes(dateIso, config);
  const slots = computeSlotAvailability(slotTimes, reservations, partySize, config);

  return {
    date: dateIso,
    partySize,
    config: publicConfigSummary(config),
    slots,
  };
}

function publicConfigSummary(config: ReservationAvailabilityConfig) {
  return {
    maxPartySize: config.maxPartySize,
    defaultDurationMinutes: config.defaultDurationMinutes,
    slotIntervalMinutes: config.slotIntervalMinutes,
  };
}
