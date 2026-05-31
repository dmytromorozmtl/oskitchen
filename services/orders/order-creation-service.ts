import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { countOrdersThisMonth, getEffectivePlan } from "@/lib/plans";
import { generatePublicLookupToken } from "@/lib/order-token";
import { modeFor } from "@/lib/orders/order-creation-modes";
import { toDbFulfillmentType } from "@/lib/orders/order-fulfillment";
import { initialOrderPaymentStatusFromMode } from "@/lib/orders/order-payment";
import { toDbOrderStatus } from "@/lib/orders/order-status";
import { buildOrderStatusUpdate } from "@/services/orders/order-status-service";
import { redeemLoyaltyPoints } from "@/services/loyalty/loyalty-service";
import type { OrderCreateInput } from "@/lib/orders/order-validation";
import { recomputeMetricsForOrderEmail } from "@/services/crm/customer-metrics-service";
import { upsertCustomerFromOrder } from "@/services/crm/customer-service";
import { earnLoyaltyPointsForOrder } from "@/services/loyalty/loyalty-service";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { kitchenCustomerByIdWhereForOwner } from "@/lib/scope/workspace-customer-scope";
import {
  menuListWhereForOwnerAnd,
  productListWhereForOwnerAnd,
} from "@/lib/scope/workspace-resource-scope";
import { auditLog } from "@/services/audit/audit-service";
import { encryptOrderPiiFields } from "@/lib/orders/order-pii";

export type OrderCreateContext = {
  userId: string;
  performedById?: string | null;
  workspaceId?: string | null;
  db?: Prisma.TransactionClient;
};

export type OrderCreateOutcome =
  | {
      ok: true;
      orderId: string;
      lookupToken: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string | null;
      total: number;
    }
  | { ok: false; error: string };

type OrderPersistenceClient = Prisma.TransactionClient | typeof prisma;

export type PersistedOrderSnapshot = {
  orderId: string;
  lookupToken: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  total: number;
  brandId: string | null;
  locationId: string | null;
  workspaceId: string | null;
};

export type PersistResolvedOrderInput = {
  orderType: string;
  creationSource: string;
  statusKey: OrderCreateInput["statusKey"];
  paymentMode: NonNullable<OrderCreateInput["paymentMode"]>;
  workspaceId?: string | null;
  brandId?: string | null;
  locationId?: string | null;
  customerId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  fulfillmentDetail: NonNullable<OrderCreateInput["fulfillmentDetail"]>;
  fulfillmentDate?: string | Date | null;
  fulfillmentWindowStart?: string | Date | null;
  fulfillmentWindowEnd?: string | Date | null;
  pickupLocationId?: string | null;
  deliveryAddressJson?: Prisma.InputJsonValue;
  notes?: string | null;
  kitchenNotes?: string | null;
  packingNotes?: string | null;
  deliveryNotes?: string | null;
  allergyNotes?: string | null;
  dietaryNotes?: string | null;
  subtotal?: number;
  taxAmount?: number;
  feesAmount?: number;
  discountAmount?: number;
  total: number;
  channelProvider?: string | null;
  externalOrderId?: string | null;
  sourceMetadataJson?: Prisma.InputJsonValue;
  lines: ResolvedLine[];
};

/**
 * Resolve catalog products and price them. Lines with `productId` use the
 * catalog price (or the override on the line); lines without `productId`
 * use the custom title + unitPrice + qty.
 */
async function priceLines(
  userId: string,
  input: OrderCreateInput,
): Promise<
  | { ok: true; lines: ResolvedLine[]; subtotal: number; activeMenuId: string | null }
  | { ok: false; error: string }
> {
  const productIds = Array.from(
    new Set(
      input.lines
        .map((l) => l.productId)
        .filter((id): id is string => typeof id === "string"),
    ),
  );

  const products = productIds.length
    ? await prisma.product.findMany({
        where: await productListWhereForOwnerAnd(userId, { id: { in: productIds } }),
        include: { menu: { select: { id: true, active: true, catalogOnly: true, title: true } } },
      })
    : [];
  const byId = new Map(products.map((p) => [p.id, p]));

  const mode = modeFor(input.orderType);
  const activeMenu = mode.allowsActiveMenu
    ? await prisma.menu.findFirst({
        where: await menuListWhereForOwnerAnd(userId, { active: true, catalogOnly: false }),
        select: { id: true },
      })
    : null;

  if (mode.requiresActiveWeeklyMenu && !activeMenu) {
    return { ok: false, error: "Weekly preorder requires an active weekly menu. Activate one first or pick a different order type." };
  }

  const resolved: ResolvedLine[] = [];
  let subtotal = 0;

  for (const line of input.lines) {
    if (line.productId) {
      const p = byId.get(line.productId);
      if (!p) return { ok: false, error: `Item ${line.productId} not found in your catalog.` };
      if (mode.type === "PREORDER") {
        if (!activeMenu || p.menuId !== activeMenu.id) {
          return { ok: false, error: `Item “${p.title}” is not on the active weekly menu.` };
        }
      }
      const unitPrice = typeof line.unitPrice === "number" ? line.unitPrice : Number(p.price);
      const total = unitPrice * line.quantity;
      subtotal += total;
      resolved.push({
        productId: p.id,
        title: p.title,
        sku: line.sku,
        quantity: line.quantity,
        unitPrice,
        lineTotal: total,
        notes: line.notes,
        preparedDate: line.preparedDate ? new Date(line.preparedDate) : null,
        modifiersJson: parseJson(line.modifiersJson),
        sourceMappingId: line.sourceMappingId ?? null,
      });
      continue;
    }

    // Custom line item
    if (!mode.allowsCustomLines) {
      return { ok: false, error: `Custom items are not allowed for ${mode.type}.` };
    }
    const unitPrice = typeof line.unitPrice === "number" ? line.unitPrice : 0;
    const total = unitPrice * line.quantity;
    subtotal += total;
    resolved.push({
      productId: null,
      title: line.title ?? "Custom item",
      sku: line.sku,
      quantity: line.quantity,
      unitPrice,
      lineTotal: total,
      notes: line.notes,
      preparedDate: line.preparedDate ? new Date(line.preparedDate) : null,
      modifiersJson: parseJson(line.modifiersJson),
      sourceMappingId: line.sourceMappingId ?? null,
    });
  }

  return { ok: true, lines: resolved, subtotal, activeMenuId: activeMenu?.id ?? null };
}

type ResolvedLine = {
  productId: string | null;
  title: string;
  sku: string | undefined;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  notes: string | undefined;
  preparedDate: Date | null;
  modifiersJson: Prisma.InputJsonValue | null;
  sourceMappingId: string | null;
};

function parseJson(input: string | undefined | null): Prisma.InputJsonValue | null {
  if (!input) return null;
  try {
    return JSON.parse(input) as Prisma.InputJsonValue;
  } catch {
    return null;
  }
}

function asOptionalDate(value: string | Date | null | undefined): Date | undefined {
  if (!value) return undefined;
  return value instanceof Date ? value : new Date(value);
}

function resolveCreationSource(input: OrderCreateInput): string {
  if (input.creationSourceOverride?.trim()) {
    return input.creationSourceOverride.trim();
  }
  if (input.orderType === "STOREFRONT_ORDER") return "STOREFRONT";
  if (input.orderType === "SALES_CHANNEL_ORDER") return "CHANNEL_IMPORT";
  if (input.orderType === "POS_SALE") return "POS";
  return "MANUAL";
}

export async function persistResolvedOrder(
  ctx: OrderCreateContext,
  input: PersistResolvedOrderInput,
): Promise<PersistedOrderSnapshot> {
  const db: OrderPersistenceClient = ctx.db ?? prisma;
  const statusFields = buildOrderStatusUpdate({
    status: toDbOrderStatus(input.statusKey ?? "CONFIRMED"),
    statusDetail: input.statusKey ?? "CONFIRMED",
  });
  const dbFulfillment = toDbFulfillmentType(input.fulfillmentDetail);
  const workspaceId =
    input.workspaceId ??
    ctx.workspaceId ??
    (await resolveOwnerWorkspaceId(ctx.userId));
  const pii = encryptOrderPiiFields({
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone ?? undefined,
  });

  const order = await db.order.create({
    data: {
      userId: ctx.userId,
      workspaceId: workspaceId ?? undefined,
      brandId: input.brandId ?? undefined,
      locationId: input.locationId ?? undefined,
      customerId: input.customerId ?? undefined,
      customerName: pii.customerName,
      customerEmail: pii.customerEmail,
      customerPhone: pii.customerPhone ?? undefined,
      total: input.total,
      status: statusFields.status,
      statusDetail: statusFields.statusDetail,
      orderType: input.orderType,
      creationSource: input.creationSource,
      paymentMode: input.paymentMode,
      paymentStatus: initialOrderPaymentStatusFromMode(input.paymentMode),
      fulfillmentType: dbFulfillment,
      fulfillmentDetail: input.fulfillmentDetail,
      pickupDate: asOptionalDate(input.fulfillmentDate),
      fulfillmentWindowStart: asOptionalDate(input.fulfillmentWindowStart),
      fulfillmentWindowEnd: asOptionalDate(input.fulfillmentWindowEnd),
      pickupLocationId: input.pickupLocationId ?? undefined,
      deliveryAddressJson: input.deliveryAddressJson,
      notes: input.notes ?? undefined,
      kitchenNotes: input.kitchenNotes ?? undefined,
      packingNotes: input.packingNotes ?? undefined,
      deliveryNotesExt: input.deliveryNotes ?? undefined,
      allergyNotes: input.allergyNotes ?? undefined,
      dietaryNotes: input.dietaryNotes ?? undefined,
      subtotal: input.subtotal ?? undefined,
      taxAmount: input.taxAmount || undefined,
      feesAmount: input.feesAmount || undefined,
      discountAmount: input.discountAmount || undefined,
      channelProvider: input.channelProvider ?? undefined,
      externalOrderIdExt: input.externalOrderId ?? undefined,
      sourceMetadataJson: input.sourceMetadataJson,
      publicLookupToken: generatePublicLookupToken(),
      orderItems: {
        create: input.lines.map((l) => ({
          productId: l.productId ?? undefined,
          quantity: l.quantity,
          title: l.title,
          sku: l.sku,
          unitPrice: l.unitPrice,
          lineTotal: l.lineTotal,
          notes: l.notes,
          preparedDate: l.preparedDate ?? undefined,
          modifiersJson: (l.modifiersJson ?? undefined) as Prisma.InputJsonValue | undefined,
          sourceMappingId: l.sourceMappingId ?? undefined,
        })),
      },
    },
    select: {
      id: true,
      customerId: true,
      publicLookupToken: true,
      total: true,
      brandId: true,
      locationId: true,
      workspaceId: true,
    },
  });

  return {
    orderId: order.id,
    customerId: order.customerId ?? null,
    lookupToken: order.publicLookupToken ?? "",
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone ?? null,
    total: Number(order.total),
    brandId: order.brandId ?? null,
    locationId: order.locationId ?? null,
    workspaceId: order.workspaceId ?? workspaceId ?? null,
  };
}

async function runCanonicalOrderSideEffects(
  ctx: OrderCreateContext,
  input: OrderCreateInput,
  order: PersistedOrderSnapshot,
) {
  await auditLog({
    actor: { userId: ctx.performedById ?? ctx.userId },
    action: "ORDER_CREATED",
    category: "ORDERS",
    source: "USER",
    severity: "INFO",
    entity: { type: "Order", id: order.orderId, label: input.orderType },
    metadata: {
      orderType: input.orderType,
      total: order.total,
      fulfillment: input.fulfillmentDetail,
      creationSource: resolveCreationSource(input),
    },
    maskPiiInMetadata: true,
  }).catch(() => undefined);

  if (
    order.customerEmail &&
    !order.customerEmail.endsWith("@local.kitchenos.invalid")
  ) {
    await upsertCustomerFromOrder({
      userId: ctx.userId,
      email: order.customerEmail,
      name: order.customerName,
      phone: order.customerPhone,
      source: "MANUAL",
      brandId: order.brandId,
      locationId: order.locationId,
      orderId: order.orderId,
      orderTotal: order.total,
    }).catch(() => undefined);
    await recomputeMetricsForOrderEmail(ctx.userId, order.customerEmail).catch(
      () => undefined,
    );
  }

  if (order.customerId && input.orderType === "STOREFRONT_ORDER") {
    await earnLoyaltyPointsForOrder(
      ctx.userId,
      order.customerId,
      order.orderId,
      order.total,
    ).catch(() => undefined);
  }
}

async function resolveCustomer(ctx: OrderCreateContext, input: OrderCreateInput): Promise<
  | { ok: true; customerId: string | null; name: string; email: string; phone: string | null }
  | { ok: false; error: string }
> {
  if (input.customerId) {
    const c = await prisma.kitchenCustomer.findFirst({
      where: await kitchenCustomerByIdWhereForOwner(ctx.userId, input.customerId),
      select: { id: true, email: true, name: true, phone: true, displayName: true, firstName: true, lastName: true },
    });
    if (!c) return { ok: false, error: "Selected customer not found in this workspace." };
    const name =
      input.customerName ??
      c.displayName ??
      c.name ??
      [c.firstName, c.lastName].filter(Boolean).join(" ") ??
      c.email;
    return { ok: true, customerId: c.id, name, email: input.customerEmail ?? c.email, phone: input.customerPhone ?? c.phone };
  }

  const name = (input.customerName ?? "").trim();
  const email = (input.customerEmail ?? "").trim();
  const phone = (input.customerPhone ?? "").trim();
  // For request-only / draft, name+email become optional; we synthesize placeholders to keep DB NOT NULL columns happy.
  return {
    ok: true,
    customerId: null,
    name: name || "Walk-in customer",
    email: email || `no-email+${Date.now()}@local.kitchenos.invalid`,
    phone: phone || null,
  };
}

export async function createOrderViaCenter(
  ctx: OrderCreateContext,
  input: OrderCreateInput,
): Promise<OrderCreateOutcome> {
  const { limits } = await getEffectivePlan(ctx.userId);
  if (limits.maxOrdersPerMonth != null) {
    const count = await countOrdersThisMonth(ctx.userId);
    if (count >= limits.maxOrdersPerMonth) {
      return { ok: false, error: `Monthly order limit reached (${limits.maxOrdersPerMonth}). Upgrade on Billing.` };
    }
  }

  const mode = modeFor(input.orderType);
  const statusKey = input.statusKey ?? mode.defaultStatus;
  if (!mode.allowedStatuses.includes(statusKey)) {
    return { ok: false, error: `Status ${statusKey} not allowed for ${mode.type}.` };
  }

  const fulfillmentDetail = input.fulfillmentDetail ?? mode.defaultFulfillment;
  if (!mode.allowedFulfillments.includes(fulfillmentDetail)) {
    return { ok: false, error: `Fulfillment ${fulfillmentDetail} not allowed for ${mode.type}.` };
  }
  const paymentMode = input.paymentMode ?? mode.defaultPaymentMode;

  const customerR = await resolveCustomer(ctx, input);
  if (!customerR.ok) return customerR;

  const linesR = await priceLines(ctx.userId, input);
  if (!linesR.ok) return linesR;

  const subtotal = typeof input.subtotal === "number" ? input.subtotal : linesR.subtotal;
  const tax = input.taxAmount ?? 0;
  const fees = input.feesAmount ?? 0;
  let discount = input.discountAmount ?? 0;
  if (input.loyaltyPointsRedeem && customerR.customerId && input.loyaltyPointsRedeem > 0) {
    try {
      const lr = await redeemLoyaltyPoints(
        ctx.userId,
        customerR.customerId,
        input.loyaltyPointsRedeem,
      );
      discount += lr.discount;
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Loyalty redeem failed." };
    }
  }
  const total = typeof input.total === "number" ? input.total : Math.max(0, subtotal + tax + fees - discount);

  const sourceMetadata = input.sourceMetadataJson ? safeJson(input.sourceMetadataJson) : undefined;
  const deliveryAddressJson = input.deliveryAddressJson ?? undefined;
  const order = await persistResolvedOrder(ctx, {
    orderType: input.persistedOrderType ?? input.orderType,
    creationSource: resolveCreationSource(input),
    statusKey,
    paymentMode,
    workspaceId: ctx.workspaceId,
    brandId: input.brandId ?? undefined,
    locationId: input.locationId ?? undefined,
    customerId: customerR.customerId ?? undefined,
    customerName: customerR.name,
    customerEmail: customerR.email,
    customerPhone: customerR.phone ?? undefined,
    fulfillmentDetail,
    fulfillmentDate: input.fulfillmentDate,
    fulfillmentWindowStart: input.fulfillmentWindowStart,
    fulfillmentWindowEnd: input.fulfillmentWindowEnd,
    pickupLocationId: input.pickupLocationId ?? undefined,
    deliveryAddressJson: deliveryAddressJson as Prisma.InputJsonValue | undefined,
    notes: input.notes ?? undefined,
    kitchenNotes: input.kitchenNotes ?? undefined,
    packingNotes: input.packingNotes ?? undefined,
    deliveryNotes: input.deliveryNotes ?? undefined,
    allergyNotes: input.allergyNotes ?? undefined,
    dietaryNotes: input.dietaryNotes ?? undefined,
    subtotal: input.subtotal ?? subtotal,
    taxAmount: tax || undefined,
    feesAmount: fees || undefined,
    discountAmount: discount || undefined,
    total,
    channelProvider: input.channelProvider ?? undefined,
    externalOrderId: input.externalOrderId ?? undefined,
    sourceMetadataJson: sourceMetadata,
    lines: linesR.lines,
  });

  await runCanonicalOrderSideEffects(ctx, input, order);

  const { emitOrderCreatedOutboundWebhook } = await import(
    "@/services/webhooks/outbound-webhook-emitters"
  );
  await emitOrderCreatedOutboundWebhook({
    ownerUserId: ctx.userId,
    workspaceId: order.workspaceId,
    orderId: order.orderId,
    status: toDbOrderStatus(statusKey),
    statusDetail: statusKey,
    total: order.total,
    fulfillmentType: toDbFulfillmentType(fulfillmentDetail),
    fulfillmentDetail,
    creationSource: resolveCreationSource(input),
    lineCount: linesR.lines.length,
    brandId: order.brandId,
    locationId: order.locationId,
  }).catch(() => undefined);

  return {
    ok: true,
    orderId: order.orderId,
    lookupToken: order.lookupToken,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    total: order.total,
  };
}

function safeJson(input: string): Prisma.InputJsonValue | undefined {
  try {
    return JSON.parse(input) as Prisma.InputJsonValue;
  } catch {
    return undefined;
  }
}
