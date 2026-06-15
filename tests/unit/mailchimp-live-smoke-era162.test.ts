import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MAILCHIMP_LIVE_SMOKE_ERA162_CANONICAL_POLICY_ID,
  MAILCHIMP_LIVE_SMOKE_ERA162_CAPABILITIES,
  MAILCHIMP_LIVE_SMOKE_ERA162_INTEGRATION_HEALTH_PATH,
  MAILCHIMP_LIVE_SMOKE_ERA162_POLICY_ID,
  MAILCHIMP_LIVE_SMOKE_ERA162_SUMMARY_ARTIFACT,
  MAILCHIMP_LIVE_SMOKE_ERA162_WIRING_PATHS,
} from "@/lib/integrations/mailchimp-live-smoke-era162-policy";
import {
  auditMailchimpLiveSmokeEra162Wiring,
  buildMailchimpLiveSmokeEra162Summary,
  resolveMailchimpLiveSmokeEra162ProofStatus,
} from "@/lib/integrations/mailchimp-live-smoke-era162-smoke-summary";
import { MAILCHIMP_LIVE_SMOKE_ERA85_POLICY_ID } from "@/lib/integrations/mailchimp-live-smoke-era85-policy";

const ROOT = process.cwd();

describe("mailchimp live smoke era162", () => {
  it("locks era162 policy and artifact path", () => {
    expect(MAILCHIMP_LIVE_SMOKE_ERA162_POLICY_ID).toBe("era162-mailchimp-live-v1");
    expect(MAILCHIMP_LIVE_SMOKE_ERA162_SUMMARY_ARTIFACT).toBe(
      "artifacts/mailchimp-live-smoke-era162-smoke-summary.json",
    );
    expect(MAILCHIMP_LIVE_SMOKE_ERA162_INTEGRATION_HEALTH_PATH).toBe(
      "/dashboard/integration-health",
    );
    expect(MAILCHIMP_LIVE_SMOKE_ERA162_WIRING_PATHS).toHaveLength(8);
    expect(MAILCHIMP_LIVE_SMOKE_ERA162_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era162 with canonical Mailchimp live smoke policy", () => {
    expect(MAILCHIMP_LIVE_SMOKE_ERA162_CANONICAL_POLICY_ID).toBe(
      MAILCHIMP_LIVE_SMOKE_ERA85_POLICY_ID,
    );
  });

  it("audits in-repo Mailchimp LIVE integration wiring", () => {
    const audit = auditMailchimpLiveSmokeEra162Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of MAILCHIMP_LIVE_SMOKE_ERA162_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes OAuth email list and campaign automation wiring", () => {
    const smoke = readFileSync(join(ROOT, "scripts/smoke-mailchimp-live.ts"), "utf8");
    expect(smoke).toContain("email_list_wiring");
    expect(smoke).toContain("campaign_automation_wiring");
    expect(smoke).toContain("fetchMailchimpLists");
    expect(smoke).toContain("fetchMailchimpAutomations");

    const listSync = readFileSync(
      join(ROOT, "services/integrations/mailchimp/list-sync.service.ts"),
      "utf8",
    );
    expect(listSync).toContain("syncCustomersToMailchimpList");

    const automation = readFileSync(
      join(ROOT, "services/integrations/mailchimp/campaign-automation.service.ts"),
      "utf8",
    );
    expect(automation).toContain("listMailchimpCampaignAutomations");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveMailchimpLiveSmokeEra162ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveMailchimpLiveSmokeEra162ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildMailchimpLiveSmokeEra162Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("email_list");
    expect(summary.capabilities).toContain("campaign_automation");
  });
});
