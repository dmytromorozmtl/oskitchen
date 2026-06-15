import { describe, expect, it } from "vitest";

import { isDateInStorefrontBlackout } from "@/lib/storefront/blackout";

describe("isDateInStorefrontBlackout", () => {
  const rows = [
    { startDate: new Date("2026-06-01"), endDate: new Date("2026-06-03") },
  ];

  it("returns false when no date", () => {
    expect(isDateInStorefrontBlackout(rows, undefined)).toBe(false);
  });

  it("returns false when empty rows", () => {
    expect(isDateInStorefrontBlackout([], new Date("2026-06-02"))).toBe(false);
  });

  it("detects day inside window", () => {
    expect(isDateInStorefrontBlackout(rows, new Date("2026-06-02T12:00:00Z"))).toBe(true);
  });

  it("returns false outside window", () => {
    expect(isDateInStorefrontBlackout(rows, new Date("2026-05-31"))).toBe(false);
  });
});
