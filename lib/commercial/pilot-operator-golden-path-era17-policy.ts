/**
 * Pilot operator golden path (Tier 2) — Evolution Era 17 Cycle 17 (Workstream D).
 *
 * 45–60 min owner + staff staging checklist with honest PASSED / FAILED / SKIPPED.
 * Does NOT claim paid pilot execution or rush-hour certification.
 */

import { COMMERCIAL_PILOT_EVIDENCE_ERA16_POLICY_ID } from "@/lib/commercial/commercial-pilot-evidence-pack-era16-policy";
import { COMMERCIAL_PILOT_RUNBOOK_POLICY_ID } from "@/lib/commercial/commercial-pilot-runbook-policy";
import { PILOT_TIER_PREFLIGHT_ERA17_POLICY_ID } from "@/lib/commercial/pilot-tier-preflight-era17-policy";

export const PILOT_OPERATOR_GOLDEN_PATH_ERA17_POLICY_ID =
  "era17-pilot-operator-golden-path-v1" as const;

export const PILOT_OPERATOR_GOLDEN_PATH_ERA17_DECISION_DATE = "2026-05-28" as const;

export const PILOT_OPERATOR_GOLDEN_PATH_ERA17_EXTENDS_POLICIES = [
  COMMERCIAL_PILOT_RUNBOOK_POLICY_ID,
  COMMERCIAL_PILOT_EVIDENCE_ERA16_POLICY_ID,
  PILOT_TIER_PREFLIGHT_ERA17_POLICY_ID,
  "era16-operational-signoff-v1",
  "era4-channel-golden-path-v1",
  "era15-kds-staging-smoke-recert-v1",
] as const;

/** Manual staging execution not recorded — not pilot GO. */
export const PILOT_OPERATOR_GOLDEN_PATH_ERA17_PROOF_STATUS = "awaiting_operator_execution" as const;

export const PILOT_OPERATOR_GOLDEN_PATH_ERA17_DOC =
  "docs/pilot-operator-golden-path-era17.md" as const;

export const PILOT_OPERATOR_GOLDEN_PATH_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pilot-operator-golden-path-era17.ts" as const;

export const PILOT_OPERATOR_GOLDEN_PATH_ERA17_NPM_SCRIPT = "smoke:pilot-operator-golden-path" as const;

export const PILOT_OPERATOR_GOLDEN_PATH_ERA17_SUMMARY_ARTIFACT =
  "artifacts/pilot-operator-golden-path-summary.json" as const;

export const PILOT_OPERATOR_GOLDEN_PATH_ERA17_ENV_VARS = [
  "PILOT_GOLDEN_PATH_STAGING_URL",
  "PILOT_GOLDEN_PATH_OPERATOR_EMAIL",
  "PILOT_GOLDEN_PATH_COMMIT_SHA",
  "PILOT_GOLDEN_PATH_DURATION_MINUTES",
] as const;

export const PILOT_OPERATOR_GOLDEN_PATH_ERA17_PHASES = [
  {
    id: "onboarding",
    label: "Onboarding — auth, kitchen settings, menu + products",
    matrixFamily: "Auth, catalog",
    manualEnvKey: "PILOT_GOLDEN_PATH_ONBOARDING_MANUAL",
  },
  {
    id: "orders",
    label: "Orders — manual order → production → packing",
    matrixFamily: "Order spine, kitchen",
    manualEnvKey: "PILOT_GOLDEN_PATH_ORDERS_MANUAL",
  },
  {
    id: "storefront",
    label: "Storefront — publish menu, test checkout",
    matrixFamily: "Storefront (beta / qualified)",
    manualEnvKey: "PILOT_GOLDEN_PATH_STOREFRONT_MANUAL",
  },
  {
    id: "integrations",
    label: "Integrations — Woo or Shopify test shop",
    matrixFamily: "Integrations",
    manualEnvKey: "PILOT_GOLDEN_PATH_INTEGRATIONS_MANUAL",
    ciSmokeScript: "smoke:channel-golden-path",
  },
  {
    id: "pos",
    label: "POS — terminal checkout, RBAC deny spot check",
    matrixFamily: "POS (beta), inventory POS-only",
    manualEnvKey: "PILOT_GOLDEN_PATH_POS_MANUAL",
    ciSmokeScript: "test:ci:pos-money-path:cert",
  },
  {
    id: "kds",
    label: "KDS — kitchen display bump/recall",
    matrixFamily: "KDS (qualified — not rush-hour)",
    manualEnvKey: "PILOT_GOLDEN_PATH_KDS_MANUAL",
    ciSmokeScript: "smoke:kds-staging",
  },
] as const;

export const PILOT_OPERATOR_GOLDEN_PATH_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Complete Tier 0/1 preflight on release commit (`npm run smoke:pilot-tier-preflight`).",
  "Schedule 45–60 min with owner + staff on staging.",
  "Follow docs/pilot-operator-golden-path-era17.md phase checklist.",
  "Run npm run smoke:pilot-operator-golden-path (CI wiring + manual env recording).",
  "Set PILOT_GOLDEN_PATH_<PHASE>_MANUAL=PASSED|FAILED per completed phase.",
  "Review artifacts/pilot-operator-golden-path-summary.json before Tier 3 money-path smoke.",
] as const;

export const PILOT_OPERATOR_GOLDEN_PATH_ERA17_FORBIDDEN_CLAIMS = [
  "rush-hour kds certified",
  "production certified for all tenants",
  "full marketplace live ops",
  "offline pos certified",
] as const;

export const PILOT_OPERATOR_GOLDEN_PATH_ERA17_CANONICAL_MARKERS = [
  PILOT_OPERATOR_GOLDEN_PATH_ERA17_POLICY_ID,
  "pilot-operator-golden-path",
  "awaiting_operator_execution",
  "phaseProofStatus",
] as const;

export const PILOT_OPERATOR_GOLDEN_PATH_ERA17_CI_SCRIPTS = [
  "test:ci:pilot-operator-golden-path-era17",
  "test:ci:pilot-operator-golden-path-era17:cert",
] as const;

export const PILOT_OPERATOR_GOLDEN_PATH_ERA17_UNIT_TESTS = [
  "tests/unit/pilot-operator-golden-path-era17-policy.test.ts",
  "tests/unit/pilot-operator-golden-path-summary.test.ts",
  "tests/unit/pilot-operator-golden-path-era17-cert-live.test.ts",
] as const;

export const PILOT_OPERATOR_GOLDEN_PATH_ERA17_CANONICAL_DOC_PATHS = [
  "docs/commercial-pilot-runbook.md",
  "docs/pilot-operator-golden-path-era17.md",
  "docs/pilot-icp-contract-template-era17.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
  "docs/qa-master-test-plan.md",
] as const;

export const PILOT_OPERATOR_GOLDEN_PATH_ERA17_REVIEW_SECTION =
  "Era 17 pilot operator golden path (2026-05-28)" as const;
