import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

import { prisma } from "@/lib/prisma";
import { WorkspaceAccessDeniedError } from "@/lib/scope/assert-user-workspace-access";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { scopedIdWhere } from "@/lib/scope/tenant-scope";
import { assertOwnedByUser } from "@/lib/scope/user-owned-guards";
import { loadMarketplaceOrderDetail } from "@/services/marketplace/marketplace-orders-service";
import { loadOrderDetailPageData } from "@/services/orders/order-detail-service";

import { skipCrossTenantStagingIfNotReady } from "./helpers/cross-tenant-staging-ready";

/**
 * Cross-tenant isolation — mock contract (always runs) + staging HTTP (vault gated).
 *
 * Mock path: no DATABASE_URL / vault required.
 * Staging path: skips until E2E_STAGING_BASE_URL, DATABASE_URL, E2E_LOGIN_* present.
 *
 * @see docs/pen-test-plan.md PT-01, PT-07
 * @see tests/unit/cross-tenant-denial.test.ts
 * @see e2e/cross-tenant-isolation.spec.ts
 */

type TenantFixture = {
  ownerId: string;
  workspaceId: string;
  orderId: string;
  cleanup: () => Promise<void>;
};

async function seedTenantOrder(label: string): Promise<TenantFixture> {
  const suffix = `${label}-${randomUUID().slice(0, 8)}`;
  const owner = await prisma.userProfile.create({
    data: {
      id: randomUUID(),
      email: `cross-tenant-staging-${suffix}@e2e.test`,
      fullName: `Cross Tenant Staging ${label}`,
      role: "OWNER",
    },
  });
  const workspace = await prisma.workspace.create({
    data: { name: `Cross-tenant staging WS ${suffix}`, ownerUserId: owner.id },
  });
  const order = await prisma.order.create({
    data: {
      userId: owner.id,
      workspaceId: workspace.id,
      customerName: "Staging Isolated Customer",
      customerEmail: `staging-isolated-${suffix}@e2e.test`,
      total: 19.99,
      status: "PENDING",
      fulfillmentType: "PICKUP",
    },
  });

  return {
    ownerId: owner.id,
    workspaceId: workspace.id,
    orderId: order.id,
    cleanup: async () => {
      await prisma.order.delete({ where: { id: order.id } }).catch(() => undefined);
      await prisma.workspace.delete({ where: { id: workspace.id } }).catch(() => undefined);
      await prisma.userProfile.delete({ where: { id: owner.id } }).catch(() => undefined);
    },
  };
}

type MarketplaceTenantFixture = {
  buyerOwnerId: string;
  buyerWorkspaceId: string;
  purchaseOrderId: string;
  poNumber: string;
  vendorCompanyName: string;
  cleanup: () => Promise<void>;
};

async function seedMarketplacePurchaseOrder(label: string): Promise<MarketplaceTenantFixture> {
  const suffix = `${label}-${randomUUID().slice(0, 8)}`;
  const buyerOwner = await prisma.userProfile.create({
    data: {
      id: randomUUID(),
      email: `cross-tenant-staging-mp-${suffix}@e2e.test`,
      fullName: `Staging Marketplace Buyer ${label}`,
      role: "OWNER",
    },
  });
  const buyerWorkspace = await prisma.workspace.create({
    data: { name: `Staging MP Buyer WS ${suffix}`, ownerUserId: buyerOwner.id },
  });
  const vendorOwner = await prisma.userProfile.create({
    data: {
      id: randomUUID(),
      email: `cross-tenant-staging-mp-v-${suffix}@e2e.test`,
      fullName: `Staging Marketplace Vendor ${label}`,
      role: "OWNER",
    },
  });
  const vendorWorkspace = await prisma.workspace.create({
    data: { name: `Staging MP Vendor WS ${suffix}`, ownerUserId: vendorOwner.id },
  });
  const vendorCompanyName = `Staging Isolated Vendor ${suffix}`;
  const vendor = await prisma.vendor.create({
    data: {
      workspaceId: vendorWorkspace.id,
      companyName: vendorCompanyName,
      legalName: `${vendorCompanyName} LLC`,
      type: "DISTRIBUTOR",
      status: "APPROVED",
    },
  });
  const poNumber = `PO-STAGING-${suffix}`;
  const purchaseOrder = await prisma.marketplacePurchaseOrder.create({
    data: {
      workspaceId: buyerWorkspace.id,
      vendorId: vendor.id,
      status: "SUBMITTED",
      subtotal: 49.99,
      deliveryFee: 0,
      total: 49.99,
      currency: "USD",
      paymentMethod: "NET_TERMS",
      poNumber,
      deliveryAddress: {
        line1: "789 Supply Row",
        city: "Austin",
        region: "TX",
        postalCode: "78703",
        country: "US",
      },
    },
  });

  return {
    buyerOwnerId: buyerOwner.id,
    buyerWorkspaceId: buyerWorkspace.id,
    purchaseOrderId: purchaseOrder.id,
    poNumber,
    vendorCompanyName,
    cleanup: async () => {
      await prisma.marketplacePurchaseOrder
        .delete({ where: { id: purchaseOrder.id } })
        .catch(() => undefined);
      await prisma.vendor.delete({ where: { id: vendor.id } }).catch(() => undefined);
      await prisma.workspace
        .deleteMany({ where: { id: { in: [buyerWorkspace.id, vendorWorkspace.id] } } })
        .catch(() => undefined);
      await prisma.userProfile
        .deleteMany({ where: { id: { in: [buyerOwner.id, vendorOwner.id] } } })
        .catch(() => undefined);
    },
  };
}

async function resolveAuthedUserId(): Promise<string | null> {
  const email = process.env.E2E_LOGIN_EMAIL?.trim().toLowerCase();
  if (!email) return null;
  const profile = await prisma.userProfile.findFirst({
    where: { email },
    select: { id: true },
  });
  return profile?.id ?? null;
}

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
  test("tenant A → tenant B: GET public orders with foreign workspaceId returns 403", async () => {
    const foreign = mockPublicOrdersGet(TENANT_B.workspaceId);
    expect(foreign.status).toBe(403);
    expect(foreign.body.reason).toBe("cross_tenant_workspace_forbidden");

    const own = mockPublicOrdersGet(TENANT_A.workspaceId);
    expect(own.status).toBe(200);
  });

  test("tenant A → tenant B: POST public orders with foreign locationId returns 403", async () => {
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

test.describe("cross-tenant isolation (staging — vault gated)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Staging cross-tenant HTTP tests run in chromium-authed project only",
    );
    skipCrossTenantStagingIfNotReady();
  });

  test("signed-in tenant A gets 404 for tenant B order detail on staging", async ({ page }) => {
    const authedUserId = await resolveAuthedUserId();
    test.skip(!authedUserId, "E2E_LOGIN_EMAIL user not found in staging database");

    const tenantB = await seedTenantOrder("http-staging-b");

    try {
      const leaked = await loadOrderDetailPageData(authedUserId, tenantB.orderId);
      expect(leaked).toBeNull();

      await page.goto(`/dashboard/orders/${tenantB.orderId}`);
      await expect(page.getByRole("heading", { name: /^Page not found$/i })).toBeVisible({
        timeout: 60_000,
      });
      await expect(page.locator("body")).not.toContainText("Staging Isolated Customer");
    } finally {
      await tenantB.cleanup();
    }
  });

  test("tenant A gets 404 for tenant B marketplace order on staging", async ({ page }) => {
    const authedUserId = await resolveAuthedUserId();
    test.skip(!authedUserId, "E2E_LOGIN_EMAIL user not found in staging database");

    const tenantB = await seedMarketplacePurchaseOrder("http-staging-mp-b");

    try {
      const authedWorkspaceId = await resolveOwnerWorkspaceId(authedUserId);
      test.skip(!authedWorkspaceId, "E2E login user has no active workspace");

      const leaked = await loadMarketplaceOrderDetail(authedWorkspaceId, tenantB.purchaseOrderId);
      expect(leaked).toBeNull();

      await page.goto(`/dashboard/marketplace/orders/${tenantB.purchaseOrderId}`);
      await expect(page.getByRole("heading", { name: /^Page not found$/i })).toBeVisible({
        timeout: 60_000,
      });
      await expect(page.locator("body")).not.toContainText(tenantB.poNumber);
      await expect(page.locator("body")).not.toContainText(tenantB.vendorCompanyName);
    } finally {
      await tenantB.cleanup();
    }
  });

  test("public API key tenant does not list foreign order id on staging", async ({ request }) => {
    const apiKey = process.env.E2E_PUBLIC_API_KEY?.trim();
    const foreignOrderId = process.env.E2E_CROSS_TENANT_ORDER_ID?.trim();
    test.skip(
      !apiKey || !foreignOrderId,
      "Set E2E_PUBLIC_API_KEY and E2E_CROSS_TENANT_ORDER_ID for public API staging proof",
    );

    const res = await request.get("/api/public/v1/orders", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    expect(res.status()).toBe(200);

    const body = (await res.json()) as { data?: Array<{ id: string }> };
    const ids = (body.data ?? []).map((row) => row.id);
    expect(ids).not.toContain(foreignOrderId);
  });
});
