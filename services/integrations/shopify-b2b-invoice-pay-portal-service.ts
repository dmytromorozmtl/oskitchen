import type Stripe from "stripe";
import { type Prisma } from "@prisma/client";

import {
  B2B_PAY_PORTAL_SYSTEM_ACTOR,
  isShopifyMarketsB2bPayPortalEnabled,
  resolveB2bPayPortalEnabled,
  resolveB2bPayPortalTokenTtlDays,
  SHOPIFY_MARKET_B2B_PAY_PORTAL_HONESTY,
} from "@/lib/commercial/shopify-market-b2b-pay-portal";
import { getStripeClient, safeStripeError } from "@/lib/billing/stripe-client";
import { SITE_URL } from "@/lib/constants";
import {
  appendInvoiceDraftToB2bMetadata,
  incrementB2bPayPortalStats,
  isB2bInvoiceDraftOpen,
  openB2bInvoiceAmountCents,
  patchInvoiceDraftPayPortalIssued,
  readB2bInvoiceDraftLink,
  type B2bInvoiceDraftLink,
  type B2bPayPortalStats,
} from "@/lib/integrations/shopify-b2b-invoice-draft-metadata";
import type { B2bPayPortalView } from "@/lib/integrations/shopify-b2b-pay-portal-types";
import {
  buildB2bPayPortalUrl,
  mintB2bPayPortalToken,
  verifyB2bPayPortalToken,
} from "@/lib/integrations/shopify-b2b-pay-portal-token";
import {
  readKitchenOrderB2bMetadata,
  type KitchenOrderB2bMetadata,
} from "@/lib/integrations/shopify-b2b-kitchen-order-metadata";
import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
} from "@/lib/integrations/shopify-markets-settings";
import { prisma } from "@/lib/prisma";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";
import { formatCurrency } from "@/lib/utils";
import { recordBillingEvent } from "@/services/billing/billing-service";
import { markB2bInvoiceDraftPaid } from "@/services/integrations/shopify-b2b-invoice-payment-service";

export type { B2bPayPortalView } from "@/lib/integrations/shopify-b2b-pay-portal-types";
export { SHOPIFY_MARKET_B2B_PAY_PORTAL_HONESTY };

async function recordPayPortalStats(input: {
  connectionId: string | null;
  patch: Partial<B2bPayPortalStats>;
  checkoutAt?: string;
}) {
  if (!input.connectionId) return;
  const conn = await prisma.integrationConnection.findUnique({
    where: { id: input.connectionId },
    select: { settingsJson: true },
  });
  if (!conn) return;

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const nextStats = incrementB2bPayPortalStats(sync.b2bPayPortalStats, input.patch);
  await prisma.integrationConnection.update({
    where: { id: input.connectionId },
    data: {
      settingsJson: mergeShopifyMarketsSyncSettings(conn.settingsJson, {
        b2bPayPortalStats: nextStats,
        ...(input.checkoutAt ? { lastB2bPayPortalCheckoutAt: input.checkoutAt } : {}),
      }) as Prisma.InputJsonValue,
    },
  });
}

function readConnectionIdFromOrder(order: { channelTraceJson: unknown }): string | null {
  if (order.channelTraceJson && typeof order.channelTraceJson === "object") {
    const id = (order.channelTraceJson as Record<string, unknown>).connectionId;
    if (typeof id === "string" && id.trim()) return id;
  }
  return null;
}

async function resolveMerchantStripeConnect(userId: string): Promise<{
  accountId: string | null;
  chargesEnabled: boolean;
}> {
  const sf = await prisma.storefrontSettings.findFirst({
    where: {
      userId,
      stripeConnectAccountId: { not: null },
      stripeConnectChargesEnabled: true,
    },
    select: {
      stripeConnectAccountId: true,
      stripeConnectChargesEnabled: true,
    },
    orderBy: { updatedAt: "desc" },
  });
  return {
    accountId: sf?.stripeConnectAccountId?.trim() ?? null,
    chargesEnabled: Boolean(sf?.stripeConnectChargesEnabled),
  };
}

function buildAchInstructions(input: {
  businessName: string;
  invoiceNumber: string;
  amountLabel: string;
  poNumber: string | null;
}): string {
  const poLine = input.poNumber ? ` Include PO ${input.poNumber} in the wire memo.` : "";
  return `Send ${input.amountLabel} to ${input.businessName}. Use invoice ${input.invoiceNumber} as the payment reference.${poLine} Reply to your account contact once sent so we can reconcile your account.`;
}

async function loadPayPortalOrder(token: string) {
  if (!isShopifyMarketsB2bPayPortalEnabled()) return null;

  const payload = verifyB2bPayPortalToken(token);
  if (!payload) return null;

  const order = await prisma.order.findFirst({
    where: { id: payload.orderId, userId: payload.userId },
    select: {
      id: true,
      userId: true,
      workspaceId: true,
      paymentStatus: true,
      sourceMetadataJson: true,
      channelTraceJson: true,
    },
  });
  if (!order) return null;

  const draft = readB2bInvoiceDraftLink(order.sourceMetadataJson);
  if (!draft || draft.invoiceId !== payload.invoiceId) return null;

  return { payload, order, draft };
}

export async function ensureB2bInvoicePayPortalLink(input: {
  userId: string;
  orderId: string;
  connectionId?: string | null;
}): Promise<{ ok: true; url: string; token: string } | { ok: false; reason: string }> {
  if (!isShopifyMarketsB2bPayPortalEnabled()) {
    return { ok: false, reason: "pay_portal_disabled" };
  }

  const order = await prisma.order.findFirst({
    where: { id: input.orderId, userId: input.userId },
    select: {
      id: true,
      userId: true,
      sourceMetadataJson: true,
      channelTraceJson: true,
      paymentStatus: true,
    },
  });
  if (!order) return { ok: false, reason: "order_not_found" };

  const draft = readB2bInvoiceDraftLink(order.sourceMetadataJson);
  if (!draft) return { ok: false, reason: "no_invoice_draft" };
  if (!isB2bInvoiceDraftOpen(draft)) return { ok: false, reason: "already_paid" };

  let portalEnabled = true;
  let ttlDays = resolveB2bPayPortalTokenTtlDays(null);
  const connectionId = input.connectionId ?? readConnectionIdFromOrder(order);
  if (connectionId) {
    const conn = await prisma.integrationConnection.findUnique({
      where: { id: connectionId },
      select: { settingsJson: true },
    });
    if (conn) {
      const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
      portalEnabled = resolveB2bPayPortalEnabled(sync.b2bPayPortalEnabled);
      ttlDays = resolveB2bPayPortalTokenTtlDays(sync.b2bPayPortalTokenTtlDays);
    }
  }
  if (!portalEnabled) return { ok: false, reason: "portal_disabled" };

  const issuedAt = new Date().toISOString();
  if (!draft.payPortalIssuedAt) {
    const b2b = readKitchenOrderB2bMetadata(order.sourceMetadataJson);
    const root =
      order.sourceMetadataJson && typeof order.sourceMetadataJson === "object"
        ? { ...(order.sourceMetadataJson as Record<string, unknown>) }
        : {};
    root.b2b = appendInvoiceDraftToB2bMetadata(
      (b2b ?? {}) as KitchenOrderB2bMetadata,
      patchInvoiceDraftPayPortalIssued(draft, issuedAt),
    );
    await prisma.order.update({
      where: { id: order.id },
      data: { sourceMetadataJson: root as Prisma.InputJsonValue },
    });
    if (connectionId) {
      await recordPayPortalStats({
        connectionId,
        patch: { linksMinted: 1 },
      });
    }
  }

  const token = mintB2bPayPortalToken({
    orderId: order.id,
    invoiceId: draft.invoiceId,
    userId: order.userId,
    ttlDays,
  });

  return { ok: true, url: buildB2bPayPortalUrl(token, SITE_URL), token };
}

export async function resolveB2bPayPortalView(token: string): Promise<B2bPayPortalView | null> {
  const loaded = await loadPayPortalOrder(token);
  if (!loaded) return null;

  const { order, draft } = loaded;
  const paid =
    draft.status === "paid" || (order.paymentStatus ?? "").toUpperCase() === "PAID";
  const amountDueCents = openB2bInvoiceAmountCents(draft);
  const amountDueLabel = formatCurrency(amountDueCents / 100);

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: order.userId },
    select: { businessName: true, currency: true },
  });
  const businessName = kitchen?.businessName?.trim() || "OS Kitchen";
  const connect = await resolveMerchantStripeConnect(order.userId);
  const stripeCheckoutAvailable =
    !paid && amountDueCents >= 50 && Boolean(getStripeClient()) && connect.chargesEnabled;

  const dueLabel = draft.dueAt
    ? new Date(draft.dueAt).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return {
    businessName,
    invoiceNumber: draft.invoiceNumber,
    companyName: draft.companyName,
    poNumber: draft.poNumber,
    paymentTermsLabel: draft.paymentTermsLabel,
    amountDueCents,
    currency: draft.currency,
    amountDueLabel,
    dueAt: draft.dueAt,
    dueLabel,
    status: draft.status,
    stripeCheckoutAvailable,
    achInstructions: buildAchInstructions({
      businessName,
      invoiceNumber: draft.invoiceNumber,
      amountLabel: amountDueLabel,
      poNumber: draft.poNumber,
    }),
    honesty: SHOPIFY_MARKET_B2B_PAY_PORTAL_HONESTY,
    paid,
  };
}

export async function createB2bPayPortalCheckoutSession(
  token: string,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const loaded = await loadPayPortalOrder(token);
  if (!loaded) return { ok: false, error: "Invalid or expired pay link." };

  const { order, draft } = loaded;
  if (!isB2bInvoiceDraftOpen(draft)) {
    return { ok: false, error: "This invoice is already paid." };
  }

  const amountDueCents = openB2bInvoiceAmountCents(draft);
  if (amountDueCents < 50) {
    return { ok: false, error: "Amount is too small for card checkout." };
  }

  const stripe = getStripeClient();
  if (!stripe) return { ok: false, error: "Card checkout is not available right now." };

  const connect = await resolveMerchantStripeConnect(order.userId);
  if (!connect.accountId || !connect.chargesEnabled) {
    const connectionId = readConnectionIdFromOrder(order);
    if (connectionId) {
      await recordPayPortalStats({
        connectionId,
        patch: { skippedNoStripe: 1 },
      });
    }
    return { ok: false, error: "Card checkout is not configured for this kitchen." };
  }

  const currency = draft.currency.toLowerCase();
  const successUrl = `${SITE_URL}/pay/b2b/${encodeURIComponent(token)}?paid=1`;
  const cancelUrl = `${SITE_URL}/pay/b2b/${encodeURIComponent(token)}?canceled=1`;

  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        client_reference_id: order.id,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          purpose: "b2b_invoice",
          orderId: order.id,
          invoiceId: draft.invoiceId,
          merchantUserId: order.userId,
          invoiceNumber: draft.invoiceNumber,
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency,
              unit_amount: amountDueCents,
              product_data: {
                name: `Invoice ${draft.invoiceNumber}`,
                description: draft.companyName ?? undefined,
              },
            },
          },
        ],
      },
      { stripeAccount: connect.accountId },
    );

    const url = session.url;
    if (!url) return { ok: false, error: "Stripe did not return a checkout URL." };

    const startedAt = new Date().toISOString();
    const connectionId = readConnectionIdFromOrder(order);
    if (connectionId) {
      await recordPayPortalStats({
        connectionId,
        patch: { checkoutStarted: 1 },
        checkoutAt: startedAt,
      });
    }

    const b2b = readKitchenOrderB2bMetadata(order.sourceMetadataJson);
    const root =
      order.sourceMetadataJson && typeof order.sourceMetadataJson === "object"
        ? { ...(order.sourceMetadataJson as Record<string, unknown>) }
        : {};
    root.b2b = appendInvoiceDraftToB2bMetadata(
      (b2b ?? {}) as KitchenOrderB2bMetadata,
      { ...draft, payPortalCheckoutStartedAt: startedAt },
    );
    await prisma.order.update({
      where: { id: order.id },
      data: { sourceMetadataJson: root as Prisma.InputJsonValue },
    });

    return { ok: true, url };
  } catch (e) {
    return { ok: false, error: safeStripeError(e) };
  }
}

export async function applyB2bPayPortalCheckoutCompleted(
  session: Stripe.Checkout.Session,
  opts: { stripeEventId: string },
): Promise<void> {
  if (session.metadata?.purpose !== "b2b_invoice") return;
  const orderId = session.metadata.orderId;
  const invoiceId = session.metadata.invoiceId;
  const merchantUserId = session.metadata.merchantUserId;
  if (!orderId || !invoiceId || !merchantUserId) return;
  if (session.payment_status !== "paid") return;

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: merchantUserId },
    select: {
      id: true,
      userId: true,
      workspaceId: true,
      sourceMetadataJson: true,
      channelTraceJson: true,
      paymentStatus: true,
    },
  });
  if (!order) return;

  const draft = readB2bInvoiceDraftLink(order.sourceMetadataJson);
  if (!draft || draft.invoiceId !== invoiceId) return;
  if (!isB2bInvoiceDraftOpen(draft)) return;

  const paidAmountCents = session.amount_total ?? openB2bInvoiceAmountCents(draft);
  const paymentReference =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.id;

  const result = await markB2bInvoiceDraftPaid({
    userId: merchantUserId,
    workspaceId: order.workspaceId,
    orderId: order.id,
    performedById: B2B_PAY_PORTAL_SYSTEM_ACTOR,
    paidAmountCents,
    paymentReference,
  });

  if (!result.ok) return;

  const connectionId = readConnectionIdFromOrder(order);
  if (connectionId) {
    await recordPayPortalStats({
      connectionId,
      patch: { checkoutCompleted: 1 },
      checkoutAt: new Date().toISOString(),
    });
  }

  await recordBillingEvent({
    userId: merchantUserId,
    workspaceId: order.workspaceId,
    eventType: "B2B_INVOICE_PAY_PORTAL_CHECKOUT_COMPLETED",
    source: "stripe",
    stripeEventId: opts.stripeEventId,
    summary: `B2B pay portal checkout — ${draft.invoiceNumber}`,
    metadata: {
      orderId: order.id,
      invoiceId,
      invoiceNumber: draft.invoiceNumber,
      paidAmountCents,
      stripeSessionId: session.id,
    },
  }).catch(() => undefined);
}

export async function countOpenOverdueB2bInvoicesMissingPayPortal(userId: string): Promise<number> {
  const orders = await prisma.order.findMany({
    where: await orderListWhereForOwnerAnd(userId, { paymentStatus: { not: "PAID" } }),
    select: { sourceMetadataJson: true },
    take: 500,
    orderBy: { createdAt: "desc" },
  });
  const nowMs = Date.now();
  let count = 0;
  for (const order of orders) {
    const draft = readB2bInvoiceDraftLink(order.sourceMetadataJson);
    if (!draft || !isB2bInvoiceDraftOpen(draft)) continue;
    if (!draft.dueAt) continue;
    const dueMs = new Date(draft.dueAt).getTime();
    if (!Number.isFinite(dueMs) || nowMs <= dueMs) continue;
    if (!draft.payPortalIssuedAt) count += 1;
  }
  return count;
}

export async function stampPayPortalOnInvoiceDraftGeneration(input: {
  link: B2bInvoiceDraftLink;
  connectionId: string | null;
}): Promise<B2bInvoiceDraftLink> {
  if (!isShopifyMarketsB2bPayPortalEnabled()) return input.link;

  let portalEnabled = true;
  if (input.connectionId) {
    const conn = await prisma.integrationConnection.findUnique({
      where: { id: input.connectionId },
      select: { settingsJson: true },
    });
    if (conn) {
      const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
      portalEnabled = resolveB2bPayPortalEnabled(sync.b2bPayPortalEnabled);
    }
  }
  if (!portalEnabled) return input.link;

  const issuedAt = new Date().toISOString();
  if (input.connectionId) {
    await recordPayPortalStats({
      connectionId: input.connectionId,
      patch: { linksMinted: 1 },
    });
  }
  return patchInvoiceDraftPayPortalIssued(input.link, issuedAt);
}
