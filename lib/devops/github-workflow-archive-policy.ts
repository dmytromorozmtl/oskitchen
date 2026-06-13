/**
 * Blueprint P1-17 — GitHub workflow archive (121 → ~40 active).
 *
 * @see docs/npm-script-trim-rfc.md § Workflow cleanup matrix
 * @see .github/archive/workflows/inactive/
 */

export const GITHUB_WORKFLOW_ARCHIVE_POLICY_ID = "github-workflow-archive-p1-17-v1" as const;

export const GITHUB_WORKFLOW_ACTIVE_MAX = 40 as const;

export const GITHUB_WORKFLOW_ACTIVE_DIR = ".github/workflows" as const;

export const GITHUB_WORKFLOW_ARCHIVE_DIR = ".github/archive/workflows/inactive" as const;

export const GITHUB_WORKFLOW_ARCHIVE_MANIFEST =
  "artifacts/github-workflow-archive-manifest.json" as const;

export const GITHUB_WORKFLOW_SURFACE_ARTIFACT =
  "artifacts/github-workflow-surface-audit.json" as const;

export const GITHUB_WORKFLOW_ARCHIVE_SCRIPT =
  "scripts/archive-inactive-github-workflows.ts" as const;

export const GITHUB_WORKFLOW_AUDIT_SCRIPT =
  "scripts/audit-github-workflow-surface.ts" as const;

export const GITHUB_WORKFLOW_ARCHIVE_UNIT_TEST =
  "tests/unit/github-workflow-archive.test.ts" as const;

export const GITHUB_WORKFLOW_ARCHIVE_NPM_SCRIPT = "test:ci:github-workflow-archive" as const;

/** Pilot + engineering workflows that stay executable. */
export const GITHUB_WORKFLOW_ACTIVE_ALLOWLIST = [
  "beta-daily-ops.yml",
  "chromatic-visual.yml",
  "ci-smoke.yml",
  "ci.yml",
  "closed-beta-gate.yml",
  "deploy-prod-gate.yml",
  "domination-live-smokes.yml",
  "e2e-accessibility-axe.yml",
  "e2e-mobile-first-redesign-pos-kds.yml",
  "e2e-pilot.yml",
  "e2e-pos-offline-mode.yml",
  "e2e-remote-smoke.yml",
  "e2e-staging.yml",
  "integration-smoke-suite-order-kds.yml",
  "k6-edge-assign-smoke.yml",
  "lighthouse-storefront.yml",
  "lighthouse.yml",
  "live-integrations-staging-smoke.yml",
  "p0-orchestrator.yml",
  "p0-staging-proof-execution-check.yml",
  "p0-staging-smokes.yml",
  "paid-pilot-gate.yml",
  "pilot-week1-execution-check.yml",
  "playwright-kds-staging.yml",
  "playwright-storefront.yml",
  "production-weekly-smoke.yml",
  "rsc-smoke.yml",
  "storefront-staging-gate.yml",
  "tier2-staging-proof-execution-check.yml",
  "vault-readiness-check.yml",
  "verify-claims.yml",
  "webhook-cron-synthetic.yml",
  "woo-shopify-staging-smoke.yml",
] as const;

/** Filename patterns for era25 / ops theater workflows → archive. */
export const GITHUB_WORKFLOW_ARCHIVE_PATTERNS = [
  /^ops-era25-/,
  /^ops-.*-integrity-validate\.yml$/,
  /^ops-.*-validate\.yml$/,
  /-execution-check\.yml$/,
  /^ops-(commercial|month2|market-leader|scale-readiness|sustained|series-a|paid-pilot|pilot-week1|owner-daily|linear-chain|maintenance-mode|pure-operational|post-terminus|engineering-path)/,
] as const;

export function shouldArchiveWorkflow(filename: string): boolean {
  if ((GITHUB_WORKFLOW_ACTIVE_ALLOWLIST as readonly string[]).includes(filename)) {
    return false;
  }
  return GITHUB_WORKFLOW_ARCHIVE_PATTERNS.some((pattern) => pattern.test(filename));
}
