/**
 * Era 20 operator golden path proof — Workstream G.
 *
 * Maps Tier 2 manual checklist phases to product routes, services, and tests.
 * Does not claim phaseProofStatus proof_passed without staging execution.
 */

import { PILOT_OPERATOR_GOLDEN_PATH_ERA17_POLICY_ID } from "@/lib/commercial/pilot-operator-golden-path-era17-policy";
import { ERA20_FIRST_PAID_PILOT_PACKAGE_POLICY_ID } from "@/lib/commercial/era20-first-paid-pilot-package-policy";
import { LAUNCH_WIZARD_ERA19_POLICY_ID } from "@/lib/launch-wizard/launch-wizard-era19-policy";

export const ERA20_OPERATOR_GOLDEN_PATH_PROOF_POLICY_ID =
  "era20-operator-golden-path-proof-v1" as const;

export const ERA20_OPERATOR_GOLDEN_PATH_PROOF_DOC =
  "docs/era20-operator-golden-path-proof-2026-05-28.md" as const;

export const ERA20_OPERATOR_GOLDEN_PATH_PROOF_MODULE =
  "lib/commercial/era20-operator-golden-path-proof-era20.ts" as const;

export const ERA20_OPERATOR_GOLDEN_PATH_PROOF_STATUS =
  "workflow_map_ready_awaiting_tier2_execution" as const;

export const ERA20_OPERATOR_GOLDEN_PATH_PROOF_EXTENDS_POLICIES = [
  PILOT_OPERATOR_GOLDEN_PATH_ERA17_POLICY_ID,
  ERA20_FIRST_PAID_PILOT_PACKAGE_POLICY_ID,
  LAUNCH_WIZARD_ERA19_POLICY_ID,
  "era19-owner-daily-briefing-v1",
] as const;

export const ERA20_OPERATOR_GOLDEN_PATH_PROOF_WORKFLOW_IDS = [
  "owner_briefing_to_action",
  "launch_wizard_to_go_live",
  "storefront_to_packing",
  "pos_to_inventory",
  "manager_discount_audit",
  "shift_closeout",
  "integration_health_recovery",
  "support_impersonation_audit",
] as const;

export const ERA20_OPERATOR_GOLDEN_PATH_PROOF_REQUIRED_SECTIONS = [
  "Tier 2 execution gate",
  "Workflow proof matrix",
  "Launch Wizard step crosswalk",
  "Owner Daily Briefing crosswalk",
  "Staging sign-off env vars",
] as const;

export const ERA20_OPERATOR_GOLDEN_PATH_PROOF_CI_SCRIPTS = [
  "test:ci:era20-operator-golden-path-proof",
  "test:ci:era20-operator-golden-path-proof:cert",
] as const;

export const ERA20_OPERATOR_GOLDEN_PATH_PROOF_LAUNCH_WIZARD_COMPONENT =
  "components/dashboard/launch-wizard/launch-wizard-golden-path-panel.tsx" as const;

export const ERA20_OPERATOR_GOLDEN_PATH_PROOF_UNIT_TESTS = [
  "tests/unit/era20-operator-golden-path-proof-era20.test.ts",
  "tests/unit/era20-operator-golden-path-proof-cert-live.test.ts",
  "tests/unit/launch-wizard-golden-path-era20.test.ts",
] as const;

export const ERA20_OPERATOR_GOLDEN_PATH_PROOF_REVIEW_SECTION =
  "Era 20 operator golden path proof (2026-05-28)" as const;

export const ERA20_OPERATOR_GOLDEN_PATH_PROOF_CANONICAL_DOC_PATHS = [
  ERA20_OPERATOR_GOLDEN_PATH_PROOF_DOC,
  "docs/pilot-operator-golden-path-era17.md",
  "docs/commercial-pilot-runbook.md",
  "docs/feature-maturity-matrix.md",
  "docs/implementation-backlog.md",
] as const;

export const ERA20_OPERATOR_GOLDEN_PATH_PROOF_CANONICAL_MARKERS = [
  ERA20_OPERATOR_GOLDEN_PATH_PROOF_POLICY_ID,
  "operator golden path proof",
  "workflow_map_ready_awaiting_tier2_execution",
  "era20-operator-golden-path-proof-2026-05-28",
] as const;
