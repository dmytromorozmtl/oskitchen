import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

import { recordPlatformAudit } from "@/lib/platform-audit";
import { prisma } from "@/lib/prisma";
import { scopedIdWhere } from "@/lib/scope/tenant-scope";
import { loadOrderDetailPageData } from "@/services/orders/order-detail-service";
import { assertWorkspaceWebhookReplayAllowed } from "@/lib/webhooks/webhook-replay-permissions";

/**
 * Cross-tenant isolation E2E — tenant A must not read tenant B resources.
 * Impersonation audit row must persist for platform.impersonation.start.
 *
 * DB tests: DATABASE_URL
 * Dashboard HTTP: E2E_LOGIN_EMAIL + E2E_LOGIN_PASSWORD (chromium-authed project)
 * Public API optional: E2E_PUBLIC_API_KEY + E2E_CROSS_TENANT_ORDER_ID
 *
 * @see docs/pen-test-plan.md PT-01, PT-07
 * @see tests/integration/tenant-isolation.test.ts
 */

const hasDb = Boolean(process.env.DATABASE_URL?.trim());

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
      email: `cross-tenant-${suffix}@e2e.test`,
      fullName: `Cross Tenant ${label}`,
      role: "OWNER",
    },
  });
  const workspace = await prisma.workspace.create({
    data: { name: `Cross-tenant WS ${suffix}`, ownerUserId: owner.id },
  });
  const order = await prisma.order.create({
    data: {
      userId: owner.id,
      workspaceId: workspace.id,
      customerName: "Isolated Customer",
      customerEmail: `isolated-${suffix}@e2e.test`,
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

async function resolveAuthedUserId(): Promise<string | null> {
  const email = process.env.E2E_LOGIN_EMAIL?.trim().toLowerCase();
  if (!email) return null;
  const profile = await prisma.userProfile.findFirst({
    where: { email },
    select: { id: true },
  });
  return profile?.id ?? null;
}

test.describe("cross-tenant data isolation", () => {
  test("scopedIdWhere prevents tenant A from querying tenant B order", async () => {
    test.skip(!hasDb, "DATABASE_URL required for cross-tenant E2E");

    const tenantA = await seedTenantOrder("a");
    const tenantB = await seedTenantOrder("b");

    try {
      const whereForA = scopedIdWhere(
        { userId: tenantA.ownerId, workspaceId: tenantA.workspaceId },
        tenantB.orderId,
      );
      const leaked = await prisma.order.findFirst({ where: whereForA });
      expect(leaked).toBeNull();
    } finally {
      await tenantA.cleanup();
      await tenantB.cleanup();
    }
  });

  test("loadOrderDetailPageData returns null for foreign tenant order", async () => {
    test.skip(!hasDb, "DATABASE_URL required for cross-tenant E2E");

    const tenantA = await seedTenantOrder("detail-a");
    const tenantB = await seedTenantOrder("detail-b");

    try {
      const data = await loadOrderDetailPageData(tenantA.ownerId, tenantB.orderId);
      expect(data).toBeNull();
    } finally {
      await tenantA.cleanup();
      await tenantB.cleanup();
    }
  });

  test("webhook replay guard denies unrelated tenant actor", async () => {
    test.skip(!hasDb, "DATABASE_URL required for cross-tenant E2E");

    await expect(
      assertWorkspaceWebhookReplayAllowed({
        actorUserId: randomUUID(),
        eventOwnerUserId: randomUUID(),
      }),
    ).rejects.toThrow(/permission/i);
  });

  test("signed-in tenant A gets 404 for tenant B order detail", async ({ page }) => {
    test.skip(!hasDb, "DATABASE_URL required for cross-tenant E2E");
    test.skip(
      !process.env.E2E_LOGIN_EMAIL?.trim() || !process.env.E2E_LOGIN_PASSWORD?.trim(),
      "Set E2E_LOGIN_EMAIL and E2E_LOGIN_PASSWORD (chromium-authed project)",
    );

    const authedUserId = await resolveAuthedUserId();
    test.skip(!authedUserId, "E2E_LOGIN_EMAIL user not found in database");

    const tenantB = await seedTenantOrder("http-b");

    try {
      const leaked = await loadOrderDetailPageData(authedUserId, tenantB.orderId);
      expect(leaked).toBeNull();

      await page.goto(`/dashboard/orders/${tenantB.orderId}`);
      await expect(page.getByRole("heading", { name: /^Page not found$/i })).toBeVisible({
        timeout: 60_000,
      });
      await expect(page.locator("body")).not.toContainText("Isolated Customer");
    } finally {
      await tenantB.cleanup();
    }
  });

  test("public API key tenant does not list foreign order id", async ({ request }) => {
    const apiKey = process.env.E2E_PUBLIC_API_KEY?.trim();
    const foreignOrderId = process.env.E2E_CROSS_TENANT_ORDER_ID?.trim();
    test.skip(!apiKey || !foreignOrderId, "Set E2E_PUBLIC_API_KEY and E2E_CROSS_TENANT_ORDER_ID");

    const res = await request.get("/api/public/v1/orders", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    expect(res.status()).toBe(200);

    const body = (await res.json()) as { data?: Array<{ id: string }> };
    const ids = (body.data ?? []).map((row) => row.id);
    expect(ids).not.toContain(foreignOrderId);
  });
});

test.describe("impersonation audit trail", () => {
  test("platform.impersonation.start writes PLATFORM category audit row", async () => {
    test.skip(!hasDb, "DATABASE_URL required for impersonation audit E2E");

    const suffix = randomUUID().slice(0, 8);
    const admin = await prisma.userProfile.create({
      data: {
        id: randomUUID(),
        email: `imp-admin-${suffix}@e2e.test`,
        fullName: "Impersonation Admin",
        role: "OWNER",
      },
    });
    const target = await prisma.userProfile.create({
      data: {
        id: randomUUID(),
        email: `imp-target-${suffix}@e2e.test`,
        fullName: "Impersonation Target",
        role: "OWNER",
      },
    });
    const workspace = await prisma.workspace.create({
      data: { name: `Imp WS ${suffix}`, ownerUserId: target.id },
    });

    const session = await prisma.impersonationSession.create({
      data: {
        adminUserId: admin.id,
        targetUserId: target.id,
        reason: "E2E cross-tenant impersonation audit probe",
      },
    });

    try {
      await recordPlatformAudit({
        adminUserId: admin.id,
        action: "platform.impersonation.start",
        entityType: "user",
        entityId: target.id,
        targetWorkspaceId: workspace.id,
        metadata: {
          sessionId: session.id,
          reason: "E2E cross-tenant impersonation audit probe",
          targetUserId: target.id,
        },
      });

      const row = await prisma.auditLog.findFirst({
        where: {
          action: "platform.impersonation.start",
          userId: admin.id,
          entityId: target.id,
        },
        orderBy: { createdAt: "desc" },
      });

      expect(row).not.toBeNull();
      expect(row?.category).toBe("PLATFORM");
      expect(row?.source).toBe("SUPERADMIN");
      expect(row?.workspaceId).toBe(workspace.id);

      const metadata = row?.metadataJson as Record<string, unknown> | null;
      expect(metadata?.sessionId).toBe(session.id);
      expect(metadata?.targetUserId).toBe(target.id);
    } finally {
      await prisma.auditLog.deleteMany({ where: { userId: admin.id } });
      await prisma.impersonationSession.delete({ where: { id: session.id } }).catch(() => undefined);
      await prisma.workspace.delete({ where: { id: workspace.id } }).catch(() => undefined);
      await prisma.userProfile.deleteMany({ where: { id: { in: [admin.id, target.id] } } });
    }
  });
});
