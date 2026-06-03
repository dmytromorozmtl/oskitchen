import { randomUUID } from "node:crypto";

import { test } from "@playwright/test";

import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

export const hasVendorCabinetCrossTenantDb = Boolean(process.env.DATABASE_URL?.trim());

export type VendorCabinetCrossTenantFixture = {
  buyerWorkspaceId: string;
  vendorId: string;
  purchaseOrderId: string;
  poNumber: string;
  vendorCompanyName: string;
  cleanup: () => Promise<void>;
};

export async function seedForeignMarketplacePurchaseOrder(
  label: string,
): Promise<VendorCabinetCrossTenantFixture> {
  const suffix = `${label}-${randomUUID().slice(0, 8)}`;
  const buyerOwner = await prisma.userProfile.create({
    data: {
      id: randomUUID(),
      email: `vendor-cabinet-xtenant-buyer-${suffix}@e2e.test`,
      fullName: `Vendor Cabinet Buyer ${label}`,
      role: "OWNER",
    },
  });
  const buyerWorkspace = await prisma.workspace.create({
    data: { name: `Vendor Cabinet Buyer WS ${suffix}`, ownerUserId: buyerOwner.id },
  });
  const vendorOwner = await prisma.userProfile.create({
    data: {
      id: randomUUID(),
      email: `vendor-cabinet-xtenant-vendor-${suffix}@e2e.test`,
      fullName: `Vendor Cabinet Vendor ${label}`,
      role: "OWNER",
    },
  });
  const vendorWorkspace = await prisma.workspace.create({
    data: { name: `Vendor Cabinet Vendor WS ${suffix}`, ownerUserId: vendorOwner.id },
  });
  const vendorCompanyName = `Foreign Vendor ${suffix}`;
  const vendor = await prisma.vendor.create({
    data: {
      workspaceId: vendorWorkspace.id,
      companyName: vendorCompanyName,
      legalName: `${vendorCompanyName} LLC`,
      type: "DISTRIBUTOR",
      status: "APPROVED",
    },
  });
  const poNumber = `PO-VENDOR-XT-${suffix}`;
  const purchaseOrder = await prisma.marketplacePurchaseOrder.create({
    data: {
      workspaceId: buyerWorkspace.id,
      vendorId: vendor.id,
      status: "SUBMITTED",
      subtotal: 59.99,
      deliveryFee: 0,
      total: 59.99,
      currency: "USD",
      paymentMethod: "NET_TERMS",
      poNumber,
      deliveryAddress: {
        line1: "100 Supply Lane",
        city: "Austin",
        region: "TX",
        postalCode: "78701",
        country: "US",
      },
    },
  });

  return {
    buyerWorkspaceId: buyerWorkspace.id,
    vendorId: vendor.id,
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

export async function resolveAuthedUserId(): Promise<string | null> {
  const email = process.env.E2E_LOGIN_EMAIL?.trim().toLowerCase();
  if (!email) return null;
  const profile = await prisma.userProfile.findFirst({
    where: { email },
    select: { id: true },
  });
  return profile?.id ?? null;
}

export async function resolveAuthedApprovedVendorId(): Promise<string | null> {
  const userId = await resolveAuthedUserId();
  if (!userId) return null;
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) return null;
  const vendor = await prisma.vendor.findFirst({
    where: { workspaceId, status: "APPROVED" },
    select: { id: true },
  });
  return vendor?.id ?? null;
}

export function skipVendorCabinetCrossTenantIfNoDb(): void {
  if (!hasVendorCabinetCrossTenantDb) {
    test.skip(true, "Vendor cabinet cross-tenant E2E requires DATABASE_URL");
  }
}

export function skipVendorCabinetCrossTenantIfNotAuthed(): void {
  if (!process.env.E2E_LOGIN_EMAIL?.trim() || !process.env.E2E_LOGIN_PASSWORD?.trim()) {
    test.skip(
      true,
      "Vendor cabinet cross-tenant E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}
