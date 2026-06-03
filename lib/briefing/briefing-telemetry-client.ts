"use client";

import { captureProductEvent } from "@/lib/analytics/product-events";
import {
  BRIEFING_TELEMETRY_API_ROUTE,
  type BriefingTelemetryPayload,
} from "@/lib/briefing/briefing-telemetry-policy";

/** Fire-and-forget server persistence (complements optional PostHog). */
export function persistBriefingTelemetry(payload: BriefingTelemetryPayload): void {
  if (typeof window === "undefined") return;

  void fetch(BRIEFING_TELEMETRY_API_ROUTE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    /* non-blocking — analytics must not break navigation */
  });
}

export function trackBriefingClick(payload: BriefingTelemetryPayload): void {
  captureProductEvent("briefing_click", {
    surface: payload.surface,
    entity_id: payload.entityId,
    role_pack: payload.rolePack,
    href_path: payload.hrefPath,
    link_state: payload.linkState,
    category: payload.category,
    severity: payload.severity,
    rank: payload.rank,
  });
  persistBriefingTelemetry({ ...payload, eventName: "briefing_click" });
}

export function trackBriefingView(payload: Omit<BriefingTelemetryPayload, "eventName">): void {
  captureProductEvent("briefing_view", {
    surface: payload.surface,
    entity_id: payload.entityId,
    role_pack: payload.rolePack,
    category: payload.category,
  });
  persistBriefingTelemetry({ ...payload, eventName: "briefing_view" });
}
