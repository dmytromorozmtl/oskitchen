import type Stripe from "stripe";
import { type Prisma } from "@prisma/client";

import {
  B2B_CONSOLIDATED_PAY_MAX_INVOICES,
  B2B_CONSOLIDATED_PAY_MIN_INVOICES,
  isShopifyMarketsB2bConsolidatedPayEnabled,
  resolveB2bConsolidatedPayEnabled,
  resolveB2bConsolidatedPayTokenTtlDays,
  SHOPIFY_MARKET_B2B_CONSOLIDATED_PAY_HONESTY,
} from "@/lib/commercial/shopify-market-b2b-consolidated-pay";
import {
  B2B_PAY_PORTAL_SYSTEM_ACTOR,
  isShopifyMarketsB2bPayPortalEnabled,
} from "@/lib/commercial/shopify-market-b2b-pay-portal";
import { getStripeClient, safeStripeError } from "@/lib/billing/stripe-client";
import { SITE_URL } from "@/lib/constants";
import {
  appendInvoiceDraftToB2bMetadata,
  isB2bInvoiceDraftOpen,
  openB2bInvoiceAmountCents,
  patchInvoiceDraftPayPortalIssued,
  readB2bInvoiceDraftLink,
} from "@/lib/integrations/shopify-b2b-invoice-draft-metadata";
import type {
  B2bConsolidatedPayBatch,
  B2bConsolidatedPayLine,
  B2bConsolidatedPayStats,
  B2bConsolidatedPayView,
} from "@/lib/integrations/shopify-b2b-consolidated-pay-metadata";
import {
  countStaleConsolidatedPayCheckouts,
  incrementB2bConsolidatedPayStats,
  patchConsolidatedPayBatchCheckoutCompleted,
  patchConsolidatedPayBatchCheckoutStarted,
  upsertB2bConsolidatedPayBatch,
} from "@/lib/integrations/shopify-b2b-consolidated-pay-metadata";
import {
  buildB2bConsolidatedPayUrl,
  mintB2bConsolidatedPayBatchId,
  mintB2bConsolidatedPayToken,
  verifyB2bConsolidatedPayToken,
} from "@/lib/integrations/shopify-b2b-consolidated-pay-token";
import {
  readKitchenOrderB2bMetadata,
  type KitchenOrderB2bMetadata,
} from "@/lib/integrations/shopify-b2b-kitchen-order-metadata";
import {
  mergeShopifyMarketsSyncSettings,
  parseShopifyMarketsSyncSettings,
} from "@/lib/integrations/shopify-markets-settings";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { recordBillingEvent } from "@/services/billing/billing-service";
import { markB2bInvoiceDraftPaid } from "@/services/integrations/shopify-b2b-invoice-payment-service";

export type { B2bConsolidatedPayView } from "@/lib/integrations/shopify-b2b-consolidated-pay-metadata";
export { SHOPIFY_MARKET_B2B_CONSOLIDATED_PAY_HONESTY };

type LoadedBatchLine = {
  order: {
    id: string;
    userId: string;
    workspaceId: string | null;
    paymentStatus: string | null;
    sourceMetadataJson: unknown;
    channelTraceJson: unknown;
  };
  draft: NonNullable<ReturnType<typeof readB2bInvoiceDraftLink>>;
};

async function recordConsolidatedPayStats(input: {
  connectionId: string | null;
  patch: Partial<B2bConsolidatedPayStats>;
  batches?: Record<string, B2bConsolidatedPayBatch>;
  checkoutAt?: string;
}) {
  if (!input.connectionId) return;
  const conn = await prisma.integrationConnection.findUnique({
    where: { id: input.connectionId },
    select: { settingsJson: true },
  });
  if (!conn) return;

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const staleCount = countStaleConsolidatedPayCheckouts(
    input.batches ?? sync.b2bConsolidatedPayBatches,
  );
  const nextStats = incrementB2bConsolidatedPayStats(sync.b2bConsolidatedPayStats, {
    ...input.patch,
    staleCheckoutOpen: staleCount,
  });

  await prisma.integrationConnection.update({
    where: { id: input.connectionId },
    data: {
      settingsJson: mergeShopifyMarketsSyncSettings(conn.settingsJson, {
        b2bConsolidatedPayStats: nextStats,
        ...(input.batches ? { b2bConsolidatedPayBatches: input.batches } : {}),
        ...(input.checkoutAt ? { lastB2bConsolidatedPayCheckoutAt: input.checkoutAt } : {}),
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

async function loadConsolidatedPayBatch(token: string): Promise<{
  payload: ReturnType<typeof verifyB2bConsolidatedPayToken>;
  lines: LoadedBatchLine[];
  batch: B2bConsolidatedPayBatch | null;
  connectionId: string | null;
} | null> {
  if (!isShopifyMarketsB2bConsolidatedPayEnabled() || !isShopifyMarketsB2bPayPortalEnabled()) {
    return null;
  }

  const payload = verifyB2bConsolidatedPayToken(token);
  if (!payload) return null;

  const orders = await prisma.order.findMany({
    where: { id: { in: payload.orderIds }, userId: payload.userId },
    select: {
      id: true,
      userId: true,
      workspaceId: true,
      paymentStatus: true,
      sourceMetadataJson: true,
      channelTraceJson: true,
    },
  });

  const lines: LoadedBatchLine[] = [];
  for (const orderId of payload.orderIds) {
    const order = orders.find((row) => row.id === orderId);
    if (!order) continue;
    const draft = readB2bInvoiceDraftLink(order.sourceMetadataJson);
    if (!draft) continue;
    lines.push({ order, draft });
  }
  if (lines.length === 0) return null;

  const connectionId = readConnectionIdFromOrder(lines[0]!.order);
  let batch: B2bConsolidatedPayBatch | null = null;
  if (connectionId) {
    const conn = await prisma.integrationConnection.findUnique({
      where: { id: connectionId },
      select: { settingsJson: true },
    });
    if (conn) {
      const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
      batch = sync.b2bConsolidatedPayBatches?.[payload.batchId] ?? null;
    }
  }

  return { payload, lines, batch, connectionId };
}

function buildBatchAchInstructions(input: {
  businessName: string;
  totalLabel: string;
  invoiceNumbers: string[];
}): string {
  const refs = input.invoiceNumbers.slice(0, 5).join(", ");
  const suffix = input.invoiceNumbers.length > 5 ? ` (+${input.invoiceNumbers.length - 5} more)` : "";
  return `Send ${input.totalLabel} to ${input.businessName}. Reference invoice(s): ${refs}${suffix}. Reply once sent so we can reconcile your account.`;
}

export async function mintB2bConsolidatedPayLink(input: {
  userId: string;
  orderIds: string[];
  connectionId?: string | null;
}): Promise<
  | { ok: true; url: string; token: string; batchId: string; invoiceCount: number }
  | { ok: false; reason: string }
> {
  if (!isShopifyMarketsB2bConsolidatedPayEnabled() || !isShopifyMarketsB2bPayPortalEnabled()) {
    return { ok: false, reason: "consolidated_pay_disabled" };
  }

  const unique = [...new Set(input.orderIds)].slice(0, B2B_CONSOLIDATED_PAY_MAX_INVOICES);
  if (unique.length < B2B_CONSOLIDATED_PAY_MIN_INVOICES) {
    return { ok: false, reason: "too_few_invoices" };
  }

  const orders = await prisma.order.findMany({
    where: { id: { in: unique }, userId: input.userId },
    select: {
      id: true,
      userId: true,
      workspaceId: true,
      sourceMetadataJson: true,
      channelTraceJson: true,
      paymentStatus: true,
    },
  });

  const loaded: LoadedBatchLine[] = [];
  for (const orderId of unique) {
    const order = orders.find((row) => row.id === orderId);
    if (!order) continue;
    const draft = readB2bInvoiceDraftLink(order.sourceMetadataJson);
    if (!draft || !isB2bInvoiceDraftOpen(draft)) continue;
    loaded.push({ order, draft });
  }

  if (loaded.length < B2B_CONSOLIDATED_PAY_MIN_INVOICES) {
    return { ok: false, reason: "not_enough_open_invoices" };
  }

  const currencies = new Set(loaded.map((line) => line.draft.currency.toLowerCase()));
  if (currencies.size !== 1) {
    const connectionId =
      input.connectionId ?? readConnectionIdFromOrder(loaded[0]!.order);
    if (connectionId) {
      await recordConsolidatedPayStats({
        connectionId,
        patch: { skippedMixedCurrency: 1 },
      });
    }
    return { ok: false, reason: "mixed_currency" };
  }

  const currency = loaded[0]!.draft.currency.toLowerCase();
  const totalAmountCents = loaded.reduce(
    (sum, line) => sum + openB2bInvoiceAmountCents(line.draft),
    0,
  );
  if (totalAmountCents < 50) {
    return { ok: false, reason: "amount_too_small" };
  }

  const connectionId =
    input.connectionId ?? readConnectionIdFromOrder(loaded[0]!.order);
  let consolidatedEnabled = true;
  let ttlDays = resolveB2bConsolidatedPayTokenTtlDays(null);
  if (connectionId) {
    const conn = await prisma.integrationConnection.findUnique({
      where: { id: connectionId },
      select: { settingsJson: true },
    });
    if (conn) {
      const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
      consolidatedEnabled = resolveB2bConsolidatedPayEnabled(sync.b2bConsolidatedPayEnabled);
      ttlDays = resolveB2bConsolidatedPayTokenTtlDays(sync.b2bConsolidatedPayTokenTtlDays);
    }
  }
  if (!consolidatedEnabled) return { ok: false, reason: "consolidated_disabled" };

  const mintedAt = new Date().toISOString();
  const batchId = mintB2bConsolidatedPayBatchId();
  const orderIds = loaded.map((line) => line.order.id);
  const invoiceIds = loaded.map((line) => line.draft.invoiceId);
  const invoiceNumbers = loaded.map((line) => line.draft.invoiceNumber);
  const companyName = loaded[0]!.draft.companyName ?? null;

  for (const line of loaded) {
    if (line.draft.payPortalIssuedAt) continue;
    const b2b = readKitchenOrderB2bMetadata(line.order.sourceMetadataJson);
    const root =
      line.order.sourceMetadataJson && typeof line.order.sourceMetadataJson === "object"
        ? { ...(line.order.sourceMetadataJson as Record<string, unknown>) }
        : {};
    root.b2b = appendInvoiceDraftToB2bMetadata(
      (b2b ?? {}) as KitchenOrderB2bMetadata,
      patchInvoiceDraftPayPortalIssued(line.draft, mintedAt),
    );
    await prisma.order.update({
      where: { id: line.order.id },
      data: { sourceMetadataJson: root as Prisma.InputJsonValue },
    });
  }

  const batch: B2bConsolidatedPayBatch = {
    batchId,
    orderIds,
    invoiceIds,
    invoiceNumbers,
    totalAmountCents,
    currency,
    companyName,
    mintedAt,
    checkoutStartedAt: null,
    checkoutCompletedAt: null,
  };

  const token = mintB2bConsolidatedPayToken({
    batchId,
    orderIds,
    userId: input.userId,
    ttlDays,
  });

  if (connectionId) {
    const conn = await prisma.integrationConnection.findUnique({
      where: { id: connectionId },
      select: { settingsJson: true },
    });
    const sync = parseShopifyMarketsSyncSettings(conn?.settingsJson);
    const batches = upsertB2bConsolidatedPayBatch(sync.b2bConsolidatedPayBatches, batch);
    await recordConsolidatedPayStats({
      connectionId,
      patch: { batchesMinted: 1 },
      batches,
    });
  }

  return {
    ok: true,
    url: buildB2bConsolidatedPayUrl(token, SITE_URL),
    token,
    batchId,
    invoiceCount: loaded.length,
  };
}

export async function resolveB2bConsolidatedPayView(token: string): Promise<B2bConsolidatedPayView | null> {
  const loaded = await loadConsolidatedPayBatch(token);
  if (!loaded?.payload) return null;

  const lines: B2bConsolidatedPayLine[] = loaded.lines.map(({ order, draft }) => ({
    orderId: order.id,
    invoiceId: draft.invoiceId,
    invoiceNumber: draft.invoiceNumber,
    companyName: draft.companyName,
    amountDueCents: openB2bInvoiceAmountCents(draft),
    currency: draft.currency,
    dueAt: draft.dueAt,
    status: draft.status,
  }));

  const openLines = lines.filter((line) => line.amountDueCents > 0 && line.status !== "paid");
  const allPaid = openLines.length === 0;
  const totalAmountCents = openLines.reduce((sum, line) => sum + line.amountDueCents, 0);
  const currency = lines[0]?.currency ?? "usd";
  const totalAmountLabel = formatCurrency(totalAmountCents / 100);

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: loaded.payload.userId },
    select: { businessName: true },
  });
  const businessName = kitchen?.businessName?.trim() || "OS Kitchen";
  const connect = await resolveMerchantStripeConnect(loaded.payload.userId);
  const stripeCheckoutAvailable =
    !allPaid &&
    totalAmountCents >= 50 &&
    Boolean(getStripeClient()) &&
    connect.chargesEnabled;

  return {
    businessName,
    batchId: loaded.payload.batchId,
    invoiceCount: lines.length,
    totalAmountCents,
    currency,
    totalAmountLabel,
    lines,
    stripeCheckoutAvailable,
    achInstructions: buildBatchAchInstructions({
      businessName,
      totalLabel: totalAmountLabel,
      invoiceNumbers: lines.map((line) => line.invoiceNumber),
    }),
    honesty: SHOPIFY_MARKET_B2B_CONSOLIDATED_PAY_HONESTY,
    allPaid,
    companyName: loaded.batch?.companyName ?? lines[0]?.companyName ?? null,
  };
}

export async function createB2bConsolidatedPayCheckoutSession(
  token: string,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const loaded = await loadConsolidatedPayBatch(token);
  if (!loaded?.payload) return { ok: false, error: "Invalid or expired pay link." };

  const openLines = loaded.lines.filter(
    ({ draft }) => isB2bInvoiceDraftOpen(draft) && openB2bInvoiceAmountCents(draft) >= 50,
  );
  if (openLines.length < B2B_CONSOLIDATED_PAY_MIN_INVOICES) {
    return { ok: false, error: "These invoices are already paid or unavailable." };
  }

  const currencies = new Set(openLines.map(({ draft }) => draft.currency.toLowerCase()));
  if (currencies.size !== 1) {
    return { ok: false, error: "Invoices use mixed currencies and cannot be paid together." };
  }

  const totalAmountCents = openLines.reduce(
    (sum, { draft }) => sum + openB2bInvoiceAmountCents(draft),
    0,
  );
  if (totalAmountCents < 50) {
    return { ok: false, error: "Total amount is too small for card checkout." };
  }

  const stripe = getStripeClient();
  if (!stripe) return { ok: false, error: "Card checkout is not available right now." };

  const merchantUserId = loaded.payload.userId;
  const connect = await resolveMerchantStripeConnect(merchantUserId);
  if (!connect.accountId || !connect.chargesEnabled) {
    if (loaded.connectionId) {
      await recordConsolidatedPayStats({
        connectionId: loaded.connectionId,
        patch: { skippedAlreadyPaid: 0 },
      });
    }
    return { ok: false, error: "Card checkout is not configured for this kitchen." };
  }

  const currency = openLines[0]!.draft.currency.toLowerCase();
  const successUrl = `${SITE_URL}/pay/b2b/batch/${encodeURIComponent(token)}?paid=1`;
  const cancelUrl = `${SITE_URL}/pay/b2b/batch/${encodeURIComponent(token)}?canceled=1`;

  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        client_reference_id: loaded.payload.batchId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          purpose: "b2b_invoice_batch",
          batchId: loaded.payload.batchId,
          merchantUserId,
          orderCount: String(openLines.length),
        },
        line_items: openLines.map(({ draft }) => ({
          quantity: 1,
          price_data: {
            currency,
            unit_amount: openB2bInvoiceAmountCents(draft),
            product_data: {
              name: `Invoice ${draft.invoiceNumber}`,
              description: draft.companyName ?? undefined,
            },
          },
        })),
      },
      { stripeAccount: connect.accountId },
    );

    const url = session.url;
    if (!url) return { ok: false, error: "Stripe did not return a checkout URL." };

    const startedAt = new Date().toISOString();
    if (loaded.connectionId && loaded.batch) {
      const conn = await prisma.integrationConnection.findUnique({
        where: { id: loaded.connectionId },
        select: { settingsJson: true },
      });
      const sync = parseShopifyMarketsSyncSettings(conn?.settingsJson);
      const batches = upsertB2bConsolidatedPayBatch(
        sync.b2bConsolidatedPayBatches,
        patchConsolidatedPayBatchCheckoutStarted(loaded.batch, startedAt),
      );
      await recordConsolidatedPayStats({
        connectionId: loaded.connectionId,
        patch: { checkoutStarted: 1 },
        batches,
        checkoutAt: startedAt,
      });
    }

    for (const { order, draft } of openLines) {
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
    }

    return { ok: true, url };
  } catch (e) {
    return { ok: false, error: safeStripeError(e) };
  }
}

export async function applyB2bConsolidatedPayCheckoutCompleted(
  session: Stripe.Checkout.Session,
  opts: { stripeEventId: string },
): Promise<void> {
  if (session.metadata?.purpose !== "b2b_invoice_batch") return;
  const batchId = session.metadata.batchId;
  const merchantUserId = session.metadata.merchantUserId;
  if (!batchId || !merchantUserId) return;
  if (session.payment_status !== "paid") return;

  const conn = await prisma.integrationConnection.findFirst({
    where: { userId: merchantUserId, provider: "SHOPIFY" },
    select: { id: true, settingsJson: true },
  });
  const sync = parseShopifyMarketsSyncSettings(conn?.settingsJson);
  const batch = sync.b2bConsolidatedPayBatches?.[batchId];
  if (!batch) return;

  const orders = await prisma.order.findMany({
    where: { id: { in: batch.orderIds }, userId: merchantUserId },
    select: {
      id: true,
      userId: true,
      workspaceId: true,
      sourceMetadataJson: true,
      paymentStatus: true,
    },
  });

  const completedAt = new Date().toISOString();
  let marked = 0;

  for (const orderId of batch.orderIds) {
    const order = orders.find((row) => row.id === orderId);
    if (!order) continue;
    const draft = readB2bInvoiceDraftLink(order.sourceMetadataJson);
    if (!draft || !isB2bInvoiceDraftOpen(draft)) continue;

    const paidAmountCents = openB2bInvoiceAmountCents(draft);
    const result = await markB2bInvoiceDraftPaid({
      userId: merchantUserId,
      workspaceId: order.workspaceId,
      orderId: order.id,
      performedById: B2B_PAY_PORTAL_SYSTEM_ACTOR,
      paidAmountCents,
      paymentReference:
        typeof session.payment_intent === "string"
          ? `${session.payment_intent}:${batchId}`
          : `${session.id}:${batchId}`,
    });
    if (result.ok) marked += 1;
  }

  if (marked === 0) return;

  if (conn) {
    const batches = upsertB2bConsolidatedPayBatch(
      sync.b2bConsolidatedPayBatches,
      patchConsolidatedPayBatchCheckoutCompleted(batch, completedAt),
    );
    await recordConsolidatedPayStats({
      connectionId: conn.id,
      patch: { checkoutCompleted: 1 },
      batches,
      checkoutAt: completedAt,
    });
  }

  await recordBillingEvent({
    userId: merchantUserId,
    workspaceId: orders[0]?.workspaceId ?? null,
    eventType: "B2B_CONSOLIDATED_PAY_CHECKOUT_COMPLETED",
    source: "stripe",
    stripeEventId: opts.stripeEventId,
    summary: `B2B consolidated pay — ${marked} invoice(s)`,
    metadata: {
      batchId,
      marked,
      totalAmountCents: session.amount_total,
      stripeSessionId: session.id,
    },
  }).catch(() => undefined);
}

export async function refreshB2bConsolidatedPayStaleStats(connectionId: string): Promise<number> {
  const conn = await prisma.integrationConnection.findUnique({
    where: { id: connectionId },
    select: { settingsJson: true },
  });
  if (!conn) return 0;

  const sync = parseShopifyMarketsSyncSettings(conn.settingsJson);
  const stale = countStaleConsolidatedPayCheckouts(sync.b2bConsolidatedPayBatches);
  await recordConsolidatedPayStats({
    connectionId,
    patch: { staleCheckoutOpen: stale },
  });
  return stale;
}

export async function bulkMintB2bConsolidatedPayLink(input: {
  userId: string;
  orderIds: string[];
}): Promise<
  | { ok: true; url: string; batchId: string; invoiceCount: number }
  | { ok: false; reason: string; errors: string[] }
> {
  const ctx = await prisma.integrationConnection.findFirst({
    where: { userId: input.userId, provider: "SHOPIFY" },
    select: { id: true },
  });

  const result = await mintB2bConsolidatedPayLink({
    userId: input.userId,
    orderIds: input.orderIds,
    connectionId: ctx?.id ?? null,
  });

  if (!result.ok) {
    return { ok: false, reason: result.reason, errors: [result.reason] };
  }

  return {
    ok: true,
    url: result.url,
    batchId: result.batchId,
    invoiceCount: result.invoiceCount,
  };
}
