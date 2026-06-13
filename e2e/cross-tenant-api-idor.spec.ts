import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

import { skipCrossTenantStagingIfNotReady } from "./helpers/cross-tenant-staging-ready";

/**
 * P0-6 — Cross-tenant data leak E2E (IDOR): authed tenant A must not read tenant B via API.
 *
 * @see lib/qa/cross-tenant-api-idor-contract.ts
 * @see tests/unit/cross-tenant-api-idor.test.ts
 */

const hasDb = Boolean(process.env.DATABASE_URL?.trim());

async function seedMarketplacePurchaseOrder(label: string) {
  const suffix = `${label}-${randomUUID().slice(0, 8)}`;
  const buyerOwner = await prisma.userProfile.create({
    data: {
      id: randomUUID(),
      email: `idor-mp-${suffix}@e2e.test`,
      fullName: `IDOR Buyer ${label}`,
      role: "OWNER",
    },
  });
  const buyerWorkspace = await prisma.workspace.create({
    data: { name: `IDOR Buyer WS ${suffix}`, ownerUserId: buyerOwner.id },
  });
  const vendorOwner = await prisma.userProfile.create({
    data: {
      id: randomUUID(),
      email: `idor-v-${suffix}@e2e.test`,
      fullName: `IDOR Vendor ${label}`,
      role: "OWNER",
    },
  });
  const vendorWorkspace = await prisma.workspace.create({
    data: { name: `IDOR Vendor WS ${suffix}`, ownerUserId: vendorOwner.id },
  });
  const vendor = await prisma.vendor.create({
    data: {
      workspaceId: vendorWorkspace.id,
      companyName: `IDOR Vendor Co ${suffix}`,
      legalName: `IDOR Vendor Co ${suffix} LLC`,
      type: "DISTRIBUTOR",
      status: "APPROVED",
    },
  });
  const poNumber = `PO-IDOR-${suffix}`;
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
        line1: "1 Leak Test Lane",
        city: "Montreal",
        region: "QC",
        postalCode: "H2X1Y4",
        country: "CA",
      },
    },
  });

  return {
    buyerWorkspaceId: buyerWorkspace.id,
    purchaseOrderId: purchaseOrder.id,
    poNumber,
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

test.describe("cross-tenant API IDOR (P0-6 — authed HTTP)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(!hasDb, "DATABASE_URL required");
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "API IDOR HTTP tests run in chromium-authed project only",
    );
    skipCrossTenantStagingIfNotReady();
  });

  test("tenant A GET marketplace order invoice for tenant B PO returns 404", async ({
    request,
  }) => {
    const tenantB = await seedMarketplacePurchaseOrder("idor-mp");

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

  test("tenant A audit export with foreign workspaceId does not leak tenant B workspace", async ({
    request,
  }) => {
    const tenantB = await seedMarketplacePurchaseOrder("idor-audit");
    const authedWorkspaceId = await resolveAuthedWorkspaceId();
    test.skip(!authedWorkspaceId, "E2E login user has no workspace");

    try {
      const res = await request.get(
        `/api/dashboard/audit-logs/export?format=json&workspaceId=${encodeURIComponent(tenantB.buyerWorkspaceId)}`,
      );
      expect([200, 403, 404]).toContain(res.status());
      if (res.status() === 200) {
        const body = await res.text();
        expect(body).not.toContain(tenantB.poNumber);
        expect(body).not.toContain(tenantB.buyerWorkspaceId);
      }
      expect(tenantB.buyerWorkspaceId).not.toBe(authedWorkspaceId);
    } finally {
      await tenantB.cleanup();
    }
  });

  test("public API key tenant does not list foreign order when workspaceId query injected", async ({
    request,
  }) => {
    const apiKey = process.env.E2E_PUBLIC_API_KEY?.trim();
    const foreignOrderId = process.env.E2E_CROSS_TENANT_ORDER_ID?.trim();
    const foreignWorkspaceId = process.env.E2E_CROSS_TENANT_WORKSPACE_ID?.trim();
    test.skip(
      !apiKey || !foreignOrderId,
      "Set E2E_PUBLIC_API_KEY and E2E_CROSS_TENANT_ORDER_ID",
    );

    const qs = foreignWorkspaceId
      ? `?workspaceId=${encodeURIComponent(foreignWorkspaceId)}`
      : "";
    const res = await request.get(`/api/public/v1/orders${qs}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { data?: Array<{ id: string }> };
    const ids = (body.data ?? []).map((row) => row.id);
    expect(ids).not.toContain(foreignOrderId);
  });

  test("public API customers with foreign workspaceId query returns empty or 403", async ({
    request,
  }) => {
    const apiKey = process.env.E2E_PUBLIC_API_KEY?.trim();
    const foreignWorkspaceId = process.env.E2E_CROSS_TENANT_WORKSPACE_ID?.trim();
    test.skip(!apiKey || !foreignWorkspaceId, "Set E2E_PUBLIC_API_KEY and E2E_CROSS_TENANT_WORKSPACE_ID");

    const res = await request.get(
      `/api/public/v1/customers?workspaceId=${encodeURIComponent(foreignWorkspaceId)}`,
      { headers: { Authorization: `Bearer ${apiKey}` } },
    );
    expect([200, 403]).toContain(res.status());
    if (res.status() === 200) {
      const body = (await res.json()) as { data?: unknown[] };
      expect(body.data ?? []).toEqual([]);
    }
  });
});
