/**
 * Permission denied UX consistency — Evolution Era 17 Workstream H Cycle 33.
 *
 * Standardizes POS / KDS / dashboard RBAC denial cards — not a bypass of server-side checks.
 */

import { POS_TABLET_UX_ERA17_POLICY_ID } from "@/lib/pos/pos-tablet-ux-era17-policy";

export const PERMISSION_DENIED_UX_ERA17_POLICY_ID =
  "era17-permission-denied-ux-v1" as const;

export const PERMISSION_DENIED_UX_ERA17_DECISION_DATE = "2026-05-28" as const;

export const PERMISSION_DENIED_UX_ERA17_EXTENDS_POLICIES = [
  POS_TABLET_UX_ERA17_POLICY_ID,
] as const;

export const PERMISSION_DENIED_UX_ERA17_PROOF_STATUS =
  "permission_denied_ux_consistent" as const;

export const PERMISSION_DENIED_UX_ERA17_COPY_MODULE =
  "lib/ux/permission-denied-copy.ts" as const;

export const PERMISSION_DENIED_UX_ERA17_CARD_MODULE =
  "components/ui/permission-denied-card.tsx" as const;

export const PERMISSION_DENIED_UX_ERA17_SHELL_MODULE =
  "components/dashboard/permission-denied-shell.tsx" as const;

export const PERMISSION_DENIED_UX_ERA17_OPERATOR_DOC =
  "docs/permission-denied-ux-era17.md" as const;

export const PERMISSION_DENIED_UX_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-permission-denied-ux-era17.ts" as const;

export const PERMISSION_DENIED_UX_ERA17_SUMMARY_ARTIFACT =
  "artifacts/permission-denied-ux-summary.json" as const;

export const PERMISSION_DENIED_UX_ERA17_NPM_SCRIPT =
  "smoke:permission-denied-ux" as const;

export const PERMISSION_DENIED_UX_ERA17_SPOTCHECK_SURFACES = [
  "pos_terminal",
  "pos_hub",
  "pos_layout",
  "kds",
] as const;

export const PERMISSION_DENIED_UX_ERA17_WIRED_PAGE_PATHS = [
  "app/dashboard/pos/terminal/page.tsx",
  "app/dashboard/pos/page.tsx",
  "app/dashboard/pos/layout.tsx",
  "app/dashboard/kitchen/page.tsx",
] as const;

export const PERMISSION_DENIED_UX_ERA17_CANONICAL_MARKERS = [
  PERMISSION_DENIED_UX_ERA17_POLICY_ID,
  "smoke:permission-denied-ux",
  "permission_denied_ux_consistent",
  "permission-denied-card",
  "resolvePermissionDeniedSurface",
] as const;

export const PERMISSION_DENIED_UX_ERA17_CI_SCRIPTS = [
  "test:ci:permission-denied-ux-era17",
  "test:ci:permission-denied-ux-era17:cert",
] as const;

export const PERMISSION_DENIED_UX_ERA17_UNIT_TESTS = [
  "tests/unit/permission-denied-copy.test.ts",
  "tests/unit/permission-denied-ux-era17-policy.test.ts",
  "tests/unit/permission-denied-ux-era17-cert-live.test.ts",
] as const;

export const PERMISSION_DENIED_UX_ERA17_CANONICAL_DOC_PATHS = [
  PERMISSION_DENIED_UX_ERA17_OPERATOR_DOC,
  "docs/commercial-pilot-runbook.md",
  "docs/feature-maturity-matrix.md",
  "docs/qa-master-test-plan.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/pos-tablet-ux-operator-runbook-era17.md",
] as const;

export const PERMISSION_DENIED_UX_ERA17_REVIEW_SECTION =
  "Era 17 permission denied UX consistency (2026-05-28)" as const;

export const PERMISSION_DENIED_UX_ERA17_BACKLOG_ID = "KOS-E17-032" as const;

export const PERMISSION_DENIED_UX_ERA17_TEST_ID = "permission-denied-card" as const;
