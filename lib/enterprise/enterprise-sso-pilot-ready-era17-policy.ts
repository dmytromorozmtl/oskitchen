/**
 * Enterprise SSO pilot_ready gate — Evolution Era 17 Workstream A Cycle 3.
 *
 * Evaluates Cycle 2 IdP staging artifact before any pilot_ready delivery claim.
 * Default remains pilot_foundation until loginProofStatus proof_passed.
 */

import { ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_POLICY_ID } from "@/lib/enterprise/enterprise-sso-idp-login-proof-era17-policy";
import {
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID,
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_SUMMARY_ARTIFACT,
} from "@/lib/enterprise/enterprise-sso-idp-staging-smoke-era17-policy";

export const ENTERPRISE_SSO_PILOT_READY_ERA17_POLICY_ID =
  "era17-enterprise-sso-pilot-ready-v1" as const;

export const ENTERPRISE_SSO_PILOT_READY_ERA17_DECISION_DATE = "2026-05-28" as const;

export const ENTERPRISE_SSO_PILOT_READY_ERA17_EXTENDS_POLICIES = [
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID,
  ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_POLICY_ID,
  "era16-enterprise-sso-r2-admin-v1",
] as const;

/** Gate wired — promotion blocked until Cycle 2 artifact proves IdP login. */
export const ENTERPRISE_SSO_PILOT_READY_ERA17_PROOF_STATUS =
  "awaiting_idp_login_proof" as const;

/** Default buyer-facing delivery until gate evaluates proof_passed. */
export const ENTERPRISE_SSO_PILOT_READY_ERA17_DEFAULT_SSO_DELIVERY_STATUS =
  "pilot_foundation" as const;

/** Qualified delivery status only when Cycle 2 artifact validates. */
export const ENTERPRISE_SSO_PILOT_READY_ERA17_QUALIFIED_DELIVERY_STATUS =
  "pilot_ready" as const;

export const ENTERPRISE_SSO_PILOT_READY_ERA17_INPUT_ARTIFACT =
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_SUMMARY_ARTIFACT;

export const ENTERPRISE_SSO_PILOT_READY_ERA17_SUMMARY_ARTIFACT =
  "artifacts/enterprise-sso-pilot-ready-gate-summary.json" as const;

export const ENTERPRISE_SSO_PILOT_READY_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-enterprise-sso-pilot-ready-gate-era17.ts" as const;

export const ENTERPRISE_SSO_PILOT_READY_ERA17_NPM_SCRIPT =
  "smoke:enterprise-sso-pilot-ready-gate" as const;

export const ENTERPRISE_SSO_PILOT_READY_ERA17_GATE_RUNBOOK_STEPS = [
  "Run npm run smoke:enterprise-sso-idp-staging — Cycle 2 IdP login proof must show loginProofStatus proof_passed.",
  "Run npm run smoke:enterprise-sso-pilot-ready-gate — review artifacts/enterprise-sso-pilot-ready-gate-summary.json.",
  "ssoDeliveryStatus becomes pilot_ready only when input artifact overall PASSED and loginProofStatus proof_passed.",
  "Do not update procurement FAQ or sales claims to pilot_ready until gate summary shows qualified promotion.",
  "Production SSO for all tenants remains forbidden regardless of pilot_ready gate.",
] as const;

export const ENTERPRISE_SSO_PILOT_READY_ERA17_FORBIDDEN_CLAIMS = [
  "production SSO for all tenants",
  "pilot_ready without idp login artifact",
  "enterprise SSO included for all customers",
  "soc2 type ii",
  "scim provisioning is live",
] as const;

export const ENTERPRISE_SSO_PILOT_READY_ERA17_CANONICAL_MARKERS = [
  ENTERPRISE_SSO_PILOT_READY_ERA17_POLICY_ID,
  "awaiting_idp_login_proof",
  "pilot_foundation",
  "enterprise-sso-pilot-ready-gate",
] as const;

export const ENTERPRISE_SSO_PILOT_READY_ERA17_CI_SCRIPTS = [
  "test:ci:enterprise-sso-pilot-ready-era17",
  "test:ci:enterprise-sso-pilot-ready-era17:cert",
] as const;

export const ENTERPRISE_SSO_PILOT_READY_ERA17_UNIT_TESTS = [
  "tests/unit/enterprise-sso-pilot-ready-era17-policy.test.ts",
  "tests/unit/enterprise-sso-pilot-ready-summary.test.ts",
  "tests/unit/enterprise-sso-pilot-ready-era17-cert-live.test.ts",
] as const;

export const ENTERPRISE_SSO_PILOT_READY_ERA17_CANONICAL_DOC_PATHS = [
  "docs/enterprise-sso-r2-pilot-design.md",
  "docs/enterprise-sso-idp-staging-smoke-plan.md",
  "docs/commercial-pilot-runbook.md",
  "docs/enterprise-procurement-pack.md",
  "docs/feature-maturity-matrix.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
] as const;

export const ENTERPRISE_SSO_PILOT_READY_ERA17_REVIEW_SECTION =
  "Era 17 SSO pilot_ready gate (2026-05-28)" as const;

export const ENTERPRISE_SSO_PILOT_READY_ERA17_BACKLOG_ID = "KOS-E17-044" as const;
