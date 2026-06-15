import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  KLAVIYO_LIVE_SMOKE_ERA84_INTEGRATION_HEALTH_PATH,
  KLAVIYO_LIVE_SMOKE_ERA84_POLICY_ID,
  KLAVIYO_LIVE_SMOKE_ERA84_SUMMARY_ARTIFACT,
  KLAVIYO_LIVE_SMOKE_ERA84_WIRING_PATHS,
} from "@/lib/integrations/klaviyo-live-smoke-era84-policy";
import {
  auditKlaviyoLiveSmokeWiring,
  buildKlaviyoLiveSmokeEra84Summary,
  isPlaceholderKlaviyoApiKey,
  resolveKlaviyoLiveSmokeEra84ProofStatus,
} from "@/lib/integrations/klaviyo-live-smoke-summary";

const ROOT = process.cwd();

describe("klaviyo live smoke era84", () => {
  it("locks era84 policy and artifact path", () => {
    expect(KLAVIYO_LIVE_SMOKE_ERA84_POLICY_ID).toBe("era84-klaviyo-live-smoke-v1");
    expect(KLAVIYO_LIVE_SMOKE_ERA84_SUMMARY_ARTIFACT).toBe(
      "artifacts/klaviyo-live-smoke-summary.json",
    );
    expect(KLAVIYO_LIVE_SMOKE_ERA84_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
  });

  it("detects placeholder Klaviyo API keys", () => {
    expect(isPlaceholderKlaviyoApiKey("smoke-test-klaviyo-key")).toBe(true);
    expect(isPlaceholderKlaviyoApiKey("pk_live_abc123")).toBe(false);
  });

  it("audits in-repo Klaviyo live smoke wiring", () => {
    const audit = auditKlaviyoLiveSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of KLAVIYO_LIVE_SMOKE_ERA84_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes segment export and campaign trigger steps in smoke script", () => {
    const smoke = readFileSync(join(ROOT, "scripts/smoke-klaviyo-live.ts"), "utf8");
    expect(smoke).toContain("segment_export_wiring");
    expect(smoke).toContain("campaign_trigger_wiring");
    expect(smoke).toContain("exportKlaviyoSegmentProfiles");
    expect(smoke).toContain("triggerKlaviyoCampaignBatch");
  });

  it("marks proof_passed only when cert, wiring, and live smoke pass", () => {
    expect(
      resolveKlaviyoLiveSmokeEra84ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "PASSED",
        liveProofStatus: "proof_passed",
      }),
    ).toBe("proof_passed");
    expect(
      resolveKlaviyoLiveSmokeEra84ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "SKIPPED",
        liveProofStatus: "proof_skipped_placeholder_api_key",
      }),
    ).toBe("proof_skipped_placeholder_api_key");
  });

  it("builds SKIPPED summary when placeholder API key blocks live verify", () => {
    const summary = buildKlaviyoLiveSmokeEra84Summary({
      certPassed: true,
      liveSmoke: {
        overall: "SKIPPED",
        proofStatus: "proof_skipped_placeholder_api_key",
        missingEnvVars: [],
        steps: [
          {
            id: "klaviyo_api_key_verify",
            label: "Klaviyo API key verification",
            status: "SKIPPED",
            reason: "placeholder key",
          },
        ],
      },
    });
    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_api_key");
    expect(summary.wiringCertPassed).toBe(true);
  });
});
