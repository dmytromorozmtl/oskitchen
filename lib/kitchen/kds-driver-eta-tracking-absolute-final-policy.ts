/**
 * Absolute Final Task 100 — driver ETA tracking in KDS.
 *
 * @see app/dashboard/kitchen/driver-eta/page.tsx
 * @see components/kitchen/kds-driver-eta-screen.tsx
 */

export const KDS_DRIVER_ETA_TRACKING_ABSOLUTE_FINAL_POLICY_ID =
  "kds-driver-eta-tracking-absolute-final-v1" as const;

export const KDS_DRIVER_ETA_TRACKING_ROUTE = "/dashboard/kitchen/driver-eta" as const;

export const KDS_DRIVER_ETA_TRACKING_PAGE_PATH =
  "app/dashboard/kitchen/driver-eta/page.tsx" as const;

export const KDS_DRIVER_ETA_TRACKING_COMPONENT_PATH =
  "components/kitchen/kds-driver-eta-screen.tsx" as const;

export const KDS_DRIVER_ETA_TRACKING_SERVICE_PATH =
  "services/kitchen/kds-driver-eta-tracking-service.ts" as const;

export const KDS_DRIVER_ETA_TRACKING_CONTENT_PATH =
  "lib/kitchen/kds-driver-eta-tracking-content.ts" as const;

export const KDS_DRIVER_ETA_TRACKING_STRIP_PATH =
  "components/kitchen/kds-driver-eta-strip.tsx" as const;

export const KDS_DRIVER_ETA_TRACKING_EXPO_PAGE =
  "app/dashboard/kitchen/expo/page.tsx" as const;

export const KDS_DRIVER_ETA_TRACKING_PILLARS = [
  "dispatch_status_badges",
  "eta_countdown_labels",
  "gps_freshness_indicator",
  "kds_ticket_cross_link",
  "large_touch_targets",
] as const;

export const KDS_DRIVER_ETA_MIN_TOUCH_PX = 44 as const;

export const KDS_DRIVER_ETA_DEFAULT_SPEED_KMH = 28 as const;

export const KDS_DRIVER_ETA_GPS_STALE_MINUTES = 8 as const;

export type KdsDriverEtaBand = "on_time" | "at_risk" | "late" | "unknown";

export type KdsDriverEtaGpsPing = {
  lat: number;
  lng: number;
  recordedAt: string;
  driverLabel?: string | null;
};

export type KdsDriverEtaTicket = {
  orderId: string;
  ticketNumber: string;
  customerName: string;
  kdsStatus: string;
  dispatchStatus: string | null;
  dispatchProvider: string | null;
  driverLabel: string | null;
  etaMinutes: number | null;
  etaLabel: string;
  band: KdsDriverEtaBand;
  gpsFresh: boolean;
  lastPingAt: string | null;
  trackingUrl: string | null;
  windowEnd: string | null;
  href: string;
};

export type KdsDriverEtaTrackingSummary = {
  activeDeliveryCount: number;
  onTimeCount: number;
  atRiskCount: number;
  lateCount: number;
  gpsLiveCount: number;
  awaitingDriverCount: number;
};

export type KdsDriverEtaTrackingModel = {
  policyId: typeof KDS_DRIVER_ETA_TRACKING_ABSOLUTE_FINAL_POLICY_ID;
  tickets: KdsDriverEtaTicket[];
  summary: KdsDriverEtaTrackingSummary;
  refreshedAt: string;
};

export const KDS_DRIVER_ETA_TRACKING_REQUIRED_MARKERS = [
  'data-testid="kds-driver-eta-screen"',
  "kds-driver-eta-ticket",
] as const;

export const KDS_DRIVER_ETA_TRACKING_HONESTY_MARKERS = [
  "BETA",
  "estimated ETA",
  "not live GPS certified",
  "Do not claim",
  "Driver ETA",
] as const;

export const KDS_DRIVER_ETA_TRACKING_WIRING_PATHS = [
  KDS_DRIVER_ETA_TRACKING_PAGE_PATH,
  KDS_DRIVER_ETA_TRACKING_COMPONENT_PATH,
  KDS_DRIVER_ETA_TRACKING_SERVICE_PATH,
  KDS_DRIVER_ETA_TRACKING_CONTENT_PATH,
  KDS_DRIVER_ETA_TRACKING_STRIP_PATH,
  KDS_DRIVER_ETA_TRACKING_EXPO_PAGE,
  "lib/kitchen/kds-driver-eta-tracking-absolute-final-policy.ts",
  "lib/kitchen/kds-driver-eta-tracking-audit.ts",
  "tests/unit/kds-driver-eta-tracking-absolute-final.test.ts",
] as const;

export const KDS_DRIVER_ETA_TRACKING_UNIT_TEST =
  "tests/unit/kds-driver-eta-tracking-absolute-final.test.ts" as const;

export const KDS_DRIVER_ETA_TRACKING_CI_SCRIPTS = [
  "test:ci:kds-driver-eta-tracking",
  "test:ci:kds-driver-eta-tracking:cert",
] as const;

export function parseDispatchGpsPayload(raw: unknown): {
  pings: KdsDriverEtaGpsPing[];
  last: KdsDriverEtaGpsPing | null;
} {
  if (!raw || typeof raw !== "object") return { pings: [], last: null };
  const o = raw as { pings?: unknown; last?: unknown };
  const pings = Array.isArray(o.pings)
    ? o.pings.filter(
        (p): p is KdsDriverEtaGpsPing =>
          !!p &&
          typeof p === "object" &&
          typeof (p as KdsDriverEtaGpsPing).lat === "number" &&
          typeof (p as KdsDriverEtaGpsPing).lng === "number" &&
          typeof (p as KdsDriverEtaGpsPing).recordedAt === "string",
      )
    : [];
  const last =
    o.last &&
    typeof o.last === "object" &&
    typeof (o.last as KdsDriverEtaGpsPing).recordedAt === "string"
      ? (o.last as KdsDriverEtaGpsPing)
      : pings[pings.length - 1] ?? null;
  return { pings, last };
}

export function isGpsPingFresh(recordedAt: string | null, nowMs = Date.now()): boolean {
  if (!recordedAt) return false;
  const ageMin = (nowMs - new Date(recordedAt).getTime()) / 60000;
  return ageMin >= 0 && ageMin <= KDS_DRIVER_ETA_GPS_STALE_MINUTES;
}

export function estimateDriverEtaMinutes(input: {
  dispatchStatus: string | null;
  lastPing: KdsDriverEtaGpsPing | null;
  pings: readonly KdsDriverEtaGpsPing[];
  windowEnd: Date | null;
  now?: Date;
}): number | null {
  const now = input.now ?? new Date();
  if (input.dispatchStatus === "COMPLETED") return 0;
  if (!input.dispatchStatus || input.dispatchStatus === "QUOTE" || input.dispatchStatus === "QUOTED") {
    return null;
  }
  if (input.dispatchStatus === "SCHEDULED") return 20;
  if (input.dispatchStatus === "PICKUP") return 15;

  if (input.lastPing && isGpsPingFresh(input.lastPing.recordedAt, now.getTime())) {
    if (input.pings.length >= 2) {
      const a = input.pings[input.pings.length - 2]!;
      const b = input.pings[input.pings.length - 1]!;
      const dtHours =
        (new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()) / 3600000;
      if (dtHours > 0) {
        const distKm = haversineKm({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng });
        const speed = distKm / dtHours;
        if (speed > 2 && speed < 90) {
          return Math.max(3, Math.round((distKm / speed) * 60 * 1.2));
        }
      }
    }
    return 12;
  }

  if (input.windowEnd) {
    const mins = Math.round((input.windowEnd.getTime() - now.getTime()) / 60000);
    return mins > 0 ? mins : 5;
  }

  return null;
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function classifyDriverEtaBand(input: {
  etaMinutes: number | null;
  windowEnd: Date | null;
  dispatchStatus: string | null;
  gpsFresh: boolean;
  now?: Date;
}): KdsDriverEtaBand {
  if (input.dispatchStatus === "COMPLETED") return "on_time";
  if (input.etaMinutes == null) return "unknown";
  const now = input.now ?? new Date();
  if (input.windowEnd) {
    const minsToWindow = (input.windowEnd.getTime() - now.getTime()) / 60000;
    if (input.etaMinutes > minsToWindow + 5) return "late";
    if (input.etaMinutes > minsToWindow) return "at_risk";
    return "on_time";
  }
  if (input.etaMinutes <= 10) return "on_time";
  if (input.etaMinutes <= 20) return "at_risk";
  if (!input.gpsFresh && input.etaMinutes > 15) return "at_risk";
  return input.etaMinutes > 25 ? "late" : "at_risk";
}

export function buildDriverEtaLabel(input: {
  dispatchStatus: string | null;
  etaMinutes: number | null;
  gpsFresh: boolean;
}): string {
  if (!input.dispatchStatus || input.dispatchStatus === "QUOTE") {
    return "Awaiting dispatch quote";
  }
  if (input.dispatchStatus === "QUOTED") return "Quote ready — assign driver";
  if (input.dispatchStatus === "SCHEDULED") return "Driver scheduled";
  if (input.dispatchStatus === "PICKUP") return "Driver en route to pickup";
  if (input.dispatchStatus === "COMPLETED") return "Delivered";
  if (input.dispatchStatus === "CANCELLED" || input.dispatchStatus === "FAILED") {
    return `Dispatch ${input.dispatchStatus.toLowerCase()}`;
  }
  if (input.etaMinutes != null) {
    const gpsNote = input.gpsFresh ? "" : " · GPS stale";
    return `estimated ETA ${input.etaMinutes} min${gpsNote}`;
  }
  return "estimated ETA unknown — BETA";
}

export function summarizeKdsDriverEtaTracking(
  tickets: readonly KdsDriverEtaTicket[],
): KdsDriverEtaTrackingSummary {
  return {
    activeDeliveryCount: tickets.length,
    onTimeCount: tickets.filter((t) => t.band === "on_time").length,
    atRiskCount: tickets.filter((t) => t.band === "at_risk").length,
    lateCount: tickets.filter((t) => t.band === "late").length,
    gpsLiveCount: tickets.filter((t) => t.gpsFresh).length,
    awaitingDriverCount: tickets.filter(
      (t) => !t.dispatchStatus || t.dispatchStatus === "QUOTE" || t.dispatchStatus === "QUOTED",
    ).length,
  };
}
