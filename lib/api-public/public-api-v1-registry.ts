/**
 * Public API v1 resource registry — canonical partner contract surface.
 *
 * Used by partner confidence pack, OpenAPI generation, and CI validation.
 */

import type { RateLimitPolicyKey } from "@/lib/rate-limit/rate-limit-policies";

export type PublicApiV1HttpMethod = "GET" | "POST";

export type PublicApiV1ResourceId =
  | "products"
  | "customers"
  | "orders"
  | "inventory"
  | "locations"
  | "recipes"
  | "staff"
  | "webhooks";

export type PublicApiV1ResourceDefinition = {
  id: PublicApiV1ResourceId;
  path: `/api/public/v1/${PublicApiV1ResourceId}`;
  routeFile: `app/api/public/v1/${PublicApiV1ResourceId}/route.ts`;
  methods: readonly PublicApiV1HttpMethod[];
  rateLimitPolicy: RateLimitPolicyKey;
  postRateLimitPolicy?: RateLimitPolicyKey;
  scopeHints: readonly string[];
  notes: string;
};

export const PUBLIC_API_V1_RESOURCES: readonly PublicApiV1ResourceDefinition[] = [
  {
    id: "products",
    path: "/api/public/v1/products",
    routeFile: "app/api/public/v1/products/route.ts",
    methods: ["GET"],
    rateLimitPolicy: "public_api_v1_get",
    scopeHints: ["products:read"],
    notes: "Read-only catalog / menu items for the workspace.",
  },
  {
    id: "customers",
    path: "/api/public/v1/customers",
    routeFile: "app/api/public/v1/customers/route.ts",
    methods: ["GET"],
    rateLimitPolicy: "public_api_customers_get",
    scopeHints: ["customers:read"],
    notes: "Paginated CRM profiles scoped to workspace owner userId.",
  },
  {
    id: "orders",
    path: "/api/public/v1/orders",
    routeFile: "app/api/public/v1/orders/route.ts",
    methods: ["GET", "POST"],
    rateLimitPolicy: "public_api_orders_get",
    postRateLimitPolicy: "public_api_orders_post",
    scopeHints: ["orders:read", "orders:write"],
    notes: "List recent orders (GET) or create manual/public-api orders (POST).",
  },
  {
    id: "inventory",
    path: "/api/public/v1/inventory",
    routeFile: "app/api/public/v1/inventory/route.ts",
    methods: ["GET"],
    rateLimitPolicy: "public_api_v1_get",
    scopeHints: ["products:read"],
    notes: "Read inventory levels — POS-only depletion policy applies to stock changes elsewhere.",
  },
  {
    id: "locations",
    path: "/api/public/v1/locations",
    routeFile: "app/api/public/v1/locations/route.ts",
    methods: ["GET"],
    rateLimitPolicy: "public_api_v1_get",
    scopeHints: ["integrations:read"],
    notes: "Workspace locations/brands for order creation context.",
  },
  {
    id: "recipes",
    path: "/api/public/v1/recipes",
    routeFile: "app/api/public/v1/recipes/route.ts",
    methods: ["GET", "POST"],
    rateLimitPolicy: "public_api_v1_get",
    postRateLimitPolicy: "public_api_v1_post",
    scopeHints: ["products:read", "menus:read"],
    notes: "Recipe read + bounded POST validation for partner integrations.",
  },
  {
    id: "staff",
    path: "/api/public/v1/staff",
    routeFile: "app/api/public/v1/staff/route.ts",
    methods: ["GET"],
    rateLimitPolicy: "public_api_v1_get",
    scopeHints: ["integrations:read"],
    notes: "Staff directory metadata — no credential or PII secrets in responses.",
  },
  {
    id: "webhooks",
    path: "/api/public/v1/webhooks",
    routeFile: "app/api/public/v1/webhooks/route.ts",
    methods: ["GET", "POST"],
    rateLimitPolicy: "public_api_v1_get",
    postRateLimitPolicy: "public_api_v1_post",
    scopeHints: ["webhooks:receive", "integrations:read"],
    notes: "Outbound webhook subscription management for workspace integrations.",
  },
] as const;

export const PUBLIC_API_V1_RESOURCE_COUNT = PUBLIC_API_V1_RESOURCES.length;

export const PUBLIC_API_V1_PATHS = PUBLIC_API_V1_RESOURCES.map((resource) => resource.path);

export function findPublicApiV1Resource(
  id: PublicApiV1ResourceId,
): PublicApiV1ResourceDefinition {
  const resource = PUBLIC_API_V1_RESOURCES.find((entry) => entry.id === id);
  if (!resource) throw new Error(`Unknown public API v1 resource: ${id}`);
  return resource;
}
