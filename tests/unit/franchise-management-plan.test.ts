import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const PLAN_PATH = join(process.cwd(), "docs/franchise-management-plan.md");
const ML_PLAN_PATH = join(process.cwd(), "docs/multi-location-reporting-plan.md");
const FRANCHISE_SERVICE_PATH = join(
  process.cwd(),
  "services/franchise/franchise-service.ts",
);
const ROYALTIES_PAGE_PATH = join(
  process.cwd(),
  "app/dashboard/franchise/royalties/page.tsx",
);
const PILOT_SUMMARY_PATH = join(process.cwd(), "artifacts/pilot-gono-go-summary.json");

describe("franchise management plan doc", () => {
  it("exists with phases, royalties MVP, and service references", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    expect(doc).toContain("# Franchise management tools plan — OS Kitchen");
    expect(doc).toContain("franchise-management-plan-v1");
    expect(doc).toContain("calculateRoyalties");
    expect(doc).toContain("/dashboard/franchise/royalties");
    expect(doc).toContain("franchise-royalties");
    expect(doc).toContain("## Phase 2 — Franchise admin");
    expect(doc).toContain("multi-location-reporting-plan.md");
  });

  it("reflects NO-GO baseline and distinguishes franchise vs multi-location", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    const mlPlan = readFileSync(ML_PLAN_PATH, "utf8");
    const service = readFileSync(FRANCHISE_SERVICE_PATH, "utf8");
    const page = readFileSync(ROYALTIES_PAGE_PATH, "utf8");
    const pilot = JSON.parse(readFileSync(PILOT_SUMMARY_PATH, "utf8")) as {
      decision: string;
    };
    expect(pilot.decision).toBe("NO-GO");
    expect(doc).toContain("franchise engine");
    expect(doc).toContain("0");
    expect(mlPlan).toContain("franchise-management-plan.md");
    expect(service).toContain("royaltiesToCSV");
    expect(page).toContain("No active franchises configured");
  });
});
