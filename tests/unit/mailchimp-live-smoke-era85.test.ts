import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MAILCHIMP_LIVE_SMOKE_ERA85_INTEGRATION_HEALTH_PATH,
  MAILCHIMP_LIVE_SMOKE_ERA85_POLICY_ID,
  MAILCHIMP_LIVE_SMOKE_ERA85_SUMMARY_ARTIFACT,
  MAILCHIMP_LIVE_SMOKE_ERA85_WIRING_PATHS,
} from "@/lib/integrations/mailchimp-live-smoke-era85-policy";
import {
  auditMailchimpLiveSmokeWiring,
  buildMailchimpLiveSmokeEra85Summary,
  isPlaceholderMailchimpAccessToken,
  resolveMailchimpLiveSmokeEra85ProofStatus,
} from "@/lib/integrations/mailchimp-live-smoke-summary";

const ROOT = process.cwd();

describe("mailchimp live smoke era85", () => {
  it("locks era85 policy and artifact path", () => {
    expect(MAILCHIMP_LIVE_SMOKE_ERA85_POLICY_ID).toBe("era85-mailchimp-live-smoke-v1");
    expect(MAILCHIMP_LIVE_SMOKE_ERA85_SUMMARY_ARTIFACT).toBe(
      "artifacts/mailchimp-live-smoke-summary.json",
    );
    expect(MAILCHIMP_LIVE_SMOKE_ERA85_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
  });

  it("detects placeholder Mailchimp access tokens", () => {
    expect(isPlaceholderMailchimpAccessToken("smoke-test-mailchimp-token")).toBe(true);
    expect(isPlaceholderMailchimpAccessToken("live-oauth-token-abc")).toBe(false);
  });

  it("audits in-repo Mailchimp live smoke wiring", () => {
    const audit = auditMailchimpLiveSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of MAILCHIMP_LIVE_SMOKE_ERA85_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes email list and campaign automation steps in smoke script", () => {
    const smoke = readFileSync(join(ROOT, "scripts/smoke-mailchimp-live.ts"), "utf8");
    expect(smoke).toContain("email_list_wiring");
    expect(smoke).toContain("campaign_automation_wiring");
    expect(smoke).toContain("fetchMailchimpLists");
    expect(smoke).toContain("fetchMailchimpAutomations");
  });

  it("marks proof_passed only when cert, wiring, and live smoke pass", () => {
    expect(
      resolveMailchimpLiveSmokeEra85ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "PASSED",
        liveProofStatus: "proof_passed",
      }),
    ).toBe("proof_passed");
    expect(
      resolveMailchimpLiveSmokeEra85ProofStatus({
        wiringOk: true,
        certPassed: true,
        liveOverall: "SKIPPED",
        liveProofStatus: "proof_skipped_placeholder_token",
      }),
    ).toBe("proof_skipped_placeholder_token");
  });

  it("builds SKIPPED summary when placeholder token blocks live OAuth", () => {
    const summary = buildMailchimpLiveSmokeEra85Summary({
      certPassed: true,
      liveSmoke: {
        overall: "SKIPPED",
        proofStatus: "proof_skipped_placeholder_token",
        missingEnvVars: [],
        steps: [
          {
            id: "mailchimp_oauth_connection",
            label: "Mailchimp OAuth API connection",
            status: "SKIPPED",
            reason: "placeholder token",
          },
        ],
      },
    });
    expect(summary.overall).toBe("SKIPPED");
    expect(summary.proofStatus).toBe("proof_skipped_placeholder_token");
    expect(summary.wiringCertPassed).toBe(true);
  });
});
