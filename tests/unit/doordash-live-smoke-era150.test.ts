import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  DOORDASH_LIVE_SMOKE_ERA150_CANONICAL_POLICY_ID,
  DOORDASH_LIVE_SMOKE_ERA150_CAPABILITIES,
  DOORDASH_LIVE_SMOKE_ERA150_INTEGRATION_HEALTH_PATH,
  DOORDASH_LIVE_SMOKE_ERA150_POLICY_ID,
  DOORDASH_LIVE_SMOKE_ERA150_SUMMARY_ARTIFACT,
  DOORDASH_LIVE_SMOKE_ERA150_WIRING_PATHS,
} from "@/lib/integrations/doordash-live-smoke-era150-policy";
import { DOORDASH_LIVE_SMOKE_ERA77_POLICY_ID } from "@/lib/integrations/doordash-live-smoke-era77-policy";
import {
  auditDoorDashLiveSmokeEra150Wiring,
  buildDoorDashLiveSmokeEra150Summary,
  resolveDoorDashLiveSmokeEra150ProofStatus,
} from "@/lib/integrations/doordash-live-smoke-era150-smoke-summary";
import { statusSyncTopicForSmoke } from "@/services/integrations/doordash-live-smoke-service";

const ROOT = process.cwd();

describe("doordash live smoke era150", () => {
  it("locks era150 policy and artifact path", () => {
    expect(DOORDASH_LIVE_SMOKE_ERA150_POLICY_ID).toBe("era150-doordash-live-v1");
    expect(DOORDASH_LIVE_SMOKE_ERA150_SUMMARY_ARTIFACT).toBe(
      "artifacts/doordash-live-smoke-era150-smoke-summary.json",
    );
    expect(DOORDASH_LIVE_SMOKE_ERA150_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
    expect(DOORDASH_LIVE_SMOKE_ERA150_WIRING_PATHS).toHaveLength(7);
    expect(DOORDASH_LIVE_SMOKE_ERA150_CAPABILITIES).toHaveLength(6);
  });

  it("aligns era150 with canonical DoorDash live smoke policy", () => {
    expect(DOORDASH_LIVE_SMOKE_ERA150_CANONICAL_POLICY_ID).toBe(
      DOORDASH_LIVE_SMOKE_ERA77_POLICY_ID,
    );
  });

  it("audits in-repo DoorDash LIVE integration wiring", () => {
    const audit = auditDoorDashLiveSmokeEra150Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of DOORDASH_LIVE_SMOKE_ERA150_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes Drive API webhook menu sync KDS wiring", () => {
    const marketplace = readFileSync(
      join(ROOT, "services/integrations/doordash/doordash-marketplace.ts"),
      "utf8",
    );
    expect(marketplace.length).toBeGreaterThan(0);

    const menuSync = readFileSync(
      join(ROOT, "services/integrations/doordash/menu-sync.service.ts"),
      "utf8",
    );
    expect(menuSync.length).toBeGreaterThan(0);

    const smoke = readFileSync(join(ROOT, "scripts/smoke-doordash-live.ts"), "utf8");
    expect(smoke).toContain("kds_kitchen_import");
    expect(smoke).toContain("status_sync_wiring");
    expect(statusSyncTopicForSmoke()).toBe("orders");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveDoorDashLiveSmokeEra150ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveDoorDashLiveSmokeEra150ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildDoorDashLiveSmokeEra150Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("menu_sync");
  });
});
