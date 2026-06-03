/**
 * Public API key scope E2E policy (QA-26).
 *
 * Scoped kos_ keys must receive 403 when calling routes outside granted scopes.
 *
 * @see e2e/public-api-key-scope.spec.ts
 * @see lib/api-public/guard.ts
 * @see docs/pen-test-plan.md PT-05
 */

import type { DeveloperApiScope } from "@/lib/developer/api-scopes";

import {
  getRequiredScopeForPublicApiRoute,
  PUBLIC_API_V1_HIGH_RISK_ROUTE_SCOPES,
} from "@/lib/api-public/public-api-v1-route-scopes";

export const PUBLIC_API_KEY_SCOPE_E2E_POLICY_ID = "public-api-key-scope-e2e-v1" as const;

export const PUBLIC_API_V1_BASE_PATH = "/api/public/v1" as const;

export const PUBLIC_API_SCOPE_FORBIDDEN_STATUS = 403 as const;
export const PUBLIC_API_SCOPE_UNAUTHORIZED_STATUS = 401 as const;

export const PUBLIC_API_SCOPE_FORBIDDEN_MESSAGE = "Forbidden" as const;

export type PublicApiScopeDenialCase = {
  id: string;
  grantedScopes: readonly DeveloperApiScope[];
  resourceId: "orders" | "products" | "customers" | "webhooks";
  method: "GET" | "POST";
  path: string;
  requiredScope: DeveloperApiScope;
};

export const PUBLIC_API_KEY_SCOPE_DENIAL_CASES: readonly PublicApiScopeDenialCase[] = [
  {
    id: "orders-read-cannot-post",
    grantedScopes: ["orders:read", "products:read"],
    resourceId: "orders",
    method: "POST",
    path: `${PUBLIC_API_V1_BASE_PATH}/orders`,
    requiredScope: "orders:write",
  },
  {
    id: "products-read-cannot-list-orders",
    grantedScopes: ["products:read"],
    resourceId: "orders",
    method: "GET",
    path: `${PUBLIC_API_V1_BASE_PATH}/orders`,
    requiredScope: "orders:read",
  },
  {
    id: "integrations-read-cannot-post-webhooks",
    grantedScopes: ["integrations:read"],
    resourceId: "webhooks",
    method: "POST",
    path: `${PUBLIC_API_V1_BASE_PATH}/webhooks`,
    requiredScope: "webhooks:receive",
  },
] as const;

export type PublicApiScopeAllowCase = {
  id: string;
  grantedScopes: readonly DeveloperApiScope[];
  resourceId: "orders" | "products" | "customers";
  method: "GET";
  path: string;
  requiredScope: DeveloperApiScope;
};

export const PUBLIC_API_KEY_SCOPE_ALLOW_CASES: readonly PublicApiScopeAllowCase[] = [
  {
    id: "orders-read-can-list",
    grantedScopes: ["orders:read"],
    resourceId: "orders",
    method: "GET",
    path: `${PUBLIC_API_V1_BASE_PATH}/orders`,
    requiredScope: "orders:read",
  },
  {
    id: "products-read-can-list",
    grantedScopes: ["products:read"],
    resourceId: "products",
    method: "GET",
    path: `${PUBLIC_API_V1_BASE_PATH}/products`,
    requiredScope: "products:read",
  },
  {
    id: "customers-read-can-list",
    grantedScopes: ["customers:read"],
    resourceId: "customers",
    method: "GET",
    path: `${PUBLIC_API_V1_BASE_PATH}/customers`,
    requiredScope: "customers:read",
  },
] as const;

export function publicApiPathForResource(resourceId: string): string {
  return `${PUBLIC_API_V1_BASE_PATH}/${resourceId}`;
}

export function isPublicApiScopeForbiddenStatus(status: number): boolean {
  return status === PUBLIC_API_SCOPE_FORBIDDEN_STATUS;
}

export function highRiskPublicApiWriteScopes(): readonly DeveloperApiScope[] {
  return PUBLIC_API_V1_HIGH_RISK_ROUTE_SCOPES.map((entry) => entry.requiredScope);
}

export function requiredScopeForDenialCase(
  denialCase: PublicApiScopeDenialCase,
): DeveloperApiScope {
  return getRequiredScopeForPublicApiRoute(denialCase.resourceId, denialCase.method);
}
