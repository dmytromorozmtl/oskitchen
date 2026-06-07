import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditKdsDriverEtaTrackingWiring } from "@/lib/kitchen/kds-driver-eta-tracking-audit";
import {
  buildDriverEtaLabel,
  classifyDriverEtaBand,
  estimateDriverEtaMinutes,
  haversineKm,
  isGpsPingFresh,
  KDS_DRIVER_ETA_GPS_STALE_MINUTES,
  KDS_DRIVER_ETA_MIN_TOUCH_PX,
  KDS_DRIVER_ETA_TRACKING_ABSOLUTE_FINAL_POLICY_ID,
  KDS_DRIVER_ETA_TRACKING_CI_SCRIPTS,
  KDS_DRIVER_ETA_TRACKING_PILLARS,
  KDS_DRIVER_ETA_TRACKING_ROUTE,
  KDS_DRIVER_ETA_TRACKING_UNIT_TEST,
  parseDispatchGpsPayload,
  summarizeKdsDriverEtaTracking,
  type KdsDriverEtaTicket,
} from "@/lib/kitchen/kds-driver-eta-tracking-absolute-final-policy";

const ROOT = process.cwd();

function ticket(overrides: Partial<KdsDriverEtaTicket> = {}): KdsDriverEtaTicket {
  return {
    orderId: "ord-1",
    ticketNumber: "#ORD-1",
    customerName: "Guest",
    kdsStatus: "PREPARING",
    dispatchStatus: "DROPOFF",
    dispatchProvider: "internal",
    driverLabel: "Alex",
    etaMinutes: 12,
    etaLabel: "estimated ETA 12 min",
    band: "on_time",
    gpsFresh: true,
    lastPingAt: new Date().toISOString(),
    trackingUrl: null,
    windowEnd: null,
    href: "/dashboard/kitchen#ticket-ord-1",
    ...overrides,
  };
}

describe("KDS driver ETA tracking (Absolute Final Task 100)", () => {
  it("locks absolute final policy and /dashboard/kitchen/driver-eta route", () => {
    expect(KDS_DRIVER_ETA_TRACKING_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "kds-driver-eta-tracking-absolute-final-v1",
    );
    expect(KDS_DRIVER_ETA_TRACKING_ROUTE).toBe("/dashboard/kitchen/driver-eta");
    expect(KDS_DRIVER_ETA_TRACKING_PILLARS).toHaveLength(5);
    expect(KDS_DRIVER_ETA_MIN_TOUCH_PX).toBe(44);
  });

  it("parses GPS payload and freshness window", () => {
    const now = Date.now();
    const freshAt = new Date(now - 2 * 60000).toISOString();
    const staleAt = new Date(now - (KDS_DRIVER_ETA_GPS_STALE_MINUTES + 1) * 60000).toISOString();
    const { pings, last } = parseDispatchGpsPayload({
      pings: [{ lat: 43.65, lng: -79.38, recordedAt: freshAt }],
      last: { lat: 43.65, lng: -79.38, recordedAt: freshAt, driverLabel: "Sam" },
    });
    expect(pings).toHaveLength(1);
    expect(last?.driverLabel).toBe("Sam");
    expect(isGpsPingFresh(freshAt, now)).toBe(true);
    expect(isGpsPingFresh(staleAt, now)).toBe(false);
  });

  it("estimates ETA from dispatch status and GPS movement", () => {
    const now = new Date("2026-06-06T18:00:00.000Z");
    const t0 = "2026-06-06T17:58:00.000Z";
    const t1 = "2026-06-06T17:59:00.000Z";
    const eta = estimateDriverEtaMinutes({
      dispatchStatus: "DROPOFF",
      lastPing: { lat: 43.65, lng: -79.38, recordedAt: t1 },
      pings: [
        { lat: 43.64, lng: -79.39, recordedAt: t0 },
        { lat: 43.65, lng: -79.38, recordedAt: t1 },
      ],
      windowEnd: null,
      now,
    });
    expect(eta).not.toBeNull();
    expect(eta!).toBeGreaterThan(0);
    expect(estimateDriverEtaMinutes({ dispatchStatus: "QUOTE", lastPing: null, pings: [], windowEnd: null, now })).toBeNull();
  });

  it("classifies bands and builds labels with honesty markers", () => {
    const now = new Date("2026-06-06T18:00:00.000Z");
    const windowEnd = new Date("2026-06-06T18:05:00.000Z");
    expect(
      classifyDriverEtaBand({
        etaMinutes: 15,
        windowEnd,
        dispatchStatus: "DROPOFF",
        gpsFresh: true,
        now,
      }),
    ).toBe("late");
    const label = buildDriverEtaLabel({
      dispatchStatus: "DROPOFF",
      etaMinutes: 8,
      gpsFresh: false,
    });
    expect(label).toContain("estimated ETA");
    expect(label).toContain("GPS stale");
  });

  it("computes haversine distance and summary counts", () => {
    const km = haversineKm({ lat: 43.65, lng: -79.38 }, { lat: 43.66, lng: -79.37 });
    expect(km).toBeGreaterThan(0);
    const summary = summarizeKdsDriverEtaTracking([
      ticket({ band: "on_time", gpsFresh: true }),
      ticket({ orderId: "ord-2", band: "late", gpsFresh: false, dispatchStatus: "QUOTE" }),
    ]);
    expect(summary.activeDeliveryCount).toBe(2);
    expect(summary.onTimeCount).toBe(1);
    expect(summary.lateCount).toBe(1);
    expect(summary.awaitingDriverCount).toBe(1);
  });

  it("passes wiring audit", () => {
    const audit = auditKdsDriverEtaTrackingWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of KDS_DRIVER_ETA_TRACKING_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(KDS_DRIVER_ETA_TRACKING_UNIT_TEST).toBe(
      "tests/unit/kds-driver-eta-tracking-absolute-final.test.ts",
    );
  });
});
