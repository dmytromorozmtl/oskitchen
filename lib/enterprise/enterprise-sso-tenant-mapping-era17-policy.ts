/**
 * Enterprise SSO tenant / domain mapping hardening — Evolution Era 17 Workstream A Cycle 5.
 *
 * Certifies callback guard deny paths for cross-tenant and wrong-domain SSO access.
 * Does NOT claim production SSO, pilot_ready, or SOC2/SCIM.
 */

import { ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_POLICY_ID } from "@/lib/enterprise/enterprise-sso-operator-runbook-era17-policy";
import { ENTERPRISE_SSO_R2_RUNTIME_ERA16_POLICY_ID } from "@/lib/enterprise/enterprise-sso-r2-runtime-era16-policy";

export const ENTERPRISE_SSO_TENANT_MAPPING_ERA17_POLICY_ID =
  "era17-enterprise-sso-tenant-mapping-v1" as const;

export const ENTERPRISE_SSO_TENANT_MAPPING_ERA17_DECISION_DATE = "2026-05-28" as const;

export const ENTERPRISE_SSO_TENANT_MAPPING_ERA17_EXTENDS_POLICIES = [
  ENTERPRISE_SSO_R2_RUNTIME_ERA16_POLICY_ID,
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_POLICY_ID,
] as const;

/** Unit matrix covers required deny/allow paths — SSO delivery unchanged. */
export const ENTERPRISE_SSO_TENANT_MAPPING_ERA17_PROOF_STATUS =
  "tenant_mapping_test_backed" as const;

export const ENTERPRISE_SSO_TENANT_MAPPING_ERA17_SSO_DELIVERY_STATUS =
  "pilot_foundation" as const;

export const ENTERPRISE_SSO_TENANT_MAPPING_ERA17_GUARD_MODULE =
  "lib/enterprise/workspace-sso-runtime-adapter.ts" as const;

export const ENTERPRISE_SSO_TENANT_MAPPING_ERA17_FOUNDATION_MODULE =
  "lib/enterprise/workspace-sso-foundation.ts" as const;

/** Required callback guard scenarios — each must have a unit test assertion. */
export const ENTERPRISE_SSO_TENANT_MAPPING_ERA17_REQUIRED_SCENARIOS = [
  "wrong_email_domain_denied",
  "wrong_workspace_uuid_denied",
  "disabled_sso_pilot_denied",
  "missing_provider_ref_denied",
  "no_entitlement_denied",
  "valid_pilot_workspace_allowed",
] as const;

export const ENTERPRISE_SSO_TENANT_MAPPING_ERA17_ADDITIONAL_DENY_SCENARIOS = [
  "missing_workspace_context_denied",
  "sso_not_configured_denied",
  "missing_email_denied",
  "missing_idp_subject_denied",
  "idp_vendor_mismatch_denied",
  "pilot_configured_not_active_denied",
] as const;

export const ENTERPRISE_SSO_TENANT_MAPPING_ERA17_FORBIDDEN_CLAIMS = [
  "production sso for all tenants",
  "cross-tenant sso without workspace gate",
  "pilot_ready without idp login artifact",
  "soc2 type ii or scim",
] as const;

export const ENTERPRISE_SSO_TENANT_MAPPING_ERA17_CI_SCRIPTS = [
  "test:ci:enterprise-sso-tenant-mapping-era17",
  "test:ci:enterprise-sso-tenant-mapping-era17:cert",
] as const;

export const ENTERPRISE_SSO_TENANT_MAPPING_ERA17_UNIT_TESTS = [
  "tests/unit/enterprise-sso-tenant-mapping-era17-policy.test.ts",
  "tests/unit/enterprise-sso-tenant-mapping-era17.test.ts",
  "tests/unit/enterprise-sso-tenant-mapping-era17-cert-live.test.ts",
  "tests/unit/workspace-sso-runtime-adapter.test.ts",
  "tests/unit/workspace-sso-foundation.test.ts",
] as const;

export const ENTERPRISE_SSO_TENANT_MAPPING_ERA17_CANONICAL_DOC_PATHS = [
  "docs/enterprise-sso-r2-pilot-design.md",
  "docs/enterprise-sso-operator-runbook-era17.md",
  "docs/commercial-pilot-runbook.md",
  "docs/feature-maturity-matrix.md",
  "docs/implementation-backlog.md",
  "docs/era17-strategic-execution-map-2026-05-28.md",
] as const;

export const ENTERPRISE_SSO_TENANT_MAPPING_ERA17_REVIEW_SECTION =
  "Era 17 enterprise SSO tenant mapping hardening (2026-05-28)" as const;

export const ENTERPRISE_SSO_TENANT_MAPPING_ERA17_BACKLOG_ID = "KOS-E17-040" as const;
