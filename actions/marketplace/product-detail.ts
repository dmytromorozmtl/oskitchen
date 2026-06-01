"use server";

import { revalidatePath } from "next/cache";

import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { hasPermission } from "@/lib/permissions/guards";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/services/audit/audit-service";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";

type CartItem = {
  productId: string;
  variantId?: string;
  slug: string;
  name: string;
  sku: string;
  vendorId: string;
  vendorName: string;
  quantity: number;
  unitPrice: number;
  currency: string;
};

function parseCartItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is CartItem => {
    return (
      !!item &&
      typeof item === "object" &&
      typeof (item as CartItem).productId === "string" &&
      typeof (item as CartItem).quantity === "number"
    );
  });
}

export async function addMarketplaceProductToCartAction(input: {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  vendorId: string;
  vendorName: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  variantId?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const actor = await requireWorkspacePermissionActor();
  if (!actor.workspaceId) {
    return { ok: false, error: "Workspace required" };
  }
  if (!hasPermission(actor.granted, "marketplace:cart:write")) {
    return { ok: false, error: "You do not have permission to update the marketplace cart." };
  }

  const quantity = Math.max(1, Math.floor(input.quantity));
  const cart = await prisma.marketplaceCart.upsert({
    where: { workspaceId: actor.workspaceId },
    create: {
      workspaceId: actor.workspaceId,
      items: [],
    },
    update: {},
  });

  const items = parseCartItems(cart.items);
  const existingIndex = items.findIndex(
    (item) =>
      item.productId === input.productId &&
      (item.variantId ?? null) === (input.variantId ?? null),
  );

  if (existingIndex >= 0) {
    items[existingIndex] = {
      ...items[existingIndex]!,
      quantity: items[existingIndex]!.quantity + quantity,
      unitPrice: input.unitPrice,
    };
  } else {
    items.push({
      productId: input.productId,
      variantId: input.variantId,
      slug: input.slug,
      name: input.name,
      sku: input.sku,
      vendorId: input.vendorId,
      vendorName: input.vendorName,
      quantity,
      unitPrice: input.unitPrice,
      currency: input.currency,
    });
  }

  await prisma.marketplaceCart.update({
    where: { id: cart.id },
    data: { items, savedAt: new Date() },
  });

  await auditLog({
    workspaceId: actor.workspaceId,
    actor: {
      userId: actor.sessionUserId,
      email: actor.email,
      role: actor.staffRoleType ?? actor.workspaceRole,
    },
    action: AUDIT_ACTIONS.SETTINGS_UPDATED,
    category: "OTHER",
    source: "USER",
    severity: "INFO",
    entity: { type: "MarketplaceCart", id: cart.id, label: input.name },
    metadata: {
      operation: "marketplace.cart.add",
      productId: input.productId,
      quantity,
      variantId: input.variantId ?? null,
    },
  });

  revalidatePath("/dashboard/marketplace");
  revalidatePath("/dashboard/marketplace/catalog");
  revalidatePath(`/dashboard/marketplace/products/${input.slug}`);

  return { ok: true };
}

export async function sendMarketplaceVendorMessageAction(input: {
  vendorId: string;
  productSlug: string;
  message: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const actor = await requireWorkspacePermissionActor();
  if (!actor.workspaceId) {
    return { ok: false, error: "Workspace required" };
  }
  if (!hasPermission(actor.granted, "marketplace:read")) {
    return { ok: false, error: "You do not have permission to contact vendors." };
  }

  const trimmed = input.message.trim();
  if (!trimmed) {
    return { ok: false, error: "Message cannot be empty." };
  }

  await prisma.vendorMessage.create({
    data: {
      senderId: actor.sessionUserId,
      senderType: "BUYER",
      message: trimmed.slice(0, 4000),
    },
  });

  await auditLog({
    workspaceId: actor.workspaceId,
    actor: {
      userId: actor.sessionUserId,
      email: actor.email,
      role: actor.staffRoleType ?? actor.workspaceRole,
    },
    action: AUDIT_ACTIONS.NOTIFICATION_SENT,
    category: "OTHER",
    source: "USER",
    severity: "INFO",
    entity: { type: "Vendor", id: input.vendorId, label: "marketplace.contact" },
    metadata: {
      operation: "marketplace.vendor.contact",
      productSlug: input.productSlug,
    },
  });

  return { ok: true };
}
