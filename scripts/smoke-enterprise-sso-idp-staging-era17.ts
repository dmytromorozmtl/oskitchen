/**
 * Era 17 enterprise SSO IdP staging smoke orchestrator (Cycles 1–2).
 *
 * 1. Wiring cert via smoke:enterprise-sso-r2-pilot
 * 2. Evaluate IdP staging prerequisites from env
 * 3. Optional staging /api/health and /login reachability
 * 4. Operator proof validation when SSO_STAGING_OPERATOR_* env vars set
 * Missing IdP secrets → SKIPPED WITH REASON (exit 0). Real failures → FAILED (exit 1).
 */
import { existsSync } from "node:fs";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_POLICY_ID,
  ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_CYCLE2_RUNBOOK_STEPS,
} from "../lib/enterprise/enterprise-sso-idp-login-proof-era17-policy";
import {
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_LEGACY_SMOKE,
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_OPS_DOC,
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_PILOT_RUNBOOK_STEPS,
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID,
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_SUMMARY_ARTIFACT,
} from "../lib/enterprise/enterprise-sso-idp-staging-smoke-era17-policy";
import {
  buildEnterpriseSsoIdpOperatorProofTemplate,
  buildEnterpriseSsoIdpStagingSmokeSummary,
  evaluateEnterpriseSsoIdpLoginProofEvidence,
  evaluateEnterpriseSsoIdpStagingSmokePrerequisites,
  formatEnterpriseSsoIdpStagingSmokeReportLines,
  formatMissingEnterpriseSsoIdpStagingEnvVarsReason,
  listMissingEnterpriseSsoIdpStagingEnvVars,
  type EnterpriseSsoIdpStagingSmokeStep,
} from "../lib/enterprise/enterprise-sso-idp-staging-smoke-summary";

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

async function checkStagingUrl(
  baseUrl: string,
  path: string,
): Promise<{ ok: boolean; reason?: string }> {
  const url = `${baseUrl.replace(/\/$/, "")}${path}`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) {
      return { ok: false, reason: `GET ${url} returned ${response.status}` };
    }
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, reason: `GET ${url} failed: ${message}` };
  }
}

function writeSummaryArtifact(
  summary: ReturnType<typeof buildEnterpriseSsoIdpStagingSmokeSummary>,
): void {
  const path = join(process.cwd(), ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function readPrerequisiteInput() {
  return {
    stagingBaseUrl: process.env.E2E_STAGING_BASE_URL ?? null,
    workspaceId: process.env.SSO_STAGING_WORKSPACE_ID ?? null,
    idpVendor: process.env.SSO_STAGING_IDP_VENDOR ?? null,
    allowedDomain: process.env.SSO_STAGING_ALLOWED_DOMAIN ?? null,
    testEmail: process.env.SSO_STAGING_TEST_EMAIL ?? null,
    supabaseProviderRef: process.env.SSO_STAGING_SUPABASE_PROVIDER_REF ?? null,
  };
}

function readOperatorProofInput(screenshotPath: string | null) {
  return {
    operatorEmail: process.env.SSO_STAGING_OPERATOR_EMAIL ?? null,
    screenshotPath,
    auditEventRef: process.env.SSO_STAGING_AUDIT_EVENT_REF ?? null,
    negativeTestNote: process.env.SSO_STAGING_NEGATIVE_TEST_NOTE ?? null,
    breakGlassDrillNote: process.env.SSO_STAGING_BREAK_GLASS_DRILL_NOTE ?? null,
    screenshotExists: screenshotPath ? existsSync(screenshotPath) : undefined,
  };
}

function printRunbook(): void {
  console.log(`\nEnterprise SSO IdP staging smoke (${ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID})\n`);
  console.log(`Cycle 2 login proof (${ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_POLICY_ID})\n`);
  for (const [index, step] of ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_PILOT_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nCycle 2 operator proof:\n");
  for (const [index, step] of ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_CYCLE2_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log(`\nSee ${ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_OPS_DOC}\n`);
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
Era 17 enterprise SSO IdP staging smoke (Cycles 1–2)

  (default)         Wiring cert + prerequisites + optional staging checks + operator proof
  --checklist-only  Print IdP staging + Cycle 2 runbook steps
  --skip-health     Skip live GET /api/health and /login even when staging URL is set
`);
    process.exit(0);
  }

  if (process.argv.includes("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  const steps: EnterpriseSsoIdpStagingSmokeStep[] = [];
  const prereqInput = readPrerequisiteInput();
  const missingEnvVars = listMissingEnterpriseSsoIdpStagingEnvVars(prereqInput);
  const skipReason = formatMissingEnterpriseSsoIdpStagingEnvVarsReason(missingEnvVars);

  console.log(`\n→ npm run ${ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_LEGACY_SMOKE}\n`);
  const wiringCode = runNpmScript(ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_LEGACY_SMOKE);
  steps.push({
    id: "wiring_cert",
    label: "SSO R2 pilot wiring cert (smoke:enterprise-sso-r2-pilot)",
    status: wiringCode === 0 ? "PASSED" : "FAILED",
    reason: wiringCode === 0 ? undefined : `exit ${wiringCode}`,
  });

  const prereq = evaluateEnterpriseSsoIdpStagingSmokePrerequisites(prereqInput);

  if (!prereq.ok) {
    steps.push({
      id: "idp_staging_prerequisites",
      label: "IdP staging prerequisites configured",
      status: "SKIPPED",
      reason: skipReason,
    });
    steps.push({
      id: "staging_health",
      label: "Staging /api/health reachable",
      status: "SKIPPED",
      reason: skipReason,
    });
    steps.push({
      id: "staging_login_page",
      label: "Staging /login reachable",
      status: "SKIPPED",
      reason: skipReason,
    });
    steps.push({
      id: "idp_browser_login",
      label: "Operator IdP login → dashboard on staging",
      status: "SKIPPED",
      reason: skipReason,
    });
    steps.push({
      id: "break_glass_drill",
      label: "Break-glass owner login drill",
      status: "SKIPPED",
      reason: skipReason,
    });
    steps.push({
      id: "negative_tenant_mapping",
      label: "Negative tests (wrong domain / workspace / disabled SSO)",
      status: "SKIPPED",
      reason: skipReason,
    });
  } else {
    steps.push({
      id: "idp_staging_prerequisites",
      label: "IdP staging prerequisites configured",
      status: "PASSED",
      reason: `IdP vendor ${prereq.idpVendor}; workspace ${process.env.SSO_STAGING_WORKSPACE_ID?.trim()}`,
    });

    if (process.argv.includes("--skip-health")) {
      steps.push({
        id: "staging_health",
        label: "Staging /api/health reachable",
        status: "SKIPPED",
        reason: "--skip-health",
      });
      steps.push({
        id: "staging_login_page",
        label: "Staging /login reachable",
        status: "SKIPPED",
        reason: "--skip-health",
      });
    } else {
      const health = await checkStagingUrl(process.env.E2E_STAGING_BASE_URL!.trim(), "/api/health");
      steps.push({
        id: "staging_health",
        label: "Staging /api/health reachable",
        status: health.ok ? "PASSED" : "FAILED",
        reason: health.reason,
      });

      const loginPage = await checkStagingUrl(process.env.E2E_STAGING_BASE_URL!.trim(), "/login");
      steps.push({
        id: "staging_login_page",
        label: "Staging /login reachable",
        status: loginPage.ok ? "PASSED" : "FAILED",
        reason: loginPage.reason,
      });
    }

    const screenshotPath = process.env.SSO_STAGING_LOGIN_SCREENSHOT_PATH?.trim() || null;
    const proofEval = evaluateEnterpriseSsoIdpLoginProofEvidence(
      readOperatorProofInput(screenshotPath),
    );

    if (proofEval.ok) {
      steps.push({
        id: "idp_browser_login",
        label: "Operator IdP login → dashboard on staging",
        status: "PASSED",
        reason: `Operator ${process.env.SSO_STAGING_OPERATOR_EMAIL?.trim()}; audit ${process.env.SSO_STAGING_AUDIT_EVENT_REF?.trim()}`,
      });
      steps.push({
        id: "negative_tenant_mapping",
        label: "Negative tests (wrong domain / workspace / disabled SSO)",
        status: "PASSED",
        reason: process.env.SSO_STAGING_NEGATIVE_TEST_NOTE?.trim(),
      });
    } else {
      steps.push({
        id: "idp_browser_login",
        label: "Operator IdP login → dashboard on staging",
        status: proofEval.missing.length > 0 ? "SKIPPED" : "FAILED",
        reason: proofEval.reason,
      });
      steps.push({
        id: "negative_tenant_mapping",
        label: "Negative tests (wrong domain / workspace / disabled SSO)",
        status: process.env.SSO_STAGING_NEGATIVE_TEST_NOTE?.trim() ? "PASSED" : "SKIPPED",
        reason: process.env.SSO_STAGING_NEGATIVE_TEST_NOTE?.trim()
          ? process.env.SSO_STAGING_NEGATIVE_TEST_NOTE.trim()
          : "Set SSO_STAGING_NEGATIVE_TEST_NOTE after manual denial tests.",
      });
    }

    const breakGlassNote = process.env.SSO_STAGING_BREAK_GLASS_DRILL_NOTE?.trim();
    steps.push({
      id: "break_glass_drill",
      label: "Break-glass owner login drill",
      status: breakGlassNote ? "PASSED" : "SKIPPED",
      reason: breakGlassNote ?? "Set SSO_STAGING_BREAK_GLASS_DRILL_NOTE after owner break-glass drill.",
    });
  }

  const operatorProof = buildEnterpriseSsoIdpOperatorProofTemplate({
    stagingBaseUrl: prereqInput.stagingBaseUrl,
    workspaceId: prereqInput.workspaceId,
    idpVendor: prereq.ok ? prereq.idpVendor : null,
    operatorEmail: process.env.SSO_STAGING_OPERATOR_EMAIL ?? null,
    screenshotPath: process.env.SSO_STAGING_LOGIN_SCREENSHOT_PATH ?? null,
    auditEventRef: process.env.SSO_STAGING_AUDIT_EVENT_REF ?? null,
    negativeTestNote: process.env.SSO_STAGING_NEGATIVE_TEST_NOTE ?? null,
    breakGlassDrillNote: process.env.SSO_STAGING_BREAK_GLASS_DRILL_NOTE ?? null,
  });

  const summary = buildEnterpriseSsoIdpStagingSmokeSummary(steps, {
    missingEnvVars,
    operatorProof,
  });
  writeSummaryArtifact(summary);

  console.log(`\nEnterprise SSO IdP staging smoke (${ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID})\n`);
  for (const line of formatEnterpriseSsoIdpStagingSmokeReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_SUMMARY_ARTIFACT}\n`);

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
