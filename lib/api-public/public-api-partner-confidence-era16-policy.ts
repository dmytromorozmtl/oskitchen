/**
 * Public API partner confidence — Evolution Era 16 Cycle 12.
 *
 * Makes partner/integration-led pilot readiness evaluable without reading all docs.
 * Does NOT claim production SLA or unlimited API throughput.
 */

import { PUBLIC_API_V1_RESOURCE_COUNT } from "@/lib/api-public/public-api-v1-registry";

export const PUBLIC_API_PARTNER_CONFIDENCE_ERA16_POLICY_ID =
  "era16-public-api-partner-confidence-v1" as const;

export const PUBLIC_API_PARTNER_CONFIDENCE_ERA16_DECISION_DATE = "2026-05-28" as const;

export const PUBLIC_API_PARTNER_CONFIDENCE_ERA16_EXTENDS_POLICIES = [
  "era4-channel-golden-path-v1",
  "era15-enterprise-procurement-recert-v1",
] as const;

export const PUBLIC_API_PARTNER_CONFIDENCE_ERA16_MODULE =
  "lib/api-public/public-api-partner-confidence-pack.ts" as const;

export const PUBLIC_API_PARTNER_CONFIDENCE_ERA16_REGISTRY_MODULE =
  "lib/api-public/public-api-v1-registry.ts" as const;

export const PUBLIC_API_PARTNER_CONFIDENCE_ERA16_CERT_SCRIPT =
  "scripts/cert-public-api-partner-confidence-era16.ts" as const;

export const PUBLIC_API_PARTNER_CONFIDENCE_ERA16_LIVE_SMOKE_SCRIPT =
  "scripts/smoke-public-api-live-era16.ts" as const;

export const PUBLIC_API_PARTNER_CONFIDENCE_ERA16_SUMMARY_ARTIFACT =
  "artifacts/public-api-partner-confidence-summary.json" as const;

export const PUBLIC_API_PARTNER_CONFIDENCE_ERA16_DEVELOPER_DOC =
  "docs/API_WEBHOOK_DEVELOPER_CONTRACT_MATURITY.md" as const;

export const PUBLIC_API_PARTNER_CONFIDENCE_ERA16_LIVE_SMOKE_NPM =
  "smoke:public-api-live" as const;

export const PUBLIC_API_PARTNER_CONFIDENCE_ERA16_LEGACY_SMOKE_NPM =
  "smoke:public-api" as const;

export const PUBLIC_API_PARTNER_CONFIDENCE_ERA16_HONEST_SCOPE = {
  claimsProductionSla: false,
  claimsUnlimitedRateLimits: false,
  claimsFullMarketplaceViaApi: false,
  claimsSoc2CertifiedApi: false,
  v1ResourceCount: PUBLIC_API_V1_RESOURCE_COUNT,
  singlePagePartnerReadiness: true,
} as const;

export const PUBLIC_API_PARTNER_CONFIDENCE_ERA16_CANONICAL_MARKERS = [
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_POLICY_ID,
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_MODULE,
  "public-api-partner-confidence",
  "partner readiness",
] as const;

export const PUBLIC_API_PARTNER_CONFIDENCE_ERA16_FORBIDDEN_CLAIMS = [
  "unlimited api rate limits",
  "production sla for public api",
  "soc 2 type ii certified api",
  "full marketplace integration via public api",
  "guaranteed webhook delivery",
  "enterprise sso via api key",
] as const;

export const PUBLIC_API_PARTNER_CONFIDENCE_ERA16_DEVELOPER_DOC_SECTIONS = [
  "Partner readiness (Era 16)",
  "Public API v1 auth and entitlement",
  "Standard error responses",
  "Rate limits",
  "Partner integration checklist",
] as const;

export const PUBLIC_API_PARTNER_CONFIDENCE_ERA16_CI_SCRIPTS = [
  "test:ci:public-api-partner-confidence-era16",
  "test:ci:public-api-partner-confidence-era16:cert",
] as const;

export const PUBLIC_API_PARTNER_CONFIDENCE_ERA16_UNIT_TESTS = [
  "tests/unit/public-api-v1-registry.test.ts",
  "tests/unit/public-api-partner-confidence-pack.test.ts",
  "tests/unit/public-api-partner-confidence-era16-policy.test.ts",
  "tests/unit/public-api-partner-confidence-era16-cert-live.test.ts",
] as const;

export const PUBLIC_API_PARTNER_CONFIDENCE_ERA16_CANONICAL_DOC_PATHS = [
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_DEVELOPER_DOC,
  "docs/feature-maturity-matrix.md",
  "docs/enterprise-procurement-pack.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/implementation-backlog.md",
] as const;

export const PUBLIC_API_PARTNER_CONFIDENCE_ERA16_REVIEW_SECTION =
  "Era 16 public API partner confidence (2026-05-28)" as const;
