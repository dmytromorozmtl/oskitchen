import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  KDS_STAGING_SMOKE_ENTRY_ROUTES,
  KDS_STAGING_SMOKE_HONEST_SCOPE,
  KDS_STAGING_SMOKE_MANUAL_STAGES,
} from "@/lib/kitchen/kds-staging-smoke-policy";

const ROOT = process.cwd();

describe("KDS staging smoke wiring", () => {
  it("has checklist with automated, DB smoke, and manual UI tiers", () => {
    const checklist = readFileSync(
      join(ROOT, KDS_STAGING_SMOKE_HONEST_SCOPE.stagingChecklistDoc),
      "utf8",
    );
    expect(checklist).toContain("Tier A");
    expect(checklist).toContain("Tier B");
    expect(checklist).toContain("Tier C");
    expect(checklist).toMatch(/rush[- ]?hour|does not prove/i);
    expect(checklist).toMatch(/Bump|Recall/);
    expect(checklist).toMatch(/elapsed timer/i);
    expect(checklist).toMatch(/Realtime|poll window/i);
    expect(KDS_STAGING_SMOKE_MANUAL_STAGES.length).toBeGreaterThan(0);
  });

  it("smoke script references policy and queue services", () => {
    const script = readFileSync(
      join(ROOT, KDS_STAGING_SMOKE_HONEST_SCOPE.stagingDbSmokeScript),
      "utf8",
    );
    expect(script).toContain("KDS_STAGING_SMOKE_POLICY_ID");
    expect(script).toContain("getTodayQueue");
    expect(script).toContain("getDailyKdsOrders");
    expect(script).toContain("bump_to_ready");
  });

  it("documents kitchen entry routes in checklist", () => {
    const checklist = readFileSync(
      join(ROOT, KDS_STAGING_SMOKE_HONEST_SCOPE.stagingChecklistDoc),
      "utf8",
    );
    for (const route of KDS_STAGING_SMOKE_ENTRY_ROUTES) {
      expect(checklist, route).toContain(route.split("?")[0]!);
    }
  });

  it("daily KDS actions remain permissioned", () => {
    expect(existsSync(join(ROOT, "actions/kitchen-daily-kds.ts"))).toBe(true);
    const source = readFileSync(join(ROOT, "actions/kitchen-daily-kds.ts"), "utf8");
    expect(source).toContain("kitchen.bump");
    expect(source).toContain("kitchen.recall");
    expect(source).toContain("requireMutationPermission");
  });
});
