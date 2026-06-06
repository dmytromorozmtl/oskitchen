import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  GRUBHUB_LIVE_SMOKE_ERA152_CANONICAL_POLICY_ID,
  GRUBHUB_LIVE_SMOKE_ERA152_CAPABILITIES,
  GRUBHUB_LIVE_SMOKE_ERA152_INTEGRATION_HEALTH_PATH,
  GRUBHUB_LIVE_SMOKE_ERA152_POLICY_ID,
  GRUBHUB_LIVE_SMOKE_ERA152_SUMMARY_ARTIFACT,
  GRUBHUB_LIVE_SMOKE_ERA152_WIRING_PATHS,
} from "@/lib/integrations/grubhub-live-smoke-era152-policy";
import { GRUBHUB_LIVE_SMOKE_ERA78_POLICY_ID } from "@/lib/integrations/grubhub-live-smoke-era78-policy";
import {
  auditGrubhubLiveSmokeEra152Wiring,
  buildGrubhubLiveSmokeEra152Summary,
  resolveGrubhubLiveSmokeEra152ProofStatus,
} from "@/lib/integrations/grubhub-live-smoke-era152-smoke-summary";
import { statusSyncTopicForSmoke } from "@/services/integrations/grubhub-live-smoke-service";

const ROOT = process.cwd();

describe("grubhub live smoke era152", () => {
  it("locks era152 policy and artifact path", () => {
    expect(GRUBHUB_LIVE_SMOKE_ERA152_POLICY_ID).toBe("era152-grubhub-live-v1");
    expect(GRUBHUB_LIVE_SMOKE_ERA152_SUMMARY_ARTIFACT).toBe(
      "artifacts/grubhub-live-smoke-era152-smoke-summary.json",
    );
    expect(GRUBHUB_LIVE_SMOKE_ERA152_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
    expect(GRUBHUB_LIVE_SMOKE_ERA152_WIRING_PATHS).toHaveLength(7);
    expect(GRUBHUB_LIVE_SMOKE_ERA152_CAPABILITIES).toHaveLength(5);
  });

  it("aligns era152 with canonical Grubhub live smoke policy", () => {
    expect(GRUBHUB_LIVE_SMOKE_ERA152_CANONICAL_POLICY_ID).toBe(
      GRUBHUB_LIVE_SMOKE_ERA78_POLICY_ID,
    );
  });

  it("audits in-repo Grubhub LIVE integration wiring", () => {
    const audit = auditGrubhubLiveSmokeEra152Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of GRUBHUB_LIVE_SMOKE_ERA152_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes OAuth webhook menu sync KDS wiring", () => {
    const menuSync = readFileSync(
      join(ROOT, "services/integrations/grubhub/menu-sync.service.ts"),
      "utf8",
    );
    expect(menuSync.length).toBeGreaterThan(0);

    const smoke = readFileSync(join(ROOT, "scripts/smoke-grubhub-live.ts"), "utf8");
    expect(smoke).toContain("kds_kitchen_import");
    expect(smoke).toContain("status_sync_wiring");
    expect(statusSyncTopicForSmoke()).toBe("orders");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveGrubhubLiveSmokeEra152ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveGrubhubLiveSmokeEra152ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildGrubhubLiveSmokeEra152Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("menu_sync");
  });
});
