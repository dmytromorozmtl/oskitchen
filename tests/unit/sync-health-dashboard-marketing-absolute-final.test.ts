import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { auditSyncHealthDashboardMarketingWiring } from "@/lib/marketing/sync-health-dashboard-marketing-audit";
import {
  SYNC_HEALTH_DASHBOARD_MARKETING_CHANNELS,
  SYNC_HEALTH_DASHBOARD_MARKETING_PATH,
} from "@/lib/marketing/sync-health-dashboard-marketing-content";
import {
  SYNC_HEALTH_DASHBOARD_MARKETING_ABSOLUTE_FINAL_POLICY_ID,
  SYNC_HEALTH_DASHBOARD_MARKETING_CI_SCRIPTS,
  SYNC_HEALTH_DASHBOARD_MARKETING_ROUTE,
  SYNC_HEALTH_DASHBOARD_MARKETING_UNIT_TEST,
  SYNC_HEALTH_INTEGRATION_HEALTH_DASHBOARD,
} from "@/lib/marketing/sync-health-dashboard-marketing-absolute-final-policy";

const ROOT = process.cwd();

describe("Sync health dashboard marketing (Absolute Final Task 83)", () => {
  it("locks absolute final policy and /sync-health route", () => {
    expect(SYNC_HEALTH_DASHBOARD_MARKETING_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "sync-health-dashboard-marketing-absolute-final-v1",
    );
    expect(SYNC_HEALTH_DASHBOARD_MARKETING_ROUTE).toBe("/sync-health");
    expect(SYNC_HEALTH_DASHBOARD_MARKETING_PATH).toBe("/sync-health");
    expect(SYNC_HEALTH_INTEGRATION_HEALTH_DASHBOARD).toBe("/dashboard/integration-health");
  });

  it("ships seven illustrative per-channel sync rows", () => {
    expect(SYNC_HEALTH_DASHBOARD_MARKETING_CHANNELS).toHaveLength(7);
    const skipped = SYNC_HEALTH_DASHBOARD_MARKETING_CHANNELS.filter((c) => c.maturity === "SKIPPED");
    expect(skipped.length).toBeGreaterThanOrEqual(3);
    expect(SYNC_HEALTH_DASHBOARD_MARKETING_CHANNELS.some((c) => c.maturity === "BETA")).toBe(true);
  });

  it("passes wiring audit", () => {
    const audit = auditSyncHealthDashboardMarketingWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of SYNC_HEALTH_DASHBOARD_MARKETING_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(SYNC_HEALTH_DASHBOARD_MARKETING_UNIT_TEST).toBe(
      "tests/unit/sync-health-dashboard-marketing-absolute-final.test.ts",
    );
  });
});
