import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const PLAN_PATH = join(process.cwd(), "docs/multi-location-reporting-plan.md");
const ENTERPRISE_PATH = join(process.cwd(), "docs/enterprise-mvp-spec.md");
const ML_ANALYTICS_PATH = join(process.cwd(), "services/analytics/multi-location-analytics.ts");
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("multi-location reporting plan doc", () => {
  it("exists with layers, phases, and analytics references", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    expect(doc).toContain("# Multi-location consolidated reporting plan — OS Kitchen");
    expect(doc).toContain("multi-location-reporting-plan-v1");
    expect(doc).toContain("multi-location-analytics.ts");
    expect(doc).toContain("/dashboard/locations/dashboard");
    expect(doc).toContain("multi-location-weekly-report");
    expect(doc).toContain("executive-dashboard-service");
    expect(doc).toContain("## Phase 2 — Pilot certification checklist");
    expect(doc).toContain("franchise-management-plan.md");
  });

  it("reflects NO-GO baseline and partial rollup honesty", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    const enterprise = readFileSync(ENTERPRISE_PATH, "utf8");
    const analytics = readFileSync(ML_ANALYTICS_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
    };
    expect(pilot.decision).toBe("NO-GO");
    expect(doc).toContain("placeholder rollups");
    expect(doc).toContain("sales-safe-claims-registry.md");
    expect(doc).toContain("franchise royalty");
    expect(enterprise).toContain("rollups placeholder");
    expect(analytics).toContain("MultiLocationAnalyticsSnapshot");
  });
});
