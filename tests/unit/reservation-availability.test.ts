import { describe, expect, it } from "vitest";

import {
  buildDailySlotTimes,
  computeSlotAvailability,
  DEFAULT_RESERVATION_AVAILABILITY_CONFIG,
  isReservationDateBookable,
  parseReservationAvailabilityConfig,
} from "@/services/storefront/reservation-availability-service";

describe("reservation availability", () => {
  const config = DEFAULT_RESERVATION_AVAILABILITY_CONFIG;
  const now = new Date("2026-05-30T10:00:00.000Z");

  it("parses optional settings overrides", () => {
    const parsed = parseReservationAvailabilityConfig({
      reservations: { openHour: 17, closeHour: 23, maxPartySize: 8 },
    });
    expect(parsed.openHour).toBe(17);
    expect(parsed.maxPartySize).toBe(8);
  });

  it("builds slot times within service hours", () => {
    const slots = buildDailySlotTimes("2026-05-31", config, now);
    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0]!.getUTCHours()).toBeGreaterThanOrEqual(config.openHour);
  });

  it("marks slots unavailable when capacity is exceeded", () => {
    const slots = buildDailySlotTimes("2026-05-31", config, now);
    const target = slots[4]!;
    const availability = computeSlotAvailability(
      [target],
      [
        {
          reservedAt: target,
          durationMinutes: 90,
          partySize: config.maxConcurrentCovers,
          status: "CONFIRMED",
        },
      ],
      2,
      config,
    );
    expect(availability[0]?.available).toBe(false);
  });

  it("ignores cancelled reservations for capacity", () => {
    const slots = buildDailySlotTimes("2026-05-31", config, now);
    const target = slots[4]!;
    const availability = computeSlotAvailability(
      [target],
      [
        {
          reservedAt: target,
          durationMinutes: 90,
          partySize: config.maxConcurrentCovers,
          status: "CANCELLED",
        },
      ],
      2,
      config,
    );
    expect(availability[0]?.available).toBe(true);
  });

  it("rejects dates outside booking window", () => {
    expect(isReservationDateBookable("2026-05-29", config, now)).toBe(false);
    expect(isReservationDateBookable("2026-06-15", config, now)).toBe(true);
  });
});
