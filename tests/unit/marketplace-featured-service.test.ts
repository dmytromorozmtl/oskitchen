import { describe, expect, it } from "vitest";

import {
  applyFeaturedPerformanceEvent,
  featuredSlotPriceUsd,
  isFeaturedPlacementActive,
  resolveFeaturedPlacementStatus,
  sumFeaturedPlacementRevenue,
} from "@/lib/marketplace/featured-placement-types";

describe("marketplace featured placement types", () => {
  it("prices featured slots weekly", () => {
    expect(featuredSlotPriceUsd("homepage_hero", 2)).toBe(598);
    expect(featuredSlotPriceUsd("search_boost")).toBe(49);
  });

  it("resolves active and expired placement windows", () => {
    const now = new Date("2026-06-15T12:00:00.000Z");
    const active = resolveFeaturedPlacementStatus(
      {
        status: "active",
        periodStart: "2026-06-01T00:00:00.000Z",
        periodEnd: "2026-06-30T23:59:59.999Z",
      },
      now,
    );
    expect(active).toBe("active");
    expect(
      isFeaturedPlacementActive(
        {
          status: "active",
          periodStart: "2026-06-01T00:00:00.000Z",
          periodEnd: "2026-06-30T23:59:59.999Z",
        },
        now,
      ),
    ).toBe(true);

    const expired = resolveFeaturedPlacementStatus(
      {
        status: "active",
        periodStart: "2026-05-01T00:00:00.000Z",
        periodEnd: "2026-05-31T23:59:59.999Z",
      },
      now,
    );
    expect(expired).toBe("expired");
  });

  it("tracks performance counters", () => {
    const next = applyFeaturedPerformanceEvent({ views: 1, clicks: 0, conversions: 0 }, "click");
    expect(next.clicks).toBe(1);
  });

  it("sums paid featured revenue since date", () => {
    const since = new Date("2026-06-01T00:00:00.000Z");
    const total = sumFeaturedPlacementRevenue(
      [
        {
          id: "p1",
          vendorId: "v1",
          productId: null,
          productSlug: null,
          productName: null,
          slot: "catalog_top",
          status: "active",
          periodStart: "2026-06-10T00:00:00.000Z",
          periodEnd: "2026-06-17T00:00:00.000Z",
          paidAmountUsd: 149,
          currency: "USD",
          label: null,
          performance: { views: 0, clicks: 0, conversions: 0 },
          createdAt: "2026-06-10T12:00:00.000Z",
          updatedAt: "2026-06-10T12:00:00.000Z",
        },
        {
          id: "p2",
          vendorId: "v1",
          productId: null,
          productSlug: null,
          productName: null,
          slot: "search_boost",
          status: "draft",
          periodStart: "2026-06-10T00:00:00.000Z",
          periodEnd: "2026-06-17T00:00:00.000Z",
          paidAmountUsd: 49,
          currency: "USD",
          label: null,
          performance: { views: 0, clicks: 0, conversions: 0 },
          createdAt: "2026-05-01T12:00:00.000Z",
          updatedAt: "2026-05-01T12:00:00.000Z",
        },
      ],
      since,
    );
    expect(total).toBe(149);
  });
});
