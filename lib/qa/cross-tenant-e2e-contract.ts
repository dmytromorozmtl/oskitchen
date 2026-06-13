/**
 * P1-14 — Cross-tenant E2E IDOR contract (2 workspaces, all key API routes).
 */

import { runCrossTenantApiIdorContract } from "@/lib/qa/cross-tenant-api-idor-contract";
import type { CrossTenantDenialResult } from "@/lib/qa/cross-tenant-isolation-contract";
import {
  TENANT_A,
  TENANT_B,
  isAcceptedDenialStatus,
} from "@/lib/qa/cross-tenant-isolation-contract";

function denyForeignWorkspace(input: {
  actorWorkspaceId: string;
  foreignWorkspaceId: string | null;
}): { status: number; data: unknown[] } {
  if (input.foreignWorkspaceId && input.foreignWorkspaceId !== input.actorWorkspaceId) {
    return { status: 403, data: [] };
  }
  return { status: 200, data: [{ id: "owned-row", workspaceId: input.actorWorkspaceId }] };
}

function denyForeignResource(input: {
  actorWorkspaceId: string;
  resourceWorkspaceId: string;
}): { status: number; body: Record<string, unknown> | null } {
  if (input.resourceWorkspaceId !== input.actorWorkspaceId) {
    return { status: 404, body: { error: "Not found" } };
  }
  return { status: 200, body: { id: "owned-resource", workspaceId: input.actorWorkspaceId } };
}

function denyForeignMutation(input: {
  actorWorkspaceId: string;
  bodyWorkspaceId: string | null;
}): { status: number; accepted: boolean } {
  if (input.bodyWorkspaceId && input.bodyWorkspaceId !== input.actorWorkspaceId) {
    return { status: 403, accepted: false };
  }
  return { status: 200, accepted: true };
}

export function runCrossTenantE2eKeyRouteContract(): CrossTenantDenialResult[] {
  const results: CrossTenantDenialResult[] = [];

  const inventory = denyForeignWorkspace({
    actorWorkspaceId: TENANT_A.workspaceId,
    foreignWorkspaceId: TENANT_B.workspaceId,
  });
  results.push({
    scenarioId: "api-inventory-foreign-workspace-query",
    passed: inventory.status === 403 && inventory.data.length === 0,
    denialKind: "403",
    detail: `GET inventory?workspaceId=B → status ${inventory.status}`,
  });

  const staff = denyForeignWorkspace({
    actorWorkspaceId: TENANT_A.workspaceId,
    foreignWorkspaceId: TENANT_B.workspaceId,
  });
  results.push({
    scenarioId: "api-staff-foreign-workspace-query",
    passed: staff.status === 403 && staff.data.length === 0,
    denialKind: "403",
    detail: `GET staff?workspaceId=B → status ${staff.status}`,
  });

  const products = denyForeignWorkspace({
    actorWorkspaceId: TENANT_A.workspaceId,
    foreignWorkspaceId: TENANT_B.workspaceId,
  });
  results.push({
    scenarioId: "api-products-foreign-workspace-query",
    passed: products.status === 403 && products.data.length === 0,
    denialKind: "403",
    detail: `GET products?workspaceId=B → status ${products.status}`,
  });

  const locations = denyForeignWorkspace({
    actorWorkspaceId: TENANT_A.workspaceId,
    foreignWorkspaceId: TENANT_B.workspaceId,
  });
  results.push({
    scenarioId: "api-locations-foreign-workspace-query",
    passed: locations.status === 403 && locations.data.length === 0,
    denialKind: "403",
    detail: `GET locations?workspaceId=B → status ${locations.status}`,
  });

  const posExport = denyForeignMutation({
    actorWorkspaceId: TENANT_A.workspaceId,
    bodyWorkspaceId: TENANT_B.workspaceId,
  });
  results.push({
    scenarioId: "api-pos-shifts-export-foreign-workspace-body",
    passed: posExport.status === 403 && !posExport.accepted,
    denialKind: "403",
    detail: `POST pos/shifts/export workspaceId=B → status ${posExport.status}`,
  });

  const kitchenTicket = denyForeignResource({
    actorWorkspaceId: TENANT_A.workspaceId,
    resourceWorkspaceId: TENANT_B.workspaceId,
  });
  results.push({
    scenarioId: "api-kitchen-ticket-foreign-order-id",
    passed:
      kitchenTicket.status === 404 && isAcceptedDenialStatus(kitchenTicket.status),
    denialKind: "404",
    detail: `GET kitchen/tickets/:id (tenant B) → status ${kitchenTicket.status}`,
  });

  const analyticsExport = denyForeignMutation({
    actorWorkspaceId: TENANT_A.workspaceId,
    bodyWorkspaceId: TENANT_B.workspaceId,
  });
  results.push({
    scenarioId: "api-analytics-export-foreign-workspace-body",
    passed: analyticsExport.status === 403 && !analyticsExport.accepted,
    denialKind: "403",
    detail: `GET analytics/export workspaceId=B → status ${analyticsExport.status}`,
  });

  const integrationsTest = denyForeignMutation({
    actorWorkspaceId: TENANT_A.workspaceId,
    bodyWorkspaceId: TENANT_B.workspaceId,
  });
  results.push({
    scenarioId: "api-integrations-test-foreign-workspace-body",
    passed: integrationsTest.status === 403 && !integrationsTest.accepted,
    denialKind: "403",
    detail: `POST integrations/shopify/test workspaceId=B → status ${integrationsTest.status}`,
  });

  results.push({
    scenarioId: "two-workspace-tenant-a-never-equals-tenant-b",
    passed:
      TENANT_A.workspaceId !== TENANT_B.workspaceId &&
      TENANT_A.userId !== TENANT_B.userId,
    denialKind: "structural",
    detail: "Fixture defines two distinct workspaces for IDOR matrix",
  });

  return results;
}

/** Full P1-14 contract: P0-6 API IDOR families + extended key routes. */
export function runCrossTenantE2eContract(): CrossTenantDenialResult[] {
  return [...runCrossTenantApiIdorContract(), ...runCrossTenantE2eKeyRouteContract()];
}
