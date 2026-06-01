import { randomUUID } from "crypto";

import type { Prisma } from "@prisma/client";

import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/services/audit/audit-service";

export type MarketplaceCartItem = {
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

export type MarketplaceSavedCart = {
  id: string;
  name: string;
  items: MarketplaceCartItem[];
  savedAt: string;
};

export type MarketplaceCartPayload = {
  items: MarketplaceCartItem[];
  savedTemplates: MarketplaceSavedCart[];
};

export type MarketplaceCartView = {
  id: string;
  workspaceId: string;
  items: MarketplaceCartItem[];
  savedTemplates: MarketplaceSavedCart[];
  savedAt: Date;
  expiresAt: Date | null;
  itemCount: number;
  subtotal: number;
};

type CartAuditActor = {
  userId: string;
  email: string | null;
  role: string;
};

function isCartItem(value: unknown): value is MarketplaceCartItem {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as MarketplaceCartItem).productId === "string" &&
    typeof (value as MarketplaceCartItem).quantity === "number" &&
    typeof (value as MarketplaceCartItem).unitPrice === "number"
  );
}

export function parseCartPayload(raw: unknown): MarketplaceCartPayload {
  if (Array.isArray(raw)) {
    return {
      items: raw.filter(isCartItem),
      savedTemplates: [],
    };
  }

  if (!raw || typeof raw !== "object") {
    return { items: [], savedTemplates: [] };
  }

  const record = raw as Record<string, unknown>;
  const items = Array.isArray(record.items) ? record.items.filter(isCartItem) : [];
  const savedTemplates = Array.isArray(record.savedTemplates)
    ? record.savedTemplates
        .map((entry) => {
          if (!entry || typeof entry !== "object") return null;
          const template = entry as MarketplaceSavedCart;
          if (typeof template.id !== "string" || typeof template.name !== "string") return null;
          if (!Array.isArray(template.items)) return null;
          return {
            id: template.id,
            name: template.name,
            items: template.items.filter(isCartItem),
            savedAt: typeof template.savedAt === "string" ? template.savedAt : new Date().toISOString(),
          } satisfies MarketplaceSavedCart;
        })
        .filter((entry): entry is MarketplaceSavedCart => entry != null)
    : [];

  return { items, savedTemplates };
}

export function cartSubtotal(items: readonly MarketplaceCartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

async function writeCartPayload(
  workspaceId: string,
  payload: MarketplaceCartPayload,
  actor?: CartAuditActor,
  metadata?: Record<string, unknown>,
): Promise<MarketplaceCartView> {
  const cart = await prisma.marketplaceCart.upsert({
    where: { workspaceId },
    create: {
      workspaceId,
      items: payload as unknown as Prisma.InputJsonValue,
    },
    update: {
      items: payload as unknown as Prisma.InputJsonValue,
      savedAt: new Date(),
    },
  });

  if (actor) {
    await auditLog({
      workspaceId,
      actor: {
        userId: actor.userId,
        email: actor.email,
        role: actor.role,
      },
      action: AUDIT_ACTIONS.SETTINGS_UPDATED,
      category: "OTHER",
      source: "USER",
      severity: "INFO",
      entity: { type: "MarketplaceCart", id: cart.id, label: "marketplace.cart" },
      metadata: {
        operation: "marketplace.cart.update",
        itemCount: payload.items.length,
        ...metadata,
      },
    });
  }

  return toCartView(cart);
}

function toCartView(cart: {
  id: string;
  workspaceId: string;
  items: unknown;
  savedAt: Date;
  expiresAt: Date | null;
}): MarketplaceCartView {
  const payload = parseCartPayload(cart.items);
  return {
    id: cart.id,
    workspaceId: cart.workspaceId,
    items: payload.items,
    savedTemplates: payload.savedTemplates,
    savedAt: cart.savedAt,
    expiresAt: cart.expiresAt,
    itemCount: payload.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: cartSubtotal(payload.items),
  };
}

export async function getCart(workspaceId: string): Promise<MarketplaceCartView | null> {
  const cart = await prisma.marketplaceCart.findUnique({ where: { workspaceId } });
  if (!cart) return null;
  return toCartView(cart);
}

export async function addToCart(
  workspaceId: string,
  input: Omit<MarketplaceCartItem, "currency"> & { currency: string },
  actor?: CartAuditActor,
): Promise<MarketplaceCartView> {
  const existing = (await getCart(workspaceId)) ?? {
    id: "",
    workspaceId,
    items: [],
    savedTemplates: [],
    savedAt: new Date(),
    expiresAt: null,
    itemCount: 0,
    subtotal: 0,
  };

  const quantity = Math.max(1, Math.floor(input.quantity));
  const items = [...existing.items];
  const index = items.findIndex(
    (item) =>
      item.productId === input.productId &&
      (item.variantId ?? null) === (input.variantId ?? null),
  );

  if (index >= 0) {
    items[index] = {
      ...items[index]!,
      quantity: items[index]!.quantity + quantity,
      unitPrice: input.unitPrice,
      name: input.name,
      sku: input.sku,
      slug: input.slug,
      vendorName: input.vendorName,
      currency: input.currency,
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

  return writeCartPayload(
    workspaceId,
    { items, savedTemplates: existing.savedTemplates },
    actor,
    { action: "add", productId: input.productId, quantity },
  );
}

export async function removeFromCart(
  workspaceId: string,
  itemIndex: number,
  actor?: CartAuditActor,
): Promise<MarketplaceCartView> {
  const existing = await getCart(workspaceId);
  const payload = parseCartPayload(existing?.items ?? []);
  const savedTemplates = existing?.savedTemplates ?? [];
  const items = payload.items.filter((_, index) => index !== itemIndex);
  return writeCartPayload(workspaceId, { items, savedTemplates }, actor, {
    action: "remove",
    itemIndex,
  });
}

export async function updateQuantity(
  workspaceId: string,
  itemIndex: number,
  quantity: number,
  actor?: CartAuditActor,
): Promise<MarketplaceCartView> {
  const existing = await getCart(workspaceId);
  const payload = parseCartPayload(existing?.items ?? []);
  const savedTemplates = existing?.savedTemplates ?? [];
  const items = [...payload.items];
  const line = items[itemIndex];
  if (!line) {
    throw new Error("Cart line not found.");
  }
  items[itemIndex] = {
    ...line,
    quantity: Math.max(1, Math.floor(quantity)),
  };
  return writeCartPayload(workspaceId, { items, savedTemplates }, actor, {
    action: "update_quantity",
    itemIndex,
    quantity,
  });
}

export async function saveCart(
  workspaceId: string,
  name: string,
  actor?: CartAuditActor,
): Promise<MarketplaceCartView> {
  const existing = await getCart(workspaceId);
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Saved cart name is required.");
  }
  if (!existing || existing.items.length === 0) {
    throw new Error("Cart is empty.");
  }

  const savedTemplates = [
    ...(existing.savedTemplates ?? []),
    {
      id: randomUUID(),
      name: trimmed,
      items: existing.items,
      savedAt: new Date().toISOString(),
    },
  ];

  return writeCartPayload(
    workspaceId,
    { items: existing.items, savedTemplates },
    actor,
    { action: "save_template", name: trimmed },
  );
}

export async function loadSavedCart(
  workspaceId: string,
  templateId: string,
  actor?: CartAuditActor,
): Promise<MarketplaceCartView> {
  const existing = await getCart(workspaceId);
  const template = existing?.savedTemplates.find((entry) => entry.id === templateId);
  if (!template) {
    throw new Error("Saved cart not found.");
  }

  return writeCartPayload(
    workspaceId,
    {
      items: template.items,
      savedTemplates: existing?.savedTemplates ?? [],
    },
    actor,
    { action: "load_template", templateId },
  );
}

export async function clearCart(workspaceId: string, actor?: CartAuditActor): Promise<MarketplaceCartView> {
  const existing = await getCart(workspaceId);
  return writeCartPayload(
    workspaceId,
    { items: [], savedTemplates: existing?.savedTemplates ?? [] },
    actor,
    { action: "clear" },
  );
}
