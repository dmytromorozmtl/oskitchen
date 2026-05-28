/**
 * Public API partner confidence pack — Evolution Era 16 Cycle 12.
 *
 * Single partner-readiness surface for integration-led pilots.
 * Does NOT claim production SLA, unlimited throughput, or full marketplace parity.
 */

import {
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_FORBIDDEN_CLAIMS,
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_POLICY_ID,
} from "@/lib/api-public/public-api-partner-confidence-era16-policy";
import {
  PUBLIC_API_V1_RESOURCE_COUNT,
  PUBLIC_API_V1_RESOURCES,
} from "@/lib/api-public/public-api-v1-registry";
import { RATE_LIMIT_POLICIES } from "@/lib/rate-limit/rate-limit-policies";
import { DEVELOPER_API_SCOPES } from "@/lib/developer/api-scopes";

export type PublicApiStandardError = {
  status: 401 | 429 | 503 | 400;
  body: string;
  when: string;
};

export type PublicApiPartnerChecklistItem = {
  id: string;
  task: string;
  verifyHow: string;
  integrationBlocker: boolean;
};

export type PublicApiPartnerReadinessInput = {
  contractTestsPass: boolean;
  wiringCertPass: boolean;
  partnerConfidenceCertPass: boolean;
  liveSmokePass?: boolean;
  liveSmokeSkipped?: boolean;
  openapiIncludesBearer?: boolean;
  enterpriseEntitlementDocumented?: boolean;
};

export type PublicApiPartnerReadinessResult = {
  decision: "READY" | "NOT_READY" | "CONDITIONAL";
  blockers: string[];
  warnings: string[];
};

export type PublicApiPartnerConfidenceSummary = {
  version: typeof PUBLIC_API_PARTNER_CONFIDENCE_ERA16_POLICY_ID;
  generatedAt: string;
  resourceCount: number;
  resources: readonly (typeof PUBLIC_API_V1_RESOURCES)[number][];
  authModel: {
    header: "Authorization: Bearer kos_...";
    entitlement: "api_access feature + paid subscription (dev bypass excepted)";
    resolver: "resolveEnterpriseApiUserId";
    tenantScope: "workspace owner userId from API key";
  };
  standardErrors: readonly PublicApiStandardError[];
  rateLimitPolicies: Record<string, { windowMs: number; max: number }>;
  scopeCatalog: readonly string[];
  contractTestCommands: readonly string[];
  liveSmokeCommand: string;
  openapiEndpoint: string;
  partnerChecklistCount: number;
  forbiddenClaimCount: number;
  readiness: PublicApiPartnerReadinessResult;
};

export const PUBLIC_API_STANDARD_ERRORS: readonly PublicApiStandardError[] = [
  {
    status: 401,
    body: '{ "error": "Unauthorized" }',
    when: "Missing/invalid Bearer key, revoked key, or Enterprise entitlement denied.",
  },
  {
    status: 429,
    body: '{ "error": "Too many requests. Please slow down." }',
    when: "Per-user+IP rate limit exceeded; Retry-After header present.",
  },
  {
    status: 503,
    body: '{ "error": "Public API temporarily unavailable: distributed rate limiting is not configured." }',
    when: "Rate limit backend misconfigured — fail-closed.",
  },
  {
    status: 400,
    body: '{ "error": "Invalid body", "details": { ... } }',
    when: "POST body fails zod validation on mutating routes.",
  },
];

export const PUBLIC_API_PARTNER_CHECKLIST: readonly PublicApiPartnerChecklistItem[] = [
  {
    id: "partner-key",
    task: "Create API key in Dashboard → Developer",
    verifyHow: "Bearer kos_ prefix; key shown once at creation",
    integrationBlocker: true,
  },
  {
    id: "partner-entitlement",
    task: "Confirm workspace has api_access entitlement and paid plan",
    verifyHow: "401 without entitlement; resolveEnterpriseApiUserId gate",
    integrationBlocker: true,
  },
  {
    id: "partner-contract",
    task: "Run npm run test:ci:public-api-v1",
    verifyHow: "All contract + tenant isolation tests green",
    integrationBlocker: true,
  },
  {
    id: "partner-openapi",
    task: "Fetch GET /api/openapi.json for route manifest",
    verifyHow: "All eight /api/public/v1/* paths listed; bearer scheme documented",
    integrationBlocker: false,
  },
  {
    id: "partner-orders",
    task: "Integrate orders read + optional create",
    verifyHow: "GET /api/public/v1/orders returns tenant-scoped data; POST validates body",
    integrationBlocker: true,
  },
  {
    id: "partner-rate-limit",
    task: "Handle 429 with exponential backoff",
    verifyHow: "Respect Retry-After; default 120 req/min on v1 GET",
    integrationBlocker: false,
  },
  {
    id: "partner-live-smoke",
    task: "Optional live smoke with SMOKE_PUBLIC_API_KEY",
    verifyHow: "npm run smoke:public-api-live — SKIPPED WITH REASON without credentials",
    integrationBlocker: false,
  },
  {
    id: "partner-honesty",
    task: "Review forbidden claims before partner deck",
    verifyHow: "No SLA/unlimited/SOC2/marketplace-live claims in contract",
    integrationBlocker: true,
  },
];

export function evaluatePublicApiPartnerReadiness(
  input: PublicApiPartnerReadinessInput,
): PublicApiPartnerReadinessResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!input.contractTestsPass) {
    blockers.push("Public API v1 contract tests must pass (npm run test:ci:public-api-v1).");
  }
  if (!input.wiringCertPass) {
    blockers.push("Public API v1 wiring cert must pass (npm run test:ci:public-api-v1:cert).");
  }
  if (!input.partnerConfidenceCertPass) {
    blockers.push("Partner confidence cert must pass (npm run test:ci:public-api-partner-confidence-era16:cert).");
  }
  if (input.liveSmokeSkipped) {
    warnings.push("Live API smoke skipped — integration proof requires SMOKE_PUBLIC_API_KEY.");
  } else if (input.liveSmokePass === false) {
    blockers.push("Live public API smoke failed with configured credentials.");
  }
  if (input.openapiIncludesBearer === false) {
    warnings.push("OpenAPI document missing bearerApiKey security scheme for public v1 routes.");
  }
  if (input.enterpriseEntitlementDocumented === false) {
    warnings.push("Enterprise entitlement gate not documented for partners.");
  }

  if (blockers.length > 0) {
    return { decision: "NOT_READY", blockers, warnings };
  }
  if (warnings.length > 0) {
    return { decision: "CONDITIONAL", blockers, warnings };
  }
  return { decision: "READY", blockers, warnings };
}

export function validatePublicApiPartnerConfidenceStructure(): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (PUBLIC_API_V1_RESOURCE_COUNT !== 8) {
    errors.push(`Expected 8 public API v1 resources, found ${PUBLIC_API_V1_RESOURCE_COUNT}`);
  }

  const paths = new Set<string>();
  for (const resource of PUBLIC_API_V1_RESOURCES) {
    if (paths.has(resource.path)) {
      errors.push(`Duplicate public API path: ${resource.path}`);
    }
    paths.add(resource.path);
    if (resource.methods.length === 0) {
      errors.push(`Resource ${resource.id} must expose at least one HTTP method`);
    }
  }

  if (PUBLIC_API_PARTNER_CHECKLIST.filter((item) => item.integrationBlocker).length < 4) {
    errors.push("Partner checklist must include at least four integration blockers");
  }

  if (PUBLIC_API_STANDARD_ERRORS.length < 4) {
    errors.push("Standard error catalog must document 401/429/503/400");
  }

  return { ok: errors.length === 0, errors };
}

export function collectPublicApiRateLimitSnapshot(): Record<
  string,
  { windowMs: number; max: number }
> {
  const keys = new Set<string>();
  for (const resource of PUBLIC_API_V1_RESOURCES) {
    keys.add(resource.rateLimitPolicy);
    if (resource.postRateLimitPolicy) keys.add(resource.postRateLimitPolicy);
  }
  const snapshot: Record<string, { windowMs: number; max: number }> = {};
  for (const key of keys) {
    const policy = RATE_LIMIT_POLICIES[key];
    snapshot[key] = { windowMs: policy.windowMs, max: policy.max };
  }
  return snapshot;
}

export function buildPublicApiPartnerConfidenceSummary(
  readinessInput: PublicApiPartnerReadinessInput = {
    contractTestsPass: true,
    wiringCertPass: true,
    partnerConfidenceCertPass: true,
    openapiIncludesBearer: true,
    enterpriseEntitlementDocumented: true,
  },
): PublicApiPartnerConfidenceSummary {
  return {
    version: PUBLIC_API_PARTNER_CONFIDENCE_ERA16_POLICY_ID,
    generatedAt: new Date().toISOString(),
    resourceCount: PUBLIC_API_V1_RESOURCE_COUNT,
    resources: PUBLIC_API_V1_RESOURCES,
    authModel: {
      header: "Authorization: Bearer kos_...",
      entitlement: "api_access feature + paid subscription (dev bypass excepted)",
      resolver: "resolveEnterpriseApiUserId",
      tenantScope: "workspace owner userId from API key",
    },
    standardErrors: PUBLIC_API_STANDARD_ERRORS,
    rateLimitPolicies: collectPublicApiRateLimitSnapshot(),
    scopeCatalog: [...DEVELOPER_API_SCOPES],
    contractTestCommands: [
      "npm run test:ci:public-api-v1:cert",
      "npm run test:ci:public-api-v1",
    ],
    liveSmokeCommand: "npm run smoke:public-api-live",
    openapiEndpoint: "/api/openapi.json",
    partnerChecklistCount: PUBLIC_API_PARTNER_CHECKLIST.length,
    forbiddenClaimCount: PUBLIC_API_PARTNER_CONFIDENCE_ERA16_FORBIDDEN_CLAIMS.length,
    readiness: evaluatePublicApiPartnerReadiness(readinessInput),
  };
}
