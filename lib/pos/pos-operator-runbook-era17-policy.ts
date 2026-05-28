/**
 * POS software-only operator runbook — Evolution Era 17 Workstream E Cycle 23 (engineering Cycle 24).
 *
 * Daily golden path for web-first POS — shifts, checkout, receipts, closeout.
 * Does NOT claim hardware POS certification, offline POS, or rush-hour throughput.
 */

import { POS_BROWSER_E2E_POLICY_ID } from "@/lib/ci/pos-browser-e2e-policy";
import { POS_MANAGER_DISCOUNT_ERA17_POLICY_ID } from "@/lib/pos/pos-manager-discount-era17-policy";
import { POS_TABLET_UX_ERA17_POLICY_ID } from "@/lib/pos/pos-tablet-ux-era17-policy";

export const POS_OPERATOR_RUNBOOK_ERA17_POLICY_ID = "era17-pos-operator-runbook-v1" as const;

export const POS_OPERATOR_RUNBOOK_ERA17_DECISION_DATE = "2026-05-28" as const;

export const POS_OPERATOR_RUNBOOK_ERA17_EXTENDS_POLICIES = [
  POS_BROWSER_E2E_POLICY_ID,
  POS_TABLET_UX_ERA17_POLICY_ID,
  POS_MANAGER_DISCOUNT_ERA17_POLICY_ID,
] as const;

/** Doc + cert wired — manual golden path on staging optional. */
export const POS_OPERATOR_RUNBOOK_ERA17_PROOF_STATUS = "operator_runbook_ready" as const;

export const POS_OPERATOR_RUNBOOK_ERA17_OPERATOR_DOC =
  "docs/pos-software-only-operator-runbook-era17.md" as const;

export const POS_OPERATOR_RUNBOOK_ERA17_SUMMARY_MODULE =
  "lib/pos/pos-operator-runbook-summary.ts" as const;

export const POS_OPERATOR_RUNBOOK_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pos-operator-runbook-era17.ts" as const;

export const POS_OPERATOR_RUNBOOK_ERA17_SUMMARY_ARTIFACT =
  "artifacts/pos-operator-runbook-summary.json" as const;

export const POS_OPERATOR_RUNBOOK_ERA17_NPM_SCRIPT = "smoke:pos-operator-runbook" as const;

export const POS_OPERATOR_RUNBOOK_ERA17_GOLDEN_PATH_STEPS = [
  "Confirm pos_terminal plan entitlement and pos.access for cashier role",
  "Create register and active staff member if missing",
  "Open shift with opening cash on /dashboard/pos/shifts",
  "Complete one cash sale on /dashboard/pos/terminal",
  "Verify transaction appears on /dashboard/pos/transactions",
  "Open receipt from /dashboard/pos/receipts — totals match sale",
  "Close shift — review expected cash vs counted cash and variance",
  "Run npm run smoke:pos-operator-runbook — review pos-operator-runbook-summary.json",
] as const;

export const POS_OPERATOR_RUNBOOK_ERA17_ENV_VARS = [
  "POS_OPERATOR_RUNBOOK_OPERATOR_EMAIL",
  "POS_OPERATOR_RUNBOOK_STAGING_URL",
  "POS_OPERATOR_RUNBOOK_GOLDEN_PATH_ATTESTATION",
] as const;

export const POS_OPERATOR_RUNBOOK_ERA17_SUPPORT_DOCS = [
  POS_OPERATOR_RUNBOOK_ERA17_OPERATOR_DOC,
  "docs/pos-tablet-ux-operator-runbook-era17.md",
  "docs/pos-manager-discount-operator-guide-era17.md",
  "docs/POS_REGISTER_SHIFTS.md",
  "docs/POS_RECEIPTS.md",
] as const;

export const POS_OPERATOR_RUNBOOK_ERA17_CANONICAL_MARKERS = [
  POS_OPERATOR_RUNBOOK_ERA17_POLICY_ID,
  "smoke:pos-operator-runbook",
  "operator_runbook_ready",
  "pos-operator-runbook-summary",
  "pos.access",
] as const;

export const POS_OPERATOR_RUNBOOK_ERA17_FORBIDDEN_CLAIMS = [
  "hardware pos certified",
  "offline pos production ready",
  "rush-hour pos throughput certified",
  "toast hardware parity",
  "square terminal parity",
] as const;

export const POS_OPERATOR_RUNBOOK_ERA17_CI_SCRIPTS = [
  "test:ci:pos-operator-runbook-era17",
  "test:ci:pos-operator-runbook-era17:cert",
] as const;

export const POS_OPERATOR_RUNBOOK_ERA17_UNIT_TESTS = [
  "tests/unit/pos-operator-runbook-era17-policy.test.ts",
  "tests/unit/pos-operator-runbook-summary.test.ts",
  "tests/unit/pos-operator-runbook-era17-cert-live.test.ts",
] as const;

export const POS_OPERATOR_RUNBOOK_ERA17_CANONICAL_DOC_PATHS = [
  POS_OPERATOR_RUNBOOK_ERA17_OPERATOR_DOC,
  "docs/commercial-pilot-runbook.md",
  "docs/feature-maturity-matrix.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
] as const;

export const POS_OPERATOR_RUNBOOK_ERA17_REVIEW_SECTION =
  "Era 17 POS software-only operator runbook (2026-05-28)" as const;

export const POS_OPERATOR_RUNBOOK_ERA17_BACKLOG_ID = "KOS-E17-024" as const;
