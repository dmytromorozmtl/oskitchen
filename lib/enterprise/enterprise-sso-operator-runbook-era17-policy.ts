/**
 * Enterprise SSO operator runbook — Evolution Era 17 Workstream A Cycle 4.
 *
 * Support boundaries for qualified SSO pilot — break-glass, rollback, entitlements.
 * Does NOT claim production SSO, pilot_ready, or SOC2/SCIM.
 */

import { ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_POLICY_ID } from "@/lib/enterprise/enterprise-sso-idp-login-proof-era17-policy";
import { ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID } from "@/lib/enterprise/enterprise-sso-idp-staging-smoke-era17-policy";

export const ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_POLICY_ID =
  "era17-enterprise-sso-operator-runbook-v1" as const;

export const ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_DECISION_DATE = "2026-05-28" as const;

export const ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_EXTENDS_POLICIES = [
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID,
  ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_POLICY_ID,
] as const;

/** Doc + cert wired — SSO delivery remains pilot_foundation until Cycle 2 proof. */
export const ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_PROOF_STATUS =
  "operator_runbook_ready" as const;

export const ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_SSO_DELIVERY_STATUS =
  "pilot_foundation" as const;

export const ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_OPERATOR_DOC =
  "docs/enterprise-sso-operator-runbook-era17.md" as const;

export const ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_SUMMARY_MODULE =
  "lib/enterprise/enterprise-sso-operator-runbook-summary.ts" as const;

export const ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-enterprise-sso-operator-runbook-era17.ts" as const;

export const ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_SUMMARY_ARTIFACT =
  "artifacts/enterprise-sso-operator-runbook-summary.json" as const;

export const ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_NPM_SCRIPT =
  "smoke:enterprise-sso-operator-runbook" as const;

export const ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_REQUIRED_SECTIONS = [
  "Purpose and honest scope",
  "Break-glass process",
  "Rollback procedure",
  "Support boundaries",
  "Entitlement handling",
  "Owner and admin responsibilities",
  "Common failure modes",
  "Audit event expectations",
  "Customer-facing limitations",
  "Forbidden claims",
] as const;

export const ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_ROLLBACK_STEPS = [
  "Settings → Security → SSO pilot → Deactivate (PILOT_CONFIGURED or DISABLED)",
  "Disable or remove Supabase SAML provider for pilot ref",
  "Confirm /login Sign in with SSO fails closed for workspace UUID",
  "Verify break-glass owner email/password when breakGlassOwnerEnabled",
  "Document rollback timestamp and operator in ops log",
] as const;

export const ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_SUPPORT_BOUNDARIES = [
  "Qualified pilot workspace only — one IdP vendor per workspace",
  "Okta or Entra ID staging/test tenant — not production IdP for all customers",
  "Break-glass owner login only when configured and IdP unavailable",
  "No 24/7 SSO SLA — engineering escalation for misconfiguration",
  "No SCIM provisioning or SOC2 Type II attestation",
] as const;

export const ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_AUDIT_EVENTS = [
  "sso.login_success",
  "sso.login_denied",
  "sso.break_glass_used",
] as const;

export const ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_FORBIDDEN_CLAIMS = [
  "production sso for all tenants",
  "pilot_ready without idp login artifact",
  "soc2 type ii or scim",
  "enterprise sso included in all plans",
  "saml live today without staging proof",
] as const;

export const ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_CI_SCRIPTS = [
  "test:ci:enterprise-sso-operator-runbook-era17",
  "test:ci:enterprise-sso-operator-runbook-era17:cert",
] as const;

export const ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_UNIT_TESTS = [
  "tests/unit/enterprise-sso-operator-runbook-era17-policy.test.ts",
  "tests/unit/enterprise-sso-operator-runbook-summary.test.ts",
  "tests/unit/enterprise-sso-operator-runbook-era17-cert-live.test.ts",
] as const;

export const ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_CANONICAL_DOC_PATHS = [
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_OPERATOR_DOC,
  "docs/enterprise-sso-idp-staging-smoke-plan.md",
  "docs/enterprise-sso-r2-pilot-design.md",
  "docs/enterprise-procurement-pack.md",
  "docs/commercial-pilot-runbook.md",
  "docs/feature-maturity-matrix.md",
  "docs/implementation-backlog.md",
  "docs/era17-strategic-execution-map-2026-05-28.md",
] as const;

export const ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_REVIEW_SECTION =
  "Era 17 enterprise SSO operator runbook (2026-05-28)" as const;

export const ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_BACKLOG_ID = "KOS-E17-039" as const;
