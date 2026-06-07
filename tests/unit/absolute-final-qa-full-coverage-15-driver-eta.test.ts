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
  KDS_DRIVER_ETA_TRACKING_HONESTY_MARKERS,
  KDS_DRIVER_ETA_TRACKING_PILLARS,
  KDS_DRIVER_ETA_TRACKING_ROUTE,
  parseDispatchGpsPayload,
  summarizeKdsDriverEtaTracking,
  type KdsDriverEtaTicket,
} from "@/lib/kitchen/kds-driver-eta-tracking-absolute-final-policy";
import { KDS_DRIVER_ETA_DISPATCH_STATUS_LABELS } from "@/lib/kitchen/kds-driver-eta-tracking-content";
import { auditQaFullCoverageSlot } from "@/lib/qa/absolute-final-qa-full-coverage-audit";
import {
  getQaFullCoverageSlot,
  QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/qa/absolute-final-qa-full-coverage-policy";

const ROOT = process.cwd();
/** Absolute Final Task 115 — QA full coverage for feature 100 driver ETA tracking in KDS */
const TASK = 115;
const FEATURE = 100;

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

describe(`QA full coverage — driver ETA tracking in KDS (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks QA registry slot 115 → feature 100 KDS driver ETA tracking", () => {
    expect(QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-qa-full-coverage-v1");
    const slot = getQaFullCoverageSlot(TASK);
    expect(slot?.featureKey).toBe("kds-driver-eta-tracking");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.baseCertTest).toBe("tests/unit/kds-driver-eta-tracking-absolute-final.test.ts");
    expect(KDS_DRIVER_ETA_TRACKING_PILLARS).toHaveLength(5);
    expect(KDS_DRIVER_ETA_TRACKING_ROUTE).toBe("/dashboard/kitchen/driver-eta");
    expect(KDS_DRIVER_ETA_MIN_TOUCH_PX).toBe(44);
    expect(KDS_DRIVER_ETA_GPS_STALE_MINUTES).toBe(8);
  });

  it("parses GPS payload and detects fresh vs stale pings", () => {
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
    expect(parseDispatchGpsPayload(null)).toEqual({ pings: [], last: null });
  });

  it("estimates ETA from dispatch movement and classifies bands", () => {
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
    expect(
      classifyDriverEtaBand({
        etaMinutes: 15,
        windowEnd: new Date("2026-06-06T18:05:00.000Z"),
        dispatchStatus: "DROPOFF",
        gpsFresh: true,
        now,
      }),
    ).toBe("late");
    expect(
      buildDriverEtaLabel({ dispatchStatus: "DROPOFF", etaMinutes: 8, gpsFresh: false }),
    ).toContain("GPS stale");
  });

  it("summarizes delivery ticket counts and haversine distance", () => {
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
    expect(KDS_DRIVER_ETA_DISPATCH_STATUS_LABELS.DROPOFF).toBe("En route");
  });

  it("documents honesty markers — BETA, estimated ETA, not live GPS certified", () => {
    const screen = readFileSync(
      join(ROOT, "components/kitchen/kds-driver-eta-screen.tsx"),
      "utf8",
    );
    const page = readFileSync(join(ROOT, "app/dashboard/kitchen/driver-eta/page.tsx"), "utf8");
    const combined = `${screen}\n${page}`;

    for (const marker of KDS_DRIVER_ETA_TRACKING_HONESTY_MARKERS) {
      expect(
        combined.includes(marker) || combined.toLowerCase().includes(marker.toLowerCase()),
      ).toBe(true);
    }
  });

  it("wires driver ETA UI — ticket cards, band badges, GPS freshness, 44px touch", () => {
    const screen = readFileSync(
      join(ROOT, "components/kitchen/kds-driver-eta-screen.tsx"),
      "utf8",
    );

    expect(screen).toContain('data-testid="kds-driver-eta-screen"');
    expect(screen).toContain('data-testid="kds-driver-eta-ticket"');
    expect(screen).toContain("KDS_DRIVER_ETA_MIN_TOUCH_PX");
    expect(screen).toContain("gps_freshness_indicator");
    expect(screen).toContain("eta_countdown_labels");
    expect(screen).toContain("kds_ticket_cross_link");
    expect(screen).toContain("dispatch_status_badges");
    expect(screen).toContain("dark:text-amber-400");
    for (const pillar of KDS_DRIVER_ETA_TRACKING_PILLARS) {
      expect(screen).toContain(pillar);
    }
  });

  it("wires page, strip, expo page, and delivery dispatch service", () => {
    const page = readFileSync(join(ROOT, "app/dashboard/kitchen/driver-eta/page.tsx"), "utf8");
    const strip = readFileSync(join(ROOT, "components/kitchen/kds-driver-eta-strip.tsx"), "utf8");
    const expoPage = readFileSync(join(ROOT, "app/dashboard/kitchen/expo/page.tsx"), "utf8");
    const service = readFileSync(
      join(ROOT, "services/kitchen/kds-driver-eta-tracking-service.ts"),
      "utf8",
    );

    expect(page).toContain("loadKdsDriverEtaTrackingModel");
    expect(page).toContain("kitchen.view");
    expect(page).toContain("Driver ETA tracking in KDS");
    expect(strip).toContain("KDS_DRIVER_ETA_TRACKING_ROUTE");
    expect(expoPage).toContain("KdsDriverEtaStrip");
    expect(service).toContain("parseDispatchGpsPayload");
    expect(service).toContain("fulfillmentType: \"DELIVERY\"");
    expect(service).toContain("deliveryDispatches");
  });

  it("passes base wiring audit and QA slot 115 audit gate", () => {
    const wiring = auditKdsDriverEtaTrackingWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);

    const qa = auditQaFullCoverageSlot(TASK, ROOT);
    expect(qa.ok, qa.failures.join("; ")).toBe(true);
    expect(qa.slot?.qaTest).toBe(
      "tests/unit/absolute-final-qa-full-coverage-15-driver-eta.test.ts",
    );
    expect(KDS_DRIVER_ETA_TRACKING_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "kds-driver-eta-tracking-absolute-final-v1",
    );
  });
});
