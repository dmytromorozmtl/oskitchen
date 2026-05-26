import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    storefrontReservation: {
      count: vi.fn().mockResolvedValue(1),
    },
  },
}));

import { detectReservationConflict } from "@/services/storefront/reservation-service";

describe("reservation conflict detection", () => {
  it("returns true when overlapping reservation exists", async () => {
    const conflict = await detectReservationConflict(
      "sf-1",
      new Date("2026-05-23T18:00:00Z"),
      90,
    );
    expect(conflict).toBe(true);
  });
});
