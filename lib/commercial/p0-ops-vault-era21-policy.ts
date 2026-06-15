/**
 * P0 ops vault — Era 21 product + CLI wiring for Day 0 credential execution.
 */

import { P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import { P0_OPS_VAULT_PHASES_ERA21_POLICY_ID } from "@/lib/commercial/p0-ops-vault-phases-era21";
/** Inline — avoids policy → ui → ops → policy TDZ at build time. */
const P0_OPS_VAULT_UI_ERA21_POLICY_ID = "era21-p0-ops-vault-ui-v1" as const;

export const P0_OPS_VAULT_ERA21_POLICY_ID = "era21-p0-ops-vault-v1" as const;

export const P0_OPS_VAULT_ERA21_BACKLOG_ID = "KOS-E21-001" as const;

export const P0_OPS_VAULT_ERA21_EXTENDS_POLICIES = [
  P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID,
  P0_OPS_VAULT_PHASES_ERA21_POLICY_ID,
  P0_OPS_VAULT_UI_ERA21_POLICY_ID,
  "era21-p0-ops-vault-day0-orchestrator-v1",
] as const;

export const P0_OPS_VAULT_ERA21_PLAYBOOK_DOC =
  "docs/p0-ops-vault-execution-playbook-2026-05-28.md" as const;

export const P0_OPS_VAULT_ERA21_DAY0_DOC =
  "docs/next-step-1-ops-vault-day0-execution-2026-05-28.md" as const;

export const P0_OPS_VAULT_ERA21_OPS_SCRIPTS = [
  "check-vault-readiness",
  "ops:run-p0-vault-day0-orchestrator",
  "ops:validate-p0-vault-env",
  "ops:check-p0-staging-health",
  "ops:export-p0-vault-env-template",
  "ops:export-p0-vault-day0-readiness-checklist",
  "ops:print-p0-github-secrets-checklist",
  "ops:sync-p0-vault-progress-report",
] as const;

export const P0_OPS_VAULT_ERA21_CI_SCRIPTS = [
  "test:ci:p0-ops-vault-era21",
  "test:ci:p0-ops-vault-era21:cert",
] as const;

export const P0_OPS_VAULT_ERA21_UNIT_TESTS = [
  "tests/unit/p0-ops-vault-day0-orchestrator-era21.test.ts",
  "tests/unit/p0-ops-vault-ui-era21.test.ts",
  "tests/unit/owner-daily-briefing-p0-ops-vault-era21.test.ts",
  "tests/unit/launch-wizard-from-go-live-era21.test.ts",
  "tests/unit/validate-p0-vault-env.test.ts",
  "tests/unit/run-p0-vault-day0-orchestrator.test.ts",
  "tests/unit/p0-ops-vault-era21-cert-live.test.ts",
] as const;

export const P0_OPS_VAULT_ERA21_CANONICAL_MARKERS = [
  P0_OPS_VAULT_ERA21_POLICY_ID,
  "p0-ops-vault-phases-panel",
  "awaiting_ops_credentials",
  "day0_partial",
  "ops:run-p0-vault-day0-orchestrator",
  "ops:validate-p0-vault-env",
] as const;

export const P0_OPS_VAULT_ERA21_PRODUCT_SURFACES = [
  "app/dashboard/integration-health/page.tsx",
  "components/dashboard/owner-daily-briefing-hero.tsx",
  "components/dashboard/launch-wizard/launch-wizard-view.tsx",
  "components/dashboard/launch-wizard/launch-wizard-today-strip.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
