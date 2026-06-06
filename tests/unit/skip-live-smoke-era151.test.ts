import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SKIP_LIVE_SMOKE_ERA151_CANONICAL_POLICY_ID,
  SKIP_LIVE_SMOKE_ERA151_CAPABILITIES,
  SKIP_LIVE_SMOKE_ERA151_INTEGRATION_HEALTH_PATH,
  SKIP_LIVE_SMOKE_ERA151_POLICY_ID,
  SKIP_LIVE_SMOKE_ERA151_SUMMARY_ARTIFACT,
  SKIP_LIVE_SMOKE_ERA151_WIRING_PATHS,
} from "@/lib/integrations/skip-live-smoke-era151-policy";
import { SKIP_LIVE_SMOKE_ERA79_POLICY_ID } from "@/lib/integrations/skip-live-smoke-era79-policy";
import {
  auditSkipLiveSmokeEra151Wiring,
  buildSkipLiveSmokeEra151Summary,
  resolveSkipLiveSmokeEra151ProofStatus,
} from "@/lib/integrations/skip-live-smoke-era151-smoke-summary";
import { statusSyncTopicForSmoke } from "@/services/integrations/skip-live-smoke-service";

const ROOT = process.cwd();

describe("skip live smoke era151", () => {
  it("locks era151 policy and artifact path", () => {
    expect(SKIP_LIVE_SMOKE_ERA151_POLICY_ID).toBe("era151-skip-live-v1");
    expect(SKIP_LIVE_SMOKE_ERA151_SUMMARY_ARTIFACT).toBe(
      "artifacts/skip-live-smoke-era151-smoke-summary.json",
    );
    expect(SKIP_LIVE_SMOKE_ERA151_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
    expect(SKIP_LIVE_SMOKE_ERA151_WIRING_PATHS).toHaveLength(7);
    expect(SKIP_LIVE_SMOKE_ERA151_CAPABILITIES).toHaveLength(4);
  });

  it("aligns era151 with canonical Skip live smoke policy", () => {
    expect(SKIP_LIVE_SMOKE_ERA151_CANONICAL_POLICY_ID).toBe(SKIP_LIVE_SMOKE_ERA79_POLICY_ID);
  });

  it("audits in-repo Skip/Just Eat LIVE integration wiring", () => {
    const audit = auditSkipLiveSmokeEra151Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of SKIP_LIVE_SMOKE_ERA151_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes OAuth webhook KDS status sync wiring", () => {
    const smoke = readFileSync(join(ROOT, "scripts/smoke-skip-live.ts"), "utf8");
    expect(smoke).toContain("kds_kitchen_import");
    expect(smoke).toContain("status_sync_wiring");
    expect(statusSyncTopicForSmoke()).toBe("orders");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveSkipLiveSmokeEra151ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveSkipLiveSmokeEra151ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildSkipLiveSmokeEra151Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("kds_import");
  });
});
