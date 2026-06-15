/**
 * Competitor feature gap matrix refresh — Evolution Era 17 Workstream K Cycle 42.
 *
 * Aligns competitor comparison with Era 17 honest maturity and re-audit §6.
 * Does NOT claim Toast/Square hardware parity, production SSO, or live marketplace ops.
 */

import { INVESTOR_NARRATIVE_ONEPAGER_ERA17_POLICY_ID } from "@/lib/commercial/investor-narrative-onepager-era17-policy";

export const COMPETITOR_FEATURE_GAP_MATRIX_ERA17_POLICY_ID =
  "era17-competitor-feature-gap-matrix-refresh-v1" as const;

export const COMPETITOR_FEATURE_GAP_MATRIX_ERA17_DECISION_DATE = "2026-05-28" as const;

export const COMPETITOR_FEATURE_GAP_MATRIX_ERA17_EXTENDS_POLICIES = [
  INVESTOR_NARRATIVE_ONEPAGER_ERA17_POLICY_ID,
  "era7-marketing-claims-governance-v1",
] as const;

/** Matrix aligned to Era 17 evidence — pilot proof still required for leapfrog claims. */
export const COMPETITOR_FEATURE_GAP_MATRIX_ERA17_PROOF_STATUS =
  "evidence_aligned_awaiting_pilot_proof" as const;

export const COMPETITOR_FEATURE_GAP_MATRIX_ERA17_DOC =
  "docs/competitor-feature-gap-matrix.md" as const;

export const COMPETITOR_FEATURE_GAP_MATRIX_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-competitor-feature-gap-matrix-era17.ts" as const;

export const COMPETITOR_FEATURE_GAP_MATRIX_ERA17_SUMMARY_ARTIFACT =
  "artifacts/competitor-feature-gap-matrix-summary.json" as const;

export const COMPETITOR_FEATURE_GAP_MATRIX_ERA17_NPM_SCRIPT =
  "smoke:competitor-feature-gap-matrix" as const;

/** Required competitor names per Era 17 master prompt Cycle 42. */
export const COMPETITOR_FEATURE_GAP_MATRIX_ERA17_REQUIRED_COMPETITORS = [
  "Toast",
  "Square",
  "Lightspeed",
  "TouchBistro",
  "Clover",
  "SpotOn",
  "Revel",
  "Oracle Simphony",
  "Shopify",
  "WooCommerce",
  "7shifts",
  "Homebase",
  "QuickBooks",
  "Xero",
  "Klaviyo",
  "Mailchimp",
] as const;

export const COMPETITOR_FEATURE_GAP_MATRIX_ERA17_REQUIRED_SECTIONS = [
  "Era 17 evidence alignment",
  "Forbidden competitor claims",
] as const;

/** Era 17 policy and status markers that must appear in the matrix doc. */
export const COMPETITOR_FEATURE_GAP_MATRIX_ERA17_EVIDENCE_MARKERS = [
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_POLICY_ID,
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_PROOF_STATUS,
  "era17-enterprise-sso-idp-staging-smoke-v1",
  "pilot_foundation",
  "awaiting_live_credentials",
  "era17-kds-staging-playwright-proof-v1",
  "era17-pos-tablet-ux-v1",
  "era17-webhook-replay-p1-expansion-v1",
  "era17-public-api-per-route-scope-v1",
  "era17-pilot-inventory-messaging-v1",
  "deferred_locked",
] as const;

export const COMPETITOR_FEATURE_GAP_MATRIX_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Review docs/competitor-feature-gap-matrix.md — evidence_aligned_awaiting_pilot_proof.",
  "Confirm competitor rows match feature-maturity-matrix and re-audit §6 — no parity inflation.",
  "Run npm run smoke:competitor-feature-gap-matrix — review artifacts/competitor-feature-gap-matrix-summary.json.",
  "Run MARKETING_CLAIMS_STRICT=1 verify-claims before sales or investor use.",
  "Do not cite competitor gaps as closed without pilot or staging proof artifacts.",
] as const;

export const COMPETITOR_FEATURE_GAP_MATRIX_ERA17_CANONICAL_MARKERS = [
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_POLICY_ID,
  "smoke:competitor-feature-gap-matrix",
  "evidence_aligned_awaiting_pilot_proof",
  "matrixProofStatus",
] as const;

export const COMPETITOR_FEATURE_GAP_MATRIX_ERA17_FORBIDDEN_CLAIMS = [
  "toast or square hardware parity",
  "production sso or soc2 type ii",
  "scim provisioning",
  "unified inventory or unified rewards",
  "offline pos",
  "rush-hour kds certification",
  "live doordash uber grubhub marketplace ops",
  "public api enterprise sla",
  "competitor feature parity without pilot proof",
] as const;

export const COMPETITOR_FEATURE_GAP_MATRIX_ERA17_CI_SCRIPTS = [
  "test:ci:competitor-feature-gap-matrix-era17",
  "test:ci:competitor-feature-gap-matrix-era17:cert",
] as const;

export const COMPETITOR_FEATURE_GAP_MATRIX_ERA17_UNIT_TESTS = [
  "tests/unit/competitor-feature-gap-matrix-era17-policy.test.ts",
  "tests/unit/competitor-feature-gap-matrix-summary.test.ts",
  "tests/unit/competitor-feature-gap-matrix-era17-cert-live.test.ts",
] as const;

export const COMPETITOR_FEATURE_GAP_MATRIX_ERA17_CANONICAL_DOC_PATHS = [
  COMPETITOR_FEATURE_GAP_MATRIX_ERA17_DOC,
  "docs/full-strategic-reaudit-2026-05-28-era16.md",
  "docs/commercial-pilot-runbook.md",
  "docs/feature-maturity-matrix.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
  "docs/era17-strategic-execution-map-2026-05-28.md",
  "docs/investor-narrative-onepager-era17.md",
] as const;

export const COMPETITOR_FEATURE_GAP_MATRIX_ERA17_REVIEW_SECTION =
  "Era 17 competitor feature gap matrix refresh (2026-05-28)" as const;

export const COMPETITOR_FEATURE_GAP_MATRIX_ERA17_BACKLOG_ID = "KOS-E17-035" as const;
