import { describe, expect, it } from "vitest";

import { auditDeliveryCommissionTrackingWiring } from "@/lib/delivery/delivery-commission-tracking-audit";
import {
  buildDeliveryCommissionTrackingSnapshot,
  extractReportedCommission,
  resolveDeliveryOrderCommission,
} from "@/lib/delivery/delivery-commission-metrics";
import {
  DELIVERY_COMMISSION_BENCHMARK_RATE_PCT,
  DELIVERY_COMMISSION_PROVIDERS,
  DELIVERY_COMMISSION_TRACKING_ABSOLUTE_FINAL_POLICY_ID,
  DELIVERY_COMMISSION_TRACKING_CI_SCRIPTS,
  DELIVERY_COMMISSION_TRACKING_ROUTE,
  DELIVERY_COMMISSION_TRACKING_UNIT_TEST,
} from "@/lib/delivery/delivery-commission-tracking-absolute-final-policy";

const ROOT = process.cwd();

describe("Delivery commission tracking (Absolute Final Task 73)", () => {
  it("locks absolute final policy with four marketplace providers", () => {
    expect(DELIVERY_COMMISSION_TRACKING_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "delivery-commission-tracking-absolute-final-v1",
    );
    expect(DELIVERY_COMMISSION_TRACKING_ROUTE).toBe("/dashboard/analytics/delivery-commissions");
    expect(DELIVERY_COMMISSION_PROVIDERS).toEqual([
      "DOORDASH",
      "UBER_EATS",
      "GRUBHUB",
      "UBER_DIRECT",
    ]);
    expect(DELIVERY_COMMISSION_BENCHMARK_RATE_PCT.DOORDASH).toBe(25);
  });

  it("extracts reported commission from marketplace raw payloads", () => {
    const reported = extractReportedCommission({
      order: { commission_fee: 1250, total: 5000 },
    });
    expect(reported.amount).toBe(12.5);

    const rateOnly = extractReportedCommission({
      order: { commission_rate: 0.2, total: 100 },
    });
    expect(rateOnly.ratePct).toBe(20);
  });

  it("resolves per-order commission with reported vs estimated sources", () => {
    const reported = resolveDeliveryOrderCommission({
      orderId: "o1",
      externalOrderId: "dd-99",
      provider: "DOORDASH",
      createdAt: new Date("2026-06-01"),
      grossTotal: 100,
      rawPayload: { commission_fee: 20 },
    });
    expect(reported.commissionAmount).toBe(20);
    expect(reported.netPayout).toBe(80);
    expect(reported.source).toBe("reported");

    const estimated = resolveDeliveryOrderCommission({
      orderId: "o2",
      externalOrderId: null,
      provider: "UBER_EATS",
      createdAt: new Date("2026-06-02"),
      grossTotal: 80,
    });
    expect(estimated.commissionAmount).toBe(20);
    expect(estimated.source).toBe("estimated");
    expect(estimated.commissionRatePct).toBe(25);
  });

  it("builds portfolio commission snapshot", () => {
    const from = new Date("2026-06-01");
    const to = new Date("2026-06-07");
    const snapshot = buildDeliveryCommissionTrackingSnapshot({
      from,
      to,
      orders: [
        resolveDeliveryOrderCommission({
          orderId: "a",
          externalOrderId: "1",
          provider: "DOORDASH",
          createdAt: from,
          grossTotal: 100,
          rawPayload: { commission_fee: 25 },
        }),
        resolveDeliveryOrderCommission({
          orderId: "b",
          externalOrderId: "2",
          provider: "GRUBHUB",
          createdAt: to,
          grossTotal: 50,
        }),
      ],
    });

    expect(snapshot.totalOrders).toBe(2);
    expect(snapshot.grossTotal).toBe(150);
    expect(snapshot.commissionTotal).toBe(35);
    expect(snapshot.reportedOrderCount).toBe(1);
    expect(snapshot.estimatedOrderCount).toBe(1);
    expect(snapshot.channels).toHaveLength(2);
  });

  it("passes wiring audit", () => {
    const audit = auditDeliveryCommissionTrackingWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.providerCount).toBe(4);
  });

  it("registers CI cert script", () => {
    expect(DELIVERY_COMMISSION_TRACKING_CI_SCRIPTS).toContain(
      "test:ci:delivery-commission-tracking:cert",
    );
    expect(DELIVERY_COMMISSION_TRACKING_UNIT_TEST).toBe(
      "tests/unit/delivery-commission-tracking-absolute-final.test.ts",
    );
  });
});
