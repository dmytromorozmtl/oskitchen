import { beforeEach, describe, expect, it, vi } from "vitest";

import { mapWithConcurrency } from "@/lib/async/map-with-concurrency";
import {
  N_PLUS_ONE_EXPORT_CONCURRENCY,
  N_PLUS_ONE_REGRESSION_POLICY_ID,
  N_PLUS_ONE_REGRESSION_TARGET_COUNT,
  N_PLUS_ONE_REGRESSION_TARGETS,
  N_PLUS_ONE_VENDOR_WEBHOOK_CONCURRENCY,
  nPlusOneRegressionScaleInvariantTargets,
} from "@/lib/testing/n-plus-one-regression-policy";

const prismaTracker = vi.hoisted(() => {
  const calls: string[] = [];
  return {
    track(label: string) {
      calls.push(label);
    },
    count(label?: string) {
      if (!label) return calls.length;
      return calls.filter((entry) => entry === label).length;
    },
    reset() {
      calls.length = 0;
    },
    _brands: undefined as Array<{ id: string; name: string }> | undefined,
    _shifts: undefined as
      | Array<{
          id: string;
          registerId: string;
          openingCashAmount: number;
          openedAt: Date;
          register: { name: string };
        }>
      | undefined,
    _cashRows: undefined as Array<{ shiftId: string; total: number }> | undefined,
    _vendor: undefined as { documents: unknown } | undefined,
  };
});

import {
  assertMaxQueries,
  assertSubLinearQueryGrowth,
} from "@/lib/testing/prisma-query-count-harness";

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  ownerScopedAnd: vi.fn(async (_userId: string, clause: unknown) => clause),
  orderListWhereForOwnerAnd: vi.fn(async (_userId: string, clause: unknown) => clause),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    brand: {
      findMany: vi.fn(async () => {
        prismaTracker.track("brand.findMany");
        return prismaTracker._brands ?? [];
      }),
    },
    product: {
      groupBy: vi.fn(async () => {
        prismaTracker.track("product.groupBy");
        return [];
      }),
    },
    order: {
      groupBy: vi.fn(async () => {
        prismaTracker.track("order.groupBy");
        return [];
      }),
    },
    pOSShift: {
      findMany: vi.fn(async () => {
        prismaTracker.track("pOSShift.findMany");
        return prismaTracker._shifts ?? [];
      }),
    },
    pOSTransaction: {
      findMany: vi.fn(async () => {
        prismaTracker.track("pOSTransaction.findMany");
        return prismaTracker._cashRows ?? [];
      }),
    },
    partnerOAuthAppRegistry: {
      findMany: vi.fn(async () => {
        prismaTracker.track("partnerOAuthAppRegistry.findMany");
        return [];
      }),
    },
    supportSlaPolicy: {
      findMany: vi.fn(async () => {
        prismaTracker.track("supportSlaPolicy.findMany");
        return [];
      }),
    },
    vendor: {
      findUnique: vi.fn(async () => {
        prismaTracker.track("vendor.findUnique");
        return prismaTracker._vendor ?? null;
      }),
    },
  },
}));

vi.mock("@/lib/oauth/partner-oauth-app-catalog", () => ({
  getPartnerOAuthAppByClientId: vi.fn(() => null),
  listPartnerOAuthAppDefinitions: vi.fn(() => []),
}));

vi.mock("@/lib/logger", () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

global.fetch = vi.fn(async () => ({ ok: true })) as unknown as typeof fetch;

import { getBrandsOverview } from "@/services/brand/brand-analytics";
import { dispatchVendorWebhookEvent } from "@/services/marketplace/vendor-api-service";
import { getMergedPartnerOAuthAppsByClientIds } from "@/services/platform/partner-oauth-app-registry-service";
import { listOpenShiftCloseoutPreviews } from "@/services/pos/pos-shift-service";
import { loadActiveSlaPolicyRows } from "@/services/support/sla-service";

const tracker = prismaTracker;

function seedOpenShifts(count: number) {
  tracker._shifts = Array.from({ length: count }, (_, index) => ({
    id: `shift-${index}`,
    registerId: `reg-${index % 3}`,
    openingCashAmount: 100,
    openedAt: new Date("2026-06-01T12:00:00.000Z"),
    register: { name: `Register ${index}` },
  }));
  tracker._cashRows = tracker._shifts.map((shift) => ({
    shiftId: shift.id,
    total: 12.5,
  }));
}

function seedBrands(count: number) {
  tracker._brands = Array.from({ length: count }, (_, index) => ({
    id: `brand-${index}`,
    name: `Brand ${index}`,
  }));
}

describe("N+1 regression query counts (Absolute Final Task 53)", () => {
  beforeEach(() => {
    tracker.reset();
    tracker._brands = undefined;
    tracker._shifts = undefined;
    tracker._cashRows = undefined;
    tracker._vendor = undefined;
    vi.clearAllMocks();
  });

  it("locks eight Task-6 regression targets", () => {
    expect(N_PLUS_ONE_REGRESSION_POLICY_ID).toBe("n-plus-one-regression-absolute-final-v1");
    expect(N_PLUS_ONE_REGRESSION_TARGET_COUNT).toBe(8);
    expect(nPlusOneRegressionScaleInvariantTargets()).toHaveLength(3);
  });

  it("getMergedPartnerOAuthAppsByClientIds uses one findMany for many client IDs", async () => {
    const clientIds = Array.from({ length: 24 }, (_, index) => `client-${index}`);

    await getMergedPartnerOAuthAppsByClientIds(clientIds);

    expect(tracker.count("partnerOAuthAppRegistry.findMany")).toBe(1);
    assertMaxQueries(tracker.count(), 1, "partner oauth batch");
  });

  it("listOpenShiftCloseoutPreviews batches cash transactions (not per-shift queries)", async () => {
    const scaleSamples = [];
    for (const shiftCount of [3, 12, 24]) {
      tracker.reset();
      seedOpenShifts(shiftCount);
      await listOpenShiftCloseoutPreviews("owner-1");
      scaleSamples.push({ itemCount: shiftCount, queryCount: tracker.count() });
    }

    assertSubLinearQueryGrowth(scaleSamples, 0, "pos shift closeout previews");

    tracker.reset();
    seedOpenShifts(10);
    await listOpenShiftCloseoutPreviews("owner-1");
    expect(tracker.count("pOSShift.findMany")).toBe(1);
    expect(tracker.count("pOSTransaction.findMany")).toBe(1);
    assertMaxQueries(tracker.count(), 4, "pos shift closeout previews");
  });

  it("getBrandsOverview uses groupBy instead of per-brand order loops", async () => {
    const scaleSamples = [];
    for (const brandCount of [4, 16]) {
      tracker.reset();
      seedBrands(brandCount);
      await getBrandsOverview("owner-1");
      scaleSamples.push({ itemCount: brandCount, queryCount: tracker.count() });
    }

    assertSubLinearQueryGrowth(scaleSamples, 0, "brand analytics overview");
    expect(tracker.count("product.groupBy")).toBe(1);
    expect(tracker.count("order.groupBy")).toBe(2);
    assertMaxQueries(tracker.count(), 6, "brand analytics overview");
  });

  it("loadActiveSlaPolicyRows loads SLA policies in one query", async () => {
    await loadActiveSlaPolicyRows();
    expect(tracker.count("supportSlaPolicy.findMany")).toBe(1);
    assertMaxQueries(tracker.count(), 1, "cron SLA bulk load");
  });

  it("dispatchVendorWebhookEvent batches webhook delivery with concurrency 5", async () => {
    let peakConcurrent = 0;
    let inFlight = 0;

    vi.mocked(global.fetch).mockImplementation(async () => {
      inFlight += 1;
      peakConcurrent = Math.max(peakConcurrent, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;
      return { ok: true } as Response;
    });

    tracker._vendor = {
      documents: {
        webhooks: Array.from({ length: 12 }, (_, index) => ({
          id: `hook-${index}`,
          url: `https://example.com/hook-${index}`,
          events: ["order.created"],
          secretHash: `hash-${index}`,
          secretPreview: "***",
          createdAt: "2026-06-01T00:00:00.000Z",
          active: true,
        })),
      },
    };

    await dispatchVendorWebhookEvent({
      vendorId: "vendor-1",
      event: "order.created",
      data: { orderId: "order-1" },
    });

    expect(tracker.count("vendor.findUnique")).toBe(1);
    expect(peakConcurrent).toBeLessThanOrEqual(N_PLUS_ONE_VENDOR_WEBHOOK_CONCURRENCY);
    assertMaxQueries(tracker.count(), 2, "vendor webhook dispatch");
  });

  it("mapWithConcurrency caps export lane concurrency at five", async () => {
    let peakConcurrent = 0;
    let inFlight = 0;

    await mapWithConcurrency(Array.from({ length: 14 }, (_, index) => index), 5, async () => {
      inFlight += 1;
      peakConcurrent = Math.max(peakConcurrent, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;
      return true;
    });

    expect(peakConcurrent).toBeLessThanOrEqual(N_PLUS_ONE_EXPORT_CONCURRENCY);
  });

  it("documents batched markers for all eight regression targets", () => {
    for (const target of N_PLUS_ONE_REGRESSION_TARGETS) {
      expect(target.batchMarker.length).toBeGreaterThan(0);
      expect(target.module).toMatch(/^services\//);
    }
  });
});
