/**
 * Public API per-route scope enforcement — Evolution Era 17 Workstream I Cycle 35.
 *
 * Enforces documented Developer API scopes on all Public API v1 routes.
 * Does NOT claim production SLA, SCIM, or full scope UI for key creation.
 */

import { PUBLIC_API_PARTNER_CONFIDENCE_ERA16_POLICY_ID } from "@/lib/api-public/public-api-partner-confidence-era16-policy";
import { PUBLIC_API_V1_RESOURCE_COUNT } from "@/lib/api-public/public-api-v1-registry";
import {
  PUBLIC_API_V1_HIGH_RISK_ROUTE_SCOPES,
  PUBLIC_API_V1_ROUTE_SCOPE_REQUIREMENTS,
} from "@/lib/api-public/public-api-v1-route-scopes";

export const PUBLIC_API_PER_ROUTE_SCOPE_ERA17_POLICY_ID =
  "era17-public-api-per-route-scope-v1" as const;

export const PUBLIC_API_PER_ROUTE_SCOPE_ERA17_DECISION_DATE = "2026-05-28" as const;

export const PUBLIC_API_PER_ROUTE_SCOPE_ERA17_EXTENDS_POLICIES = [
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_POLICY_ID,
] as const;

/** Runtime guard + cert proof — not live staging API key smoke. */
export const PUBLIC_API_PER_ROUTE_SCOPE_ERA17_PROOF_STATUS =
  "per_route_scope_enforced" as const;

export const PUBLIC_API_PER_ROUTE_SCOPE_ERA17_GUARD_MODULE =
  "lib/api-public/guard.ts" as const;

export const PUBLIC_API_PER_ROUTE_SCOPE_ERA17_SCOPE_MODULE =
  "lib/api-public/public-api-v1-route-scopes.ts" as const;

export const PUBLIC_API_PER_ROUTE_SCOPE_ERA17_ROUTE_COUNT =
  PUBLIC_API_V1_ROUTE_SCOPE_REQUIREMENTS.length;

export const PUBLIC_API_PER_ROUTE_SCOPE_ERA17_HIGH_RISK_ROUTES =
  PUBLIC_API_V1_HIGH_RISK_ROUTE_SCOPES;

export const PUBLIC_API_PER_ROUTE_SCOPE_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-public-api-per-route-scope-era17.ts" as const;

export const PUBLIC_API_PER_ROUTE_SCOPE_ERA17_SUMMARY_ARTIFACT =
  "artifacts/public-api-per-route-scope-summary.json" as const;

export const PUBLIC_API_PER_ROUTE_SCOPE_ERA17_NPM_SCRIPT =
  "smoke:public-api-per-route-scope" as const;

export const PUBLIC_API_PER_ROUTE_SCOPE_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Review lib/api-public/public-api-v1-route-scopes.ts for route → scope mapping.",
  "Confirm guardPublicApiV1Resource enforces required scope before handler logic.",
  "Issue restricted API keys with scopesJson for partner pilots when needed.",
  "Run npm run smoke:public-api-per-route-scope — review cert chain PASS.",
  "Optional live proof: npm run smoke:public-api-live with staging credentials.",
  "Do not claim production SLA, unlimited rate limits, or full scope picker UI.",
] as const;

export const PUBLIC_API_PER_ROUTE_SCOPE_ERA17_CANONICAL_MARKERS = [
  PUBLIC_API_PER_ROUTE_SCOPE_ERA17_POLICY_ID,
  "smoke:public-api-per-route-scope",
  "per_route_scope_enforced",
  "guardPublicApiV1Resource",
  "orders:write",
] as const;

export const PUBLIC_API_PER_ROUTE_SCOPE_ERA17_FORBIDDEN_CLAIMS = [
  "production sla for public api",
  "full per-key scope admin ui",
  "soc 2 type ii certified api",
  "unlimited api rate limits",
  "all scopes enforced without api key scopesJson",
] as const;

export const PUBLIC_API_PER_ROUTE_SCOPE_ERA17_CI_SCRIPTS = [
  "test:ci:public-api-per-route-scope-era17",
  "test:ci:public-api-per-route-scope-era17:cert",
] as const;

export const PUBLIC_API_PER_ROUTE_SCOPE_ERA17_UNIT_TESTS = [
  "tests/unit/public-api-per-route-scope-era17-policy.test.ts",
  "tests/unit/public-api-v1-route-scopes.test.ts",
  "tests/unit/public-api-scope-guard.test.ts",
  "tests/unit/public-api-per-route-scope-era17-cert-live.test.ts",
] as const;

export const PUBLIC_API_PER_ROUTE_SCOPE_ERA17_CANONICAL_DOC_PATHS = [
  "docs/API_WEBHOOK_DEVELOPER_CONTRACT_MATURITY.md",
  "docs/commercial-pilot-runbook.md",
  "docs/enterprise-procurement-pack.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/feature-maturity-matrix.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
] as const;

export const PUBLIC_API_PER_ROUTE_SCOPE_ERA17_REVIEW_SECTION =
  "Era 17 public API per-route scope enforcement (2026-05-28)" as const;

export const PUBLIC_API_PER_ROUTE_SCOPE_ERA17_BACKLOG_ID = "KOS-E17-019" as const;

export const PUBLIC_API_PER_ROUTE_SCOPE_ERA17_HONEST_SCOPE = {
  claimsProductionSla: false,
  claimsFullScopeAdminUi: false,
  v1ResourceCount: PUBLIC_API_V1_RESOURCE_COUNT,
  enforcedRouteCount: PUBLIC_API_V1_ROUTE_SCOPE_REQUIREMENTS.length,
  highRiskRouteCount: PUBLIC_API_V1_HIGH_RISK_ROUTE_SCOPES.length,
} as const;
