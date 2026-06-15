import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  KLAVIYO_LIVE_SMOKE_ERA161_CANONICAL_POLICY_ID,
  KLAVIYO_LIVE_SMOKE_ERA161_CAPABILITIES,
  KLAVIYO_LIVE_SMOKE_ERA161_INTEGRATION_HEALTH_PATH,
  KLAVIYO_LIVE_SMOKE_ERA161_POLICY_ID,
  KLAVIYO_LIVE_SMOKE_ERA161_SUMMARY_ARTIFACT,
  KLAVIYO_LIVE_SMOKE_ERA161_WIRING_PATHS,
} from "@/lib/integrations/klaviyo-live-smoke-era161-policy";
import {
  auditKlaviyoLiveSmokeEra161Wiring,
  buildKlaviyoLiveSmokeEra161Summary,
  resolveKlaviyoLiveSmokeEra161ProofStatus,
} from "@/lib/integrations/klaviyo-live-smoke-era161-smoke-summary";
import { KLAVIYO_LIVE_SMOKE_ERA84_POLICY_ID } from "@/lib/integrations/klaviyo-live-smoke-era84-policy";

const ROOT = process.cwd();

describe("klaviyo live smoke era161", () => {
  it("locks era161 policy and artifact path", () => {
    expect(KLAVIYO_LIVE_SMOKE_ERA161_POLICY_ID).toBe("era161-klaviyo-live-v1");
    expect(KLAVIYO_LIVE_SMOKE_ERA161_SUMMARY_ARTIFACT).toBe(
      "artifacts/klaviyo-live-smoke-era161-smoke-summary.json",
    );
    expect(KLAVIYO_LIVE_SMOKE_ERA161_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
    expect(KLAVIYO_LIVE_SMOKE_ERA161_WIRING_PATHS).toHaveLength(8);
    expect(KLAVIYO_LIVE_SMOKE_ERA161_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era161 with canonical Klaviyo live smoke policy", () => {
    expect(KLAVIYO_LIVE_SMOKE_ERA161_CANONICAL_POLICY_ID).toBe(
      KLAVIYO_LIVE_SMOKE_ERA84_POLICY_ID,
    );
  });

  it("audits in-repo Klaviyo LIVE integration wiring", () => {
    const audit = auditKlaviyoLiveSmokeEra161Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of KLAVIYO_LIVE_SMOKE_ERA161_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes API key campaign triggers and segment export wiring", () => {
    const smoke = readFileSync(join(ROOT, "scripts/smoke-klaviyo-live.ts"), "utf8");
    expect(smoke).toContain("segment_export_wiring");
    expect(smoke).toContain("campaign_trigger_wiring");
    expect(smoke).toContain("exportKlaviyoSegmentProfiles");
    expect(smoke).toContain("triggerKlaviyoCampaignBatch");

    const campaigns = readFileSync(
      join(ROOT, "services/integrations/klaviyo/campaign-triggers.service.ts"),
      "utf8",
    );
    expect(campaigns).toContain("triggerKlaviyoCampaignBatch");

    const segments = readFileSync(
      join(ROOT, "services/integrations/klaviyo/segment-export.service.ts"),
      "utf8",
    );
    expect(segments).toContain("exportKlaviyoSegmentProfiles");

    const api = readFileSync(join(ROOT, "services/integrations/klaviyo/klaviyo-api.ts"), "utf8");
    expect(api).toContain("verifyKlaviyoApiKey");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveKlaviyoLiveSmokeEra161ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveKlaviyoLiveSmokeEra161ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildKlaviyoLiveSmokeEra161Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("campaign_triggers");
    expect(summary.capabilities).toContain("segment_export");
  });
});
