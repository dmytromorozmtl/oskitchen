import { randomUUID } from "crypto";
import { addDays } from "date-fns";
import type { Prisma } from "@prisma/client";

import {
  marketplaceCapitalFromSettingsCenter,
  mergeMarketplaceCapitalIntoSettingsCenter,
  type MarketplaceCreditLine,
  type MarketplaceEquipmentFinancingOption,
  type MarketplacePaymentSchedule,
} from "@/lib/marketplace/capital-integration-types";
import { listLenderOfferPartners } from "@/lib/commercial/capital-partners";
import { resolveCapitalRegionForOwner } from "@/services/commercial/capital-multi-lender-service";
import { prisma } from "@/lib/prisma";
import { capitalPartnerReferralListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { auditLog } from "@/services/audit/audit-service";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import type { MarketplaceCartItem } from "@/services/marketplace/cart-service";
import type {
  MarketplaceCheckoutInput,
  MarketplaceCheckoutResult,
} from "@/services/marketplace/checkout-service";

const OPEN_NET_TERMS_STATUSES = [
  "SUBMITTED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "DISPUTED",
  "PENDING_APPROVAL",
] as const;

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

async function loadKitchenCapitalSettings(userId: string) {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { settingsCenterJson: true },
  });
  return marketplaceCapitalFromSettingsCenter(kitchen?.settingsCenterJson);
}

async function savePaymentSchedule(userId: string, schedule: MarketplacePaymentSchedule): Promise<void> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { settingsCenterJson: true },
  });
  const capital = marketplaceCapitalFromSettingsCenter(kitchen?.settingsCenterJson);
  const next = mergeMarketplaceCapitalIntoSettingsCenter(kitchen?.settingsCenterJson, {
    paymentSchedules: [schedule, ...capital.paymentSchedules].slice(0, 50),
  });
  await prisma.kitchenSettings.upsert({
    where: { userId },
    create: { userId, settingsCenterJson: next as Prisma.InputJsonValue },
    update: { settingsCenterJson: next as Prisma.InputJsonValue },
  });
}

async function sumOpenNetTermsExposure(workspaceId: string): Promise<number> {
  const agg = await prisma.marketplacePurchaseOrder.aggregate({
    where: {
      workspaceId,
      paymentMethod: "NET_TERMS",
      status: { in: [...OPEN_NET_TERMS_STATUSES] },
    },
    _sum: { total: true },
  });
  return decimalToNumber(agg._sum.total);
}

async function deriveGmvCreditLimit(workspaceId: string): Promise<number> {
  const since = addDays(new Date(), -90);
  const agg = await prisma.marketplacePurchaseOrder.aggregate({
    where: {
      workspaceId,
      createdAt: { gte: since },
      status: { notIn: ["DRAFT", "CANCELLED"] },
    },
    _sum: { total: true },
  });
  const gmv90 = decimalToNumber(agg._sum.total);
  return Math.max(5000, Math.round(gmv90 * 0.5));
}

async function capitalFundedBoost(userId: string): Promise<number> {
  const referralScope = await capitalPartnerReferralListWhereForOwner(userId);
  const funded = await prisma.capitalPartnerReferral.count({
    where: { AND: [referralScope, { status: "FUNDED" }] },
  });
  return funded > 0 ? 2500 * funded : 0;
}

export async function getCreditLine(input: {
  workspaceId: string;
  userId: string;
}): Promise<MarketplaceCreditLine> {
  const [settings, usedUsd, gmvLimit, capitalBoost] = await Promise.all([
    loadKitchenCapitalSettings(input.userId),
    sumOpenNetTermsExposure(input.workspaceId),
    deriveGmvCreditLimit(input.workspaceId),
    capitalFundedBoost(input.userId),
  ]);

  let limitUsd = settings.creditLimitUsd ?? gmvLimit;
  let source: MarketplaceCreditLine["source"] = settings.creditLimitUsd ? "settings" : "gmv_derived";

  if (capitalBoost > 0) {
    limitUsd += capitalBoost;
    source = "capital_funded";
  }

  const availableUsd = Math.max(0, Math.round((limitUsd - usedUsd) * 100) / 100);

  return {
    limitUsd: Math.round(limitUsd * 100) / 100,
    usedUsd: Math.round(usedUsd * 100) / 100,
    availableUsd,
    netTermsDays: settings.netTermsDays,
    source,
    capitalBoostUsd: capitalBoost,
  };
}

export async function paymentSchedule(input: {
  workspaceId: string;
  userId: string;
  orderIds: string[];
  netTermsDays?: number;
}): Promise<MarketplacePaymentSchedule> {
  const [settings, orders] = await Promise.all([
    loadKitchenCapitalSettings(input.userId),
    prisma.marketplacePurchaseOrder.findMany({
      where: { id: { in: input.orderIds }, workspaceId: input.workspaceId },
      select: { id: true, poNumber: true, total: true, createdAt: true },
    }),
  ]);

  const netTermsDays = input.netTermsDays ?? settings.netTermsDays;
  const totalUsd = orders.reduce((sum, order) => sum + decimalToNumber(order.total), 0);
  const anchorDate = orders[0]?.createdAt ?? new Date();

  const schedule: MarketplacePaymentSchedule = {
    id: randomUUID(),
    workspaceId: input.workspaceId,
    orderIds: orders.map((order) => order.id),
    totalUsd: Math.round(totalUsd * 100) / 100,
    netTermsDays,
    createdAt: new Date().toISOString(),
    entries: orders.map((order) => ({
      dueDate: addDays(anchorDate, netTermsDays).toISOString(),
      amountUsd: decimalToNumber(order.total),
      status: "scheduled" as const,
      orderId: order.id,
      poNumber: order.poNumber,
    })),
  };

  await savePaymentSchedule(input.userId, schedule);

  await auditLog({
    workspaceId: input.workspaceId,
    actor: { userId: input.userId, email: null, role: "SYSTEM" },
    action: AUDIT_ACTIONS.SETTINGS_UPDATED,
    category: "OTHER",
    source: "SYSTEM",
    severity: "INFO",
    entity: { type: "MarketplacePaymentSchedule", id: schedule.id, label: "net_terms" },
    metadata: {
      operation: "marketplace.capital.payment_schedule",
      scheduleId: schedule.id,
      orderIds: schedule.orderIds,
      netTermsDays,
      totalUsd: schedule.totalUsd,
    },
  });

  return schedule;
}

export async function checkoutWithNetTerms(
  input: MarketplaceCheckoutInput,
): Promise<
  | ({ ok: true } & MarketplaceCheckoutResult & { schedule: MarketplacePaymentSchedule; creditLine: MarketplaceCreditLine })
  | { ok: false; error: string }
> {
  if (input.paymentMethod !== "NET_TERMS") {
    return { ok: false, error: "checkoutWithNetTerms requires NET_TERMS payment method." };
  }

  const checkoutModule = await import("@/services/marketplace/checkout-service");
  const cartModule = await import("@/services/marketplace/cart-service");

  const validation = await checkoutModule.validateCart(input.workspaceId);
  if (!validation.ok) {
    return { ok: false, error: validation.issues[0]?.message ?? "Cart validation failed." };
  }

  const cartTotal = cartModule.cartSubtotal(validation.items);
  const creditLine = await getCreditLine({ workspaceId: input.workspaceId, userId: input.userId });

  if (cartTotal > creditLine.availableUsd) {
    return {
      ok: false,
      error: `Net terms credit exceeded. Available $${creditLine.availableUsd.toFixed(2)} of $${creditLine.limitUsd.toFixed(2)}.`,
    };
  }

  const { orders, requiresApproval } = await checkoutModule.createOrders(input);

  await checkoutModule.sendConfirmation({
    workspaceId: input.workspaceId,
    userId: input.userId,
    actorEmail: input.actorEmail,
    orderIds: orders.map((order) => order.id),
  });

  await cartModule.clearCart(input.workspaceId, {
    userId: input.actorUserId,
    email: input.actorEmail,
    role: input.actorRole,
  });

  const schedule = await paymentSchedule({
    workspaceId: input.workspaceId,
    userId: input.userId,
    orderIds: orders.map((order) => order.id),
    netTermsDays: creditLine.netTermsDays,
  });

  return {
    ok: true,
    orderIds: orders.map((order) => order.id),
    requiresApproval,
    paymentIntentClientSecret: null,
    paymentIntentId: null,
    schedule,
    creditLine,
  };
}

export async function equipmentFinancing(input: {
  userId: string;
  workspaceId: string;
  orderTotalUsd?: number;
  cartItems?: MarketplaceCartItem[];
}): Promise<MarketplaceEquipmentFinancingOption[]> {
  const region = await resolveCapitalRegionForOwner(input.userId);
  const partners = listLenderOfferPartners({ region }).filter((partner) =>
    partner.slug.includes("equipment"),
  );

  const cartModule = await import("@/services/marketplace/cart-service");
  let items = input.cartItems ?? [];
  if (items.length === 0) {
    const cart = await cartModule.getCart(input.workspaceId);
    items = cart?.items ?? [];
  }

  let eligibleTotal = input.orderTotalUsd ?? cartModule.cartSubtotal(items);
  const hasEquipmentCategory = await detectEquipmentInCart(items);
  if (!hasEquipmentCategory && eligibleTotal < 10000) {
    return [];
  }

  return partners.map((partner) => ({
    partnerSlug: partner.slug,
    partnerName: partner.name,
    title: partner.offerProgramName ?? partner.name,
    summary: partner.description ?? null,
    amountMin: null,
    amountMax: null,
    currency: "USD",
    termLabel: partner.offerAmountLabel ?? null,
    deepLink: partner.offerApplyUrlTemplate ?? partner.href ?? null,
    eligibleOrderTotal: eligibleTotal,
  }));
}

async function detectEquipmentInCart(items: MarketplaceCartItem[]): Promise<boolean> {
  if (items.length === 0) return false;
  const products = await prisma.vendorProduct.findMany({
    where: { id: { in: items.map((item) => item.productId) } },
    select: { category: { select: { slug: true } } },
  });
  return products.some((product) => product.category.slug === "equipment");
}

export async function listMarketplacePaymentSchedules(userId: string): Promise<MarketplacePaymentSchedule[]> {
  const settings = await loadKitchenCapitalSettings(userId);
  return settings.paymentSchedules;
}

export async function assertNetTermsCheckoutAllowed(input: {
  workspaceId: string;
  userId: string;
  additionalAmountUsd: number;
}): Promise<{ ok: true; creditLine: MarketplaceCreditLine } | { ok: false; error: string }> {
  const creditLine = await getCreditLine(input);
  if (input.additionalAmountUsd > creditLine.availableUsd) {
    return {
      ok: false,
      error: `Insufficient net terms credit. Available $${creditLine.availableUsd.toFixed(2)}.`,
    };
  }
  return { ok: true, creditLine };
}
