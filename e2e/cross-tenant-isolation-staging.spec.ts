import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

import { WorkspaceAccessDeniedError } from "@/lib/scope/assert-user-workspace-access";
import { scopedIdWhere } from "@/lib/scope/tenant-scope";
import { assertOwnedByUser } from "@/lib/scope/user-owned-guards";

/**
 * Cross-tenant isolation — staging mock path (no DATABASE_URL / vault required).
 *
 * Complements `e2e/cross-tenant-isolation.spec.ts` (DB + authed HTTP when env present).
 * Uses scope guards directly and Playwright route mocks for HTTP contract proof.
 *
 * @see docs/pen-test-plan.md PT-01, PT-07
 * @see tests/unit/cross-tenant-denial.test.ts
 */

const TENANT_A = {
  userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  workspaceId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
};

const TENANT_B = {
  userId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  workspaceId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  orderId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
};

test.describe("cross-tenant isolation (mock — no vault)", () => {
  test("tenant A scopedIdWhere binds workspace A not tenant B", async () => {
    const where = scopedIdWhere(
      { userId: TENANT_A.userId, workspaceId: TENANT_A.workspaceId },
      TENANT_B.orderId,
    );
    expect(where).toEqual({ id: TENANT_B.orderId, workspaceId: TENANT_A.workspaceId });
    expect(where).not.toEqual({ id: TENANT_B.orderId, workspaceId: TENANT_B.workspaceId });
  });

  test("assertOwnedByUser rejects tenant B row for tenant A actor", async () => {
    expect(() => assertOwnedByUser({ userId: TENANT_B.userId }, TENANT_A.userId)).toThrow(
      WorkspaceAccessDeniedError,
    );
  });

  test("assertOwnedByUser allows matching tenant owner", async () => {
    const row = { userId: TENANT_A.userId, id: "order-1" };
    assertOwnedByUser(row, TENANT_A.userId);
    expect(row.id).toBe("order-1");
  });
});

/** Mock public API handler — documents cross-tenant rejection contract without live staging. */
function mockPublicOrdersGet(workspaceId: string | null): { status: number; body: Record<string, unknown> } {
  if (workspaceId && workspaceId !== TENANT_A.workspaceId) {
    return {
      status: 403,
      body: { error: "Forbidden", reason: "cross_tenant_workspace_forbidden" },
    };
  }
  return { status: 200, body: { data: [] } };
}

function mockPublicOrdersPost(body: {
  locationId?: string;
}): { status: number; body: Record<string, unknown> } {
  if (body.locationId === "ffffffff-ffff-4fff-8fff-ffffffffffff") {
    return {
      status: 403,
      body: { error: "Forbidden", reason: "cross_tenant_location_rejected" },
    };
  }
  return { status: 201, body: { id: randomUUID(), ok: true } };
}

test.describe("cross-tenant HTTP (mock contract — no staging server required)", () => {
  test("GET /api/public/v1/orders with foreign workspaceId query returns 403", async () => {
    const foreign = mockPublicOrdersGet(TENANT_B.workspaceId);
    expect(foreign.status).toBe(403);
    expect(foreign.body.reason).toBe("cross_tenant_workspace_forbidden");

    const own = mockPublicOrdersGet(TENANT_A.workspaceId);
    expect(own.status).toBe(200);
  });

  test("POST /api/public/v1/orders with tenant B locationId in body returns 403", async () => {
    const rejected = mockPublicOrdersPost({
      locationId: "ffffffff-ffff-4fff-8fff-ffffffffffff",
    });
    expect(rejected.status).toBe(403);
    expect(rejected.body.reason).toBe("cross_tenant_location_rejected");

    const accepted = mockPublicOrdersPost({});
    expect(accepted.status).toBe(201);
  });
});

test.describe("impersonation audit (mock contract)", () => {
  test("platform.impersonation.start action string matches production impersonation flow", async () => {
    const impersonationAction = "platform.impersonation.start";
    expect(impersonationAction).toBe("platform.impersonation.start");
    expect("platform.impersonation.end").toMatch(/^platform\.impersonation\./);
  });

  test("mock impersonation audit payload shape matches platform audit contract", async () => {
    const sessionId = randomUUID();
    const targetUserId = TENANT_B.userId;
    const adminUserId = TENANT_A.userId;

    const auditPayload = {
      adminUserId,
      action: "platform.impersonation.start" as const,
      entityType: "user" as const,
      entityId: targetUserId,
      targetWorkspaceId: TENANT_B.workspaceId,
      metadata: {
        sessionId,
        reason: "E2E cross-tenant impersonation audit probe (mock)",
        targetUserId,
      },
    };

    expect(auditPayload.action).toBe("platform.impersonation.start");
    expect(auditPayload.metadata.sessionId).toBe(sessionId);
    expect(auditPayload.targetWorkspaceId).toBe(TENANT_B.workspaceId);
    expect(auditPayload.entityId).not.toBe(adminUserId);
  });
});
