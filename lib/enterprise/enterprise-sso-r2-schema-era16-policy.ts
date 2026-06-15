/**
 * Enterprise SSO R2 schema foundation — Evolution Era 16 Cycle 2.
 *
 * Adds Prisma models for workspace SSO settings and IdP identity mapping.
 * Does **not** wire login UI, Supabase SAML callback, or production SSO delivery.
 */

export const ENTERPRISE_SSO_R2_SCHEMA_ERA16_POLICY_ID =
  "era16-enterprise-sso-r2-schema-v1" as const;

export const ENTERPRISE_SSO_R2_SCHEMA_ERA16_EXTENDS_POLICIES = [
  "era16-enterprise-sso-r2-pilot-v1",
  "era9-enterprise-sso-architecture-spike-v1",
] as const;

export const ENTERPRISE_SSO_R2_SCHEMA_ERA16_DECISION_DATE = "2026-05-28" as const;

/** R2 pilot progressed from design_locked → schema_ready (Cycle 2). */
export const ENTERPRISE_SSO_R2_SCHEMA_ERA16_PILOT_STATUS = "schema_ready" as const;

/** Schema exists; runtime SSO login not wired — not production delivery. */
export const ENTERPRISE_SSO_R2_SCHEMA_ERA16_SSO_DELIVERY_STATUS =
  "pilot_foundation" as const;

export const ENTERPRISE_SSO_R2_SCHEMA_ERA16_PRISMA_MODELS = [
  "WorkspaceSsoSettings",
  "SsoIdentity",
] as const;

export const ENTERPRISE_SSO_R2_SCHEMA_ERA16_PRISMA_ENUMS = [
  "SsoIdpVendor",
  "SsoPilotPhase",
] as const;

export const ENTERPRISE_SSO_R2_SCHEMA_ERA16_MIGRATION =
  "prisma/migrations/20260528120000_enterprise_sso_r2_schema/migration.sql" as const;

export const ENTERPRISE_SSO_R2_SCHEMA_ERA16_FOUNDATION_MODULE =
  "lib/enterprise/workspace-sso-foundation.ts" as const;

export const ENTERPRISE_SSO_R2_SCHEMA_ERA16_REVIEW_SECTION =
  "Era 16 SSO R2 schema foundation (2026-05-28)" as const;

export const ENTERPRISE_SSO_R2_SCHEMA_ERA16_DEFAULTS = {
  enabled: false,
  pilotPhase: "DISABLED",
  breakGlassOwnerEnabled: true,
} as const;

export const ENTERPRISE_SSO_R2_SCHEMA_ERA16_CANONICAL_MARKERS = [
  ENTERPRISE_SSO_R2_SCHEMA_ERA16_POLICY_ID,
  ENTERPRISE_SSO_R2_SCHEMA_ERA16_PILOT_STATUS,
  ENTERPRISE_SSO_R2_SCHEMA_ERA16_SSO_DELIVERY_STATUS,
  "pilot_foundation",
  "schema_ready",
] as const;

export const ENTERPRISE_SSO_R2_SCHEMA_ERA16_FORBIDDEN_DELIVERY_CLAIMS = [
  "SSO is available in production",
  "SAML login is live",
  "enterprise SSO included",
  "OIDC SSO enabled for all tenants",
] as const;

export const ENTERPRISE_SSO_R2_SCHEMA_ERA16_CI_SCRIPTS = [
  "test:ci:enterprise-sso-r2-schema-era16",
  "test:ci:enterprise-sso-r2-schema-era16:cert",
] as const;

export const ENTERPRISE_SSO_R2_SCHEMA_ERA16_UNIT_TESTS = [
  "tests/unit/enterprise-sso-r2-schema-era16-policy.test.ts",
  "tests/unit/enterprise-sso-r2-schema-era16-cert-live.test.ts",
  "tests/unit/enterprise-sso-r2-schema.test.ts",
  "tests/unit/workspace-sso-foundation.test.ts",
] as const;

export const ENTERPRISE_SSO_R2_SCHEMA_ERA16_CANONICAL_DOC_PATHS = [
  "docs/enterprise-sso-r2-pilot-design.md",
  "docs/enterprise-procurement-pack.md",
  "docs/feature-maturity-matrix.md",
] as const;
