/**
 * P0-6 — Cross-tenant API IDOR contract (orders, customers, finance, marketplace).
 * Tenant A authenticated must not read tenant B data via query/body workspace injection.
 */

import type { CrossTenantDenialResult } from "@/lib/qa/cross-tenant-isolation-contract";
import { TENANT_A, TENANT_B, isAcceptedDenialStatus } from "@/lib/qa/cross-tenant-isolation-contract";

export const CROSS_TENANT_API_IDOR_ROUTE_FAMILIES = [
  "orders",
  "customers",
  "finance",
  "marketplace",
] as const;

export type CrossTenantApiIdorRouteFamily = (typeof CROSS_TENANT_API_IDOR_ROUTE_FAMILIES)[number];

/** Mirrors audit export workspace pick — foreign workspaceId must not bind to tenant B. */
export function resolveAuditExportWorkspaceId(input: {
  requestedWorkspaceId: string | undefined;
  ownedWorkspaceIds: readonly string[];
}): string | null {
  if (
    input.requestedWorkspaceId &&
    input.ownedWorkspaceIds.includes(input.requestedWorkspaceId)
  ) {
    return input.requestedWorkspaceId;
  }
  return input.ownedWorkspaceIds[0] ?? null;
}

/** Mock GET /api/public/v1/orders?workspaceId=… — foreign workspace → 403 or own-tenant data only. */
export function mockSessionOrdersGet(input: {
  actorWorkspaceId: string;
  queryWorkspaceId: string | null;
}): { status: number; data: unknown[]; leakedForeignWorkspace: boolean } {
  if (input.queryWorkspaceId && input.queryWorkspaceId !== input.actorWorkspaceId) {
    return {
      status: 403,
      data: [],
      leakedForeignWorkspace: false,
    };
  }
  return {
    status: 200,
    data: [{ id: "order-a-1", workspaceId: input.actorWorkspaceId }],
    leakedForeignWorkspace: false,
  };
}

/** Mock GET /api/public/v1/customers?workspaceId=… */
export function mockSessionCustomersGet(input: {
  actorWorkspaceId: string;
  queryWorkspaceId: string | null;
}): { status: number; data: unknown[] } {
  if (input.queryWorkspaceId && input.queryWorkspaceId !== input.actorWorkspaceId) {
    return { status: 403, data: [] };
  }
  return { status: 200, data: [{ id: "cust-a-1", workspaceId: input.actorWorkspaceId }] };
}

/** Mock finance export/OCR — body workspaceId must match actor workspace or 403. */
export function mockFinanceMutation(input: {
  actorWorkspaceId: string;
  bodyWorkspaceId: string | null;
}): { status: number; accepted: boolean } {
  if (input.bodyWorkspaceId && input.bodyWorkspaceId !== input.actorWorkspaceId) {
    return { status: 403, accepted: false };
  }
  return { status: 200, accepted: true };
}

/** Mock GET /api/marketplace/orders/:id — foreign PO id → 404. */
export function mockMarketplaceOrderGet(input: {
  actorWorkspaceId: string;
  orderWorkspaceId: string;
}): { status: number; body: Record<string, unknown> | null } {
  if (input.orderWorkspaceId !== input.actorWorkspaceId) {
    return { status: 404, body: { error: "Not found" } };
  }
  return { status: 200, body: { id: "po-a", workspaceId: input.actorWorkspaceId } };
}

export function runCrossTenantApiIdorContract(): CrossTenantDenialResult[] {
  const results: CrossTenantDenialResult[] = [];

  const ordersForeign = mockSessionOrdersGet({
    actorWorkspaceId: TENANT_A.workspaceId,
    queryWorkspaceId: TENANT_B.workspaceId,
  });
  results.push({
    scenarioId: "api-orders-foreign-workspace-query",
    passed:
      ordersForeign.status === 403 &&
      isAcceptedDenialStatus(ordersForeign.status) &&
      ordersForeign.data.length === 0,
    denialKind: "403",
    detail: `GET orders?workspaceId=B → status ${ordersForeign.status}`,
  });

  const customersForeign = mockSessionCustomersGet({
    actorWorkspaceId: TENANT_A.workspaceId,
    queryWorkspaceId: TENANT_B.workspaceId,
  });
  results.push({
    scenarioId: "api-customers-foreign-workspace-query",
    passed: customersForeign.status === 403 && customersForeign.data.length === 0,
    denialKind: "403",
    detail: `GET customers?workspaceId=B → status ${customersForeign.status}`,
  });

  const financeForeign = mockFinanceMutation({
    actorWorkspaceId: TENANT_A.workspaceId,
    bodyWorkspaceId: TENANT_B.workspaceId,
  });
  results.push({
    scenarioId: "api-finance-foreign-workspace-body",
    passed: financeForeign.status === 403 && !financeForeign.accepted,
    denialKind: "403",
    detail: `finance mutation workspaceId=B → status ${financeForeign.status}`,
  });

  const marketplaceForeign = mockMarketplaceOrderGet({
    actorWorkspaceId: TENANT_A.workspaceId,
    orderWorkspaceId: TENANT_B.workspaceId,
  });
  results.push({
    scenarioId: "api-marketplace-foreign-order-id",
    passed:
      marketplaceForeign.status === 404 &&
      isAcceptedDenialStatus(marketplaceForeign.status),
    denialKind: "404",
    detail: `GET marketplace/orders/:id (tenant B PO) → status ${marketplaceForeign.status}`,
  });

  const auditWs = resolveAuditExportWorkspaceId({
    requestedWorkspaceId: TENANT_B.workspaceId,
    ownedWorkspaceIds: [TENANT_A.workspaceId],
  });
  results.push({
    scenarioId: "api-finance-audit-export-foreign-workspace-fallback",
    passed: auditWs === TENANT_A.workspaceId,
    denialKind: "structural",
    detail: auditWs
      ? `foreign workspaceId query bound to owned workspace ${auditWs}`
      : "audit export resolved no workspace",
  });

  return results;
}
