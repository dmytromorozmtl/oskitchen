import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  UBER_EATS_LIVE_SMOKE_ERA149_CANONICAL_POLICY_ID,
  UBER_EATS_LIVE_SMOKE_ERA149_CAPABILITIES,
  UBER_EATS_LIVE_SMOKE_ERA149_INTEGRATION_HEALTH_PATH,
  UBER_EATS_LIVE_SMOKE_ERA149_POLICY_ID,
  UBER_EATS_LIVE_SMOKE_ERA149_SUMMARY_ARTIFACT,
  UBER_EATS_LIVE_SMOKE_ERA149_WIRING_PATHS,
} from "@/lib/integrations/uber-eats-live-smoke-era149-policy";
import {
  auditUberEatsLiveSmokeEra149Wiring,
  buildUberEatsLiveSmokeEra149Summary,
  resolveUberEatsLiveSmokeEra149ProofStatus,
} from "@/lib/integrations/uber-eats-live-smoke-era149-smoke-summary";
import { UBER_EATS_LIVE_SMOKE_ERA76_POLICY_ID } from "@/lib/integrations/uber-eats-live-smoke-era76-policy";
import { statusSyncTopicForSmoke } from "@/services/integrations/uber-eats-live-smoke-service";

const ROOT = process.cwd();

describe("uber eats live smoke era149", () => {
  it("locks era149 policy and artifact path", () => {
    expect(UBER_EATS_LIVE_SMOKE_ERA149_POLICY_ID).toBe("era149-uber-eats-live-v1");
    expect(UBER_EATS_LIVE_SMOKE_ERA149_SUMMARY_ARTIFACT).toBe(
      "artifacts/uber-eats-live-smoke-era149-smoke-summary.json",
    );
    expect(UBER_EATS_LIVE_SMOKE_ERA149_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
    expect(UBER_EATS_LIVE_SMOKE_ERA149_WIRING_PATHS).toHaveLength(7);
    expect(UBER_EATS_LIVE_SMOKE_ERA149_CAPABILITIES).toHaveLength(4);
  });

  it("aligns era149 with canonical Uber Eats live smoke policy", () => {
    expect(UBER_EATS_LIVE_SMOKE_ERA149_CANONICAL_POLICY_ID).toBe(
      UBER_EATS_LIVE_SMOKE_ERA76_POLICY_ID,
    );
  });

  it("audits in-repo Uber Eats LIVE integration wiring", () => {
    const audit = auditUberEatsLiveSmokeEra149Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of UBER_EATS_LIVE_SMOKE_ERA149_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes OAuth webhook KDS status sync wiring", () => {
    const smoke = readFileSync(join(ROOT, "scripts/smoke-uber-eats-live.ts"), "utf8");
    expect(smoke).toContain("kds_kitchen_import");
    expect(smoke).toContain("status_sync_wiring");
    expect(statusSyncTopicForSmoke()).toBe("orders");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveUberEatsLiveSmokeEra149ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveUberEatsLiveSmokeEra149ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildUberEatsLiveSmokeEra149Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("status_sync");
  });
});
