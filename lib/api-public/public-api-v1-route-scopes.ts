/**
 * Public API v1 per-route scope requirements — canonical mapping for guard enforcement.
 */

import type { DeveloperApiScope } from "@/lib/developer/api-scopes";

import type {
  PublicApiV1HttpMethod,
  PublicApiV1ResourceId,
} from "@/lib/api-public/public-api-v1-registry";

export type PublicApiV1RouteScopeRequirement = {
  resourceId: PublicApiV1ResourceId;
  method: PublicApiV1HttpMethod;
  requiredScope: DeveloperApiScope;
  riskTier: "high" | "medium" | "low";
};

/** Highest-risk write routes enforced first in Era 17 Cycle 19. */
export const PUBLIC_API_V1_HIGH_RISK_ROUTE_SCOPES = [
  {
    resourceId: "orders",
    method: "POST",
    requiredScope: "orders:write",
    riskTier: "high",
  },
  {
    resourceId: "webhooks",
    method: "POST",
    requiredScope: "webhooks:receive",
    riskTier: "high",
  },
  {
    resourceId: "recipes",
    method: "POST",
    requiredScope: "menus:read",
    riskTier: "medium",
  },
] as const satisfies readonly PublicApiV1RouteScopeRequirement[];

const ROUTE_SCOPE_MAP: Record<
  PublicApiV1ResourceId,
  Partial<Record<PublicApiV1HttpMethod, DeveloperApiScope>>
> = {
  products: { GET: "products:read" },
  customers: { GET: "customers:read" },
  orders: { GET: "orders:read", POST: "orders:write" },
  inventory: { GET: "products:read" },
  locations: { GET: "integrations:read" },
  recipes: { GET: "menus:read", POST: "menus:read" },
  staff: { GET: "integrations:read" },
  webhooks: { GET: "integrations:read", POST: "webhooks:receive" },
};

export const PUBLIC_API_V1_ROUTE_SCOPE_REQUIREMENTS: readonly PublicApiV1RouteScopeRequirement[] =
  (Object.entries(ROUTE_SCOPE_MAP) as [PublicApiV1ResourceId, Partial<Record<PublicApiV1HttpMethod, DeveloperApiScope>>][]).flatMap(
    ([resourceId, methods]) =>
      (Object.entries(methods) as [PublicApiV1HttpMethod, DeveloperApiScope][]).map(
        ([method, requiredScope]) => {
          const highRisk = PUBLIC_API_V1_HIGH_RISK_ROUTE_SCOPES.find(
            (entry) => entry.resourceId === resourceId && entry.method === method,
          );
          return {
            resourceId,
            method,
            requiredScope,
            riskTier: highRisk?.riskTier ?? "low",
          };
        },
      ),
  );

export function getRequiredScopeForPublicApiRoute(
  resourceId: PublicApiV1ResourceId,
  method: PublicApiV1HttpMethod,
): DeveloperApiScope {
  const scope = ROUTE_SCOPE_MAP[resourceId]?.[method];
  if (!scope) {
    throw new Error(`No scope mapping for public API route ${resourceId} ${method}`);
  }
  return scope;
}
