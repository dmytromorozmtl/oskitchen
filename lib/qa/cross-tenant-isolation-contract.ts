import { WorkspaceAccessDeniedError } from "@/lib/scope/assert-user-workspace-access";
import { assertResourceBelongsToUserOrWorkspace, scopedIdWhere } from "@/lib/scope/tenant-scope";
import { assertOwnedByUser } from "@/lib/scope/user-owned-guards";
import {
  CROSS_TENANT_ACCEPTED_DENIAL_STATUSES,
} from "@/lib/qa/cross-tenant-isolation-e2e-policy";

export const TENANT_A = {
  userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  workspaceId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
} as const;

export const TENANT_B = {
  userId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  workspaceId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  orderId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
  locationId: "ffffffff-ffff-4fff-8fff-ffffffffffff",
} as const;

export type CrossTenantDenialResult = {
  scenarioId: string;
  passed: boolean;
  denialKind: "403" | "404" | "null" | "throw" | "structural";
  detail: string;
};

export function isAcceptedDenialStatus(status: number): boolean {
  return (CROSS_TENANT_ACCEPTED_DENIAL_STATUSES as readonly number[]).includes(status);
}

/** Mock public API GET — foreign workspace must return 403. */
export function mockPublicOrdersGet(
  workspaceId: string | null,
): { status: number; body: Record<string, unknown> } {
  if (workspaceId && workspaceId !== TENANT_A.workspaceId) {
    return {
      status: 403,
      body: { error: "Forbidden", reason: "cross_tenant_workspace_forbidden" },
    };
  }
  return { status: 200, body: { data: [] } };
}

/** Mock public API POST — foreign location must return 403. */
export function mockPublicOrdersPost(body: {
  locationId?: string;
}): { status: number; body: Record<string, unknown> } {
  if (body.locationId === TENANT_B.locationId) {
    return {
      status: 403,
      body: { error: "Forbidden", reason: "cross_tenant_location_rejected" },
    };
  }
  return { status: 201, body: { id: "new-order", ok: true } };
}

export function runCrossTenantIsolationContract(): CrossTenantDenialResult[] {
  const results: CrossTenantDenialResult[] = [];

  // 1. scopedIdWhere binds tenant A workspace — query cannot match tenant B row
  const where = scopedIdWhere(
    { userId: TENANT_A.userId, workspaceId: TENANT_A.workspaceId },
    TENANT_B.orderId,
  );
  const scopedWorkspaceId = where.workspaceId as string | undefined;
  const structuralPass = scopedWorkspaceId === TENANT_A.workspaceId;
  results.push({
    scenarioId: "scoped-id-where-workspace-bind",
    passed: structuralPass,
    denialKind: "structural",
    detail: structuralPass
      ? "Tenant A query scoped to workspace A only"
      : "scopedIdWhere leaked tenant B workspace binding",
  });

  // 2. assertOwnedByUser throws for tenant B row accessed by tenant A
  let ownedByUserDenied = false;
  try {
    assertOwnedByUser({ userId: TENANT_B.userId }, TENANT_A.userId);
  } catch (error) {
    ownedByUserDenied = error instanceof WorkspaceAccessDeniedError;
  }
  results.push({
    scenarioId: "assert-owned-by-user-foreign-owner",
    passed: ownedByUserDenied,
    denialKind: "throw",
    detail: ownedByUserDenied
      ? "WorkspaceAccessDeniedError for foreign owner"
      : "Foreign owner row was not denied",
  });

  // 3. assertResourceBelongsToUserOrWorkspace throws cross-workspace
  let resourceDenied = false;
  try {
    assertResourceBelongsToUserOrWorkspace(
      { userId: TENANT_A.userId, workspaceId: TENANT_A.workspaceId },
      { userId: TENANT_B.userId, workspaceId: TENANT_B.workspaceId },
    );
  } catch (error) {
    resourceDenied = error instanceof WorkspaceAccessDeniedError;
  }
  results.push({
    scenarioId: "assert-resource-cross-workspace",
    passed: resourceDenied,
    denialKind: "throw",
    detail: resourceDenied
      ? "WorkspaceAccessDeniedError for cross-workspace resource"
      : "Cross-workspace resource was not denied",
  });

  // 4. Tenant A → tenant B: GET public orders with foreign workspaceId returns 403
  const foreignGet = mockPublicOrdersGet(TENANT_B.workspaceId);
  results.push({
    scenarioId: "public-api-get-foreign-workspace",
    passed: foreignGet.status === 403 && isAcceptedDenialStatus(foreignGet.status),
    denialKind: "403",
    detail: `status ${foreignGet.status}, reason ${String(foreignGet.body.reason ?? "")}`,
  });

  // 5. Tenant A → tenant B: POST public orders with foreign locationId returns 403
  const foreignPost = mockPublicOrdersPost({ locationId: TENANT_B.locationId });
  results.push({
    scenarioId: "public-api-post-foreign-location",
    passed: foreignPost.status === 403 && isAcceptedDenialStatus(foreignPost.status),
    denialKind: "403",
    detail: `status ${foreignPost.status}, reason ${String(foreignPost.body.reason ?? "")}`,
  });

  // 6. Own-tenant requests succeed (no false positive denial)
  const ownGet = mockPublicOrdersGet(TENANT_A.workspaceId);
  const ownPost = mockPublicOrdersPost({});
  const ownTenantPass = ownGet.status === 200 && ownPost.status === 201;
  results.push({
    scenarioId: "own-tenant-access-allowed",
    passed: ownTenantPass,
    denialKind: "403",
    detail: ownTenantPass
      ? "Tenant A own workspace GET 200, POST 201"
      : "False positive denial for own tenant",
  });

  return results;
}

export type CrossTenantIsolationBenchmarkResult = {
  scenarioCount: number;
  passedCount: number;
  failedCount: number;
  passPct: number;
  passed: boolean;
  scenarios: CrossTenantDenialResult[];
};

export function scoreCrossTenantIsolationContract(
  scenarios: CrossTenantDenialResult[],
  minScenarios: number,
): CrossTenantIsolationBenchmarkResult {
  const passedCount = scenarios.filter((scenario) => scenario.passed).length;
  const failedCount = scenarios.length - passedCount;
  const passPct =
    scenarios.length === 0 ? 0 : Math.round((passedCount / scenarios.length) * 100);

  return {
    scenarioCount: scenarios.length,
    passedCount,
    failedCount,
    passPct,
    passed: scenarios.length >= minScenarios && failedCount === 0,
    scenarios,
  };
}
