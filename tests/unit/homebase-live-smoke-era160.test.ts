import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  HOMEBASE_LIVE_SMOKE_ERA160_CANONICAL_POLICY_ID,
  HOMEBASE_LIVE_SMOKE_ERA160_CAPABILITIES,
  HOMEBASE_LIVE_SMOKE_ERA160_INTEGRATION_HEALTH_PATH,
  HOMEBASE_LIVE_SMOKE_ERA160_POLICY_ID,
  HOMEBASE_LIVE_SMOKE_ERA160_SUMMARY_ARTIFACT,
  HOMEBASE_LIVE_SMOKE_ERA160_WIRING_PATHS,
} from "@/lib/integrations/homebase-live-smoke-era160-policy";
import {
  auditHomebaseLiveSmokeEra160Wiring,
  buildHomebaseLiveSmokeEra160Summary,
  resolveHomebaseLiveSmokeEra160ProofStatus,
} from "@/lib/integrations/homebase-live-smoke-era160-smoke-summary";
import { HOMEBASE_LIVE_SMOKE_ERA83_POLICY_ID } from "@/lib/integrations/homebase-live-smoke-era83-policy";

const ROOT = process.cwd();

describe("homebase live smoke era160", () => {
  it("locks era160 policy and artifact path", () => {
    expect(HOMEBASE_LIVE_SMOKE_ERA160_POLICY_ID).toBe("era160-homebase-live-v1");
    expect(HOMEBASE_LIVE_SMOKE_ERA160_SUMMARY_ARTIFACT).toBe(
      "artifacts/homebase-live-smoke-era160-smoke-summary.json",
    );
    expect(HOMEBASE_LIVE_SMOKE_ERA160_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
    expect(HOMEBASE_LIVE_SMOKE_ERA160_WIRING_PATHS).toHaveLength(8);
    expect(HOMEBASE_LIVE_SMOKE_ERA160_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era160 with canonical Homebase live smoke policy", () => {
    expect(HOMEBASE_LIVE_SMOKE_ERA160_CANONICAL_POLICY_ID).toBe(
      HOMEBASE_LIVE_SMOKE_ERA83_POLICY_ID,
    );
  });

  it("audits in-repo Homebase LIVE integration wiring", () => {
    const audit = auditHomebaseLiveSmokeEra160Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of HOMEBASE_LIVE_SMOKE_ERA160_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes OAuth time clock and schedule wiring", () => {
    const smoke = readFileSync(join(ROOT, "scripts/smoke-homebase-live.ts"), "utf8");
    expect(smoke).toContain("schedule_import_wiring");
    expect(smoke).toContain("time_clock_wiring");
    expect(smoke).toContain("syncHomebaseScheduleImport");
    expect(smoke).toContain("syncHomebaseTimeClock");

    const scheduleImport = readFileSync(
      join(ROOT, "services/integrations/homebase/schedule-import.service.ts"),
      "utf8",
    );
    expect(scheduleImport).toContain("syncHomebaseScheduleImport");

    const scheduleExport = readFileSync(
      join(ROOT, "services/integrations/homebase/schedule-export.service.ts"),
      "utf8",
    );
    expect(scheduleExport).toContain("syncHomebaseScheduleExport");

    const timeClock = readFileSync(
      join(ROOT, "services/integrations/homebase/time-clock.service.ts"),
      "utf8",
    );
    expect(timeClock).toContain("syncHomebaseTimeClock");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveHomebaseLiveSmokeEra160ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveHomebaseLiveSmokeEra160ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildHomebaseLiveSmokeEra160Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("time_clock");
    expect(summary.capabilities).toContain("schedule");
  });
});
