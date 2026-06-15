/**
 * Owner Daily Briefing telemetry — TTV proof and click instrumentation.
 * @see app/api/telemetry/briefing/route.ts
 */

export const BRIEFING_TELEMETRY_POLICY_ID = "briefing-telemetry-v1" as const;

export const BRIEFING_TELEMETRY_EVENT_NAMES = [
  "briefing_click",
  "briefing_view",
  "ai_briefing_feedback",
] as const;

export type BriefingTelemetryEventName = (typeof BRIEFING_TELEMETRY_EVENT_NAMES)[number];

export const BRIEFING_TELEMETRY_SURFACES = [
  "next_action",
  "ranked_action",
  "hero_tile",
  "risk_signal",
  "production_lane",
  "pilot_lane",
  "integration_lane",
  "operational_empty",
  "briefing_hero",
  "ai_briefing_section",
] as const;

export type BriefingTelemetrySurface = (typeof BRIEFING_TELEMETRY_SURFACES)[number];

export type BriefingTelemetryPayload = {
  eventName: BriefingTelemetryEventName;
  surface: BriefingTelemetrySurface;
  entityId: string;
  hrefPath?: string;
  rolePack?: string;
  linkState?: string;
  category?: string;
  severity?: string;
  rank?: number;
};

/** Default lookback for TTV / engagement summaries. */
export const BRIEFING_TELEMETRY_SUMMARY_DAYS = 30 as const;

export const BRIEFING_TELEMETRY_API_ROUTE = "/api/telemetry/briefing" as const;
