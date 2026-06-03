import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  BRIEFING_TELEMETRY_API_ROUTE,
  BRIEFING_TELEMETRY_EVENT_NAMES,
  BRIEFING_TELEMETRY_POLICY_ID,
  BRIEFING_TELEMETRY_SURFACES,
} from "@/lib/briefing/briefing-telemetry-policy";

const ROOT = process.cwd();

describe("briefing telemetry pipeline", () => {
  it("defines policy events and surfaces including view + AI sections", () => {
    expect(BRIEFING_TELEMETRY_POLICY_ID).toBe("briefing-telemetry-v1");
    expect(BRIEFING_TELEMETRY_EVENT_NAMES).toContain("briefing_click");
    expect(BRIEFING_TELEMETRY_EVENT_NAMES).toContain("briefing_view");
    expect(BRIEFING_TELEMETRY_SURFACES).toContain("briefing_hero");
    expect(BRIEFING_TELEMETRY_SURFACES).toContain("ai_briefing_section");
    expect(BRIEFING_TELEMETRY_API_ROUTE).toBe("/api/telemetry/briefing");
  });

  it("persists clicks via client helper and API route", () => {
    const client = readFileSync(join(ROOT, "lib/briefing/briefing-telemetry-client.ts"), "utf8");
    expect(client).toContain("persistBriefingTelemetry");
    expect(client).toContain("BRIEFING_TELEMETRY_API_ROUTE");
    expect(client).toContain("keepalive: true");

    const link = readFileSync(
      join(ROOT, "components/dashboard/briefing-telemetry-link.tsx"),
      "utf8",
    );
    expect(link).toContain("trackBriefingClick");

    const route = readFileSync(join(ROOT, "app/api/telemetry/briefing/route.ts"), "utf8");
    expect(route).toContain("briefing_telemetry");
    expect(route).toContain("BRIEFING_TELEMETRY_EVENT_NAMES");
  });

  it("records briefing_view on hero mount", () => {
    const hero = readFileSync(
      join(ROOT, "components/dashboard/owner-daily-briefing-hero.tsx"),
      "utf8",
    );
    expect(hero).toContain("BriefingTelemetryPageView");
    const pageView = readFileSync(
      join(ROOT, "components/dashboard/briefing-telemetry-page-view.tsx"),
      "utf8",
    );
    expect(pageView).toContain("trackBriefingView");
  });

  it("aggregates engagement in briefing telemetry service", () => {
    const service = readFileSync(
      join(ROOT, "services/briefing/briefing-telemetry-service.ts"),
      "utf8",
    );
    expect(service).toContain("loadBriefingTelemetrySummary");
    expect(service).toContain("viewCount");
    expect(service).toContain("clickCount");
    expect(service).toContain("topHrefs");
  });

  it("instruments AI briefing section cards", () => {
    const panel = readFileSync(join(ROOT, "components/dashboard/ai-briefing-panel.tsx"), "utf8");
    expect(panel).toContain('surface="ai_briefing_section"');
  });
});
