/**
 * Era 17 enterprise SSO IdP staging smoke cert script.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_ENV_VARS,
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_PILOT_RUNBOOK_STEPS,
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID,
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_ROLLBACK_STEPS,
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_SUMMARY_ARTIFACT,
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_SUPPORTED_IDP_VENDORS,
} from "../lib/enterprise/enterprise-sso-idp-staging-smoke-era17-policy";
import {
  buildEnterpriseSsoIdpStagingSmokeSummary,
  type EnterpriseSsoIdpStagingSmokeStep,
} from "../lib/enterprise/enterprise-sso-idp-staging-smoke-summary";

export function validateEnterpriseSsoIdpStagingSmokePack(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_PILOT_RUNBOOK_STEPS.length < 8) {
    errors.push("Expected at least eight IdP staging runbook steps");
  }
  if (ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_ROLLBACK_STEPS.length < 3) {
    errors.push("Expected at least three rollback steps");
  }
  if (ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_ENV_VARS.length < 6) {
    errors.push("Expected at least six documented env vars");
  }
  if (ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_SUPPORTED_IDP_VENDORS.length !== 2) {
    errors.push("Expected exactly two supported IdP vendors (OKTA, ENTRA_ID)");
  }
  return { ok: errors.length === 0, errors };
}

function main() {
  const validation = validateEnterpriseSsoIdpStagingSmokePack();
  const planSteps: EnterpriseSsoIdpStagingSmokeStep[] = [
    {
      id: "wiring_cert",
      label: "SSO R2 pilot wiring cert",
      status: "SKIPPED",
      reason: "Report plan only — run npm run smoke:enterprise-sso-idp-staging",
    },
  ];
  const summary = buildEnterpriseSsoIdpStagingSmokeSummary(planSteps);

  const artifactPath = join(process.cwd(), ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`\nEnterprise SSO IdP staging smoke cert (${ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID})\n`);
  console.log(`Runbook steps: ${ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_PILOT_RUNBOOK_STEPS.length}`);
  console.log(`Rollback steps: ${ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_ROLLBACK_STEPS.length}`);
  console.log(`Summary artifact: ${ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_SUMMARY_ARTIFACT}\n`);

  if (!validation.ok) {
    console.error("IdP staging smoke pack validation failed:");
    for (const error of validation.errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }
}

main();
