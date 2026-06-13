import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

import { skipCrossTenantStagingIfNotReady } from "./helpers/cross-tenant-staging-ready";

/**
 * P1-14 — Cross-tenant E2E IDOR: 2 workspaces, all key API routes (403/404).
 *
 * @see lib/qa/cross-tenant-e2e-policy.ts
 * @see lib/qa/cross-tenant-e2e-contract.ts
 */

const hasDb = Boolean(process.env.DATABASE_URL?.trim());

type TenantBFixture = {
  workspaceId: string;
  orderId: string;
  purchaseOrderId: string;
  poNumber: string;
  cleanup: () => Promise<void>;
};

async function seedTenantBResources(label: string): Promise<TenantBFixture> {
  const suffix = `${label}-${randomUUID().slice(0, 8)}`;
  const owner = await prisma.userProfile.create({
    data: {
      id: randomUUID(),
      email: `p1-14-b-${suffix}@e2e.test`,
      fullName: `P1-14 Tenant B ${label}`,
      role: "OWNER",
    },
  });
  const workspace = await prisma.workspace.create({
    data: { name: `P1-14 Tenant B WS ${suffix}`, ownerUserId: owner.id },
  });
  const order = await prisma.order.create({
    data: {
      userId: owner.id,
      workspaceId: workspace.id,
      customerName: "Tenant B Customer",
      customerEmail: `tb-${suffix}@e2e.test`,
      total: 29.99,
      status: "PENDING",
      fulfillmentType: "PICKUP",
    },
  });
  const vendorOwner = await prisma.userProfile.create({
    data: {
      id: randomUUID(),
      email: `p1-14-v-${suffix}@e2e.test`,
      fullName: `P1-14 Vendor ${label}`,
      role: "OWNER",
    },
  });
  const vendorWorkspace = await prisma.workspace.create({
    data: { name: `P1-14 Vendor WS ${suffix}`, ownerUserId: vendorOwner.id },
  });
  const vendor = await prisma.vendor.create({
    data: {
      workspaceId: vendorWorkspace.id,
      companyName: `Vendor ${suffix}`,
      legalName: `Vendor ${suffix} LLC`,
      type: "DISTRIBUTOR",
      status: "APPROVED",
    },
  });
  const poNumber = `PO-P114-${suffix}`;
  const purchaseOrder = await prisma.marketplacePurchaseOrder.create({
    data: {
      workspaceId: workspace.id,
      vendorId: vendor.id,
      status: "SUBMITTED",
      subtotal: 49.99,
      deliveryFee: 0,
      total: 49.99,
      currency: "USD",
      paymentMethod: "NET_TERMS",
      poNumber,
      deliveryAddress: {
        line1: "99 IDOR Lane",
        city: "Montreal",
        region: "QC",
        postalCode: "H2X1Y4",
        country: "CA",
      },
    },
  });

  return {
    workspaceId: workspace.id,
    orderId: order.id,
    purchaseOrderId: purchaseOrder.id,
    poNumber,
    cleanup: async () => {
      await prisma.marketplacePurchaseOrder
        .delete({ where: { id: purchaseOrder.id } })
        .catch(() => undefined);
      await prisma.order.delete({ where: { id: order.id } }).catch(() => undefined);
      await prisma.vendor.delete({ where: { id: vendor.id } }).catch(() => undefined);
      await prisma.workspace
        .deleteMany({ where: { id: { in: [workspace.id, vendorWorkspace.id] } } })
        .catch(() => undefined);
      await prisma.userProfile
        .deleteMany({ where: { id: { in: [owner.id, vendorOwner.id] } } })
        .catch(() => undefined);
    },
  };
}

async function resolveAuthedWorkspaceId(): Promise<string | null> {
  const email = process.env.E2E_LOGIN_EMAIL?.trim().toLowerCase();
  if (!email) return null;
  const profile = await prisma.userProfile.findFirst({
    where: { email },
    select: { id: true },
  });
  if (!profile) return null;
  return resolveOwnerWorkspaceId(profile.id);
}

const PUBLIC_API_ROUTES = [
  "orders",
  "customers",
  "inventory",
  "staff",
  "products",
  "locations",
] as const;

test.describe("cross-tenant E2E IDOR (P1-14 — 2 workspaces, key API routes)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(!hasDb, "DATABASE_URL required");
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Cross-tenant E2E HTTP tests run in chromium-authed project only",
    );
    skipCrossTenantStagingIfNotReady();
  });

  test("tenant A dashboard order page for tenant B order returns not found", async ({
    page,
  }) => {
    const tenantB = await seedTenantBResources("dash-order");

    try {
      await page.goto(`/dashboard/orders/${tenantB.orderId}`);
      await expect(page.getByRole("heading", { name: /^Page not found$/i })).toBeVisible({
        timeout: 60_000,
      });
      await expect(page.locator("body")).not.toContainText("Tenant B Customer");
    } finally {
      await tenantB.cleanup();
    }
  });

  test("tenant A GET marketplace invoice for tenant B PO returns 403 or 404", async ({
    request,
  }) => {
    const tenantB = await seedTenantBResources("mp-invoice");

    try {
      const res = await request.get(
        `/api/marketplace/orders/${tenantB.purchaseOrderId}/invoice`,
      );
      expect([403, 404]).toContain(res.status());
      const text = await res.text();
      expect(text).not.toContain(tenantB.poNumber);
    } finally {
      await tenantB.cleanup();
    }
  });

  test("tenant A audit export with tenant B workspaceId does not leak tenant B data", async ({
    request,
  }) => {
    const tenantB = await seedTenantBResources("audit");
    const authedWorkspaceId = await resolveAuthedWorkspaceId();
    test.skip(!authedWorkspaceId, "E2E login user has no workspace");

    try {
      const res = await request.get(
        `/api/dashboard/audit-logs/export?format=json&workspaceId=${encodeURIComponent(tenantB.workspaceId)}`,
      );
      expect([200, 403, 404]).toContain(res.status());
      if (res.status() === 200) {
        const body = await res.text();
        expect(body).not.toContain(tenantB.poNumber);
        expect(body).not.toContain(tenantB.workspaceId);
      }
      expect(tenantB.workspaceId).not.toBe(authedWorkspaceId);
    } finally {
      await tenantB.cleanup();
    }
  });

  for (const route of PUBLIC_API_ROUTES) {
    test(`public API ${route} with foreign workspaceId returns empty or 403`, async ({
      request,
    }) => {
      const apiKey = process.env.E2E_PUBLIC_API_KEY?.trim();
      const tenantB = await seedTenantBResources(`pub-${route}`);
      test.skip(!apiKey, "Set E2E_PUBLIC_API_KEY");

      try {
        const res = await request.get(
          `/api/public/v1/${route}?workspaceId=${encodeURIComponent(tenantB.workspaceId)}`,
          { headers: { Authorization: `Bearer ${apiKey}` } },
        );
        expect([200, 403]).toContain(res.status());
        if (res.status() === 200) {
          const body = (await res.json()) as { data?: unknown[] };
          expect(body.data ?? []).toEqual([]);
        }
      } finally {
        await tenantB.cleanup();
      }
    });
  }
});
