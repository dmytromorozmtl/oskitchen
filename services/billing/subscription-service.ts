import type Stripe from "stripe";
import type { Prisma, SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { invoiceRecordListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";
import {
  dbStatusFromBilling,
  mapStripeSubscriptionStatus,
  type BillingStatusKey,
} from "@/lib/billing/billing-status";
import { ensureBillingCustomer, recordBillingEvent } from "@/services/billing/billing-service";

export type SubscriptionSnapshot = {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  statusDetail: BillingStatusKey;
  billingMode: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  trialStart: Date | null;
  trialEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  cancelledAt: Date | null;
};

export async function loadSubscription(userId: string): Promise<SubscriptionSnapshot> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) {
    return {
      plan: "STARTER",
      status: "TRIALING",
      statusDetail: "NONE",
      billingMode: "STRIPE",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripePriceId: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      trialStart: null,
      trialEnd: null,
      cancelAtPeriodEnd: false,
      cancelledAt: null,
    };
  }
  return {
    plan: sub.plan,
    status: sub.status,
    statusDetail: (sub.statusDetail as BillingStatusKey | null) ?? mapInternal(sub.status),
    billingMode: sub.billingMode,
    stripeCustomerId: sub.stripeCustomerId,
    stripeSubscriptionId: sub.stripeSubscriptionId,
    stripePriceId: sub.stripePriceId,
    currentPeriodStart: sub.currentPeriodStart,
    currentPeriodEnd: sub.currentPeriodEnd,
    trialStart: sub.trialStart,
    trialEnd: sub.trialEnd,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    cancelledAt: sub.cancelledAt,
  };
}

function mapInternal(s: SubscriptionStatus): BillingStatusKey {
  if (s === "ACTIVE") return "ACTIVE";
  if (s === "TRIALING") return "TRIALING";
  if (s === "PAST_DUE") return "PAST_DUE";
  return "CANCELLED";
}

function dateOrNull(secs: number | null | undefined): Date | null {
  return typeof secs === "number" && secs > 0 ? new Date(secs * 1000) : null;
}

/**
 * Apply a verified Stripe Subscription object to local state. Idempotent —
 * safe to call from webhook or sync action. Returns the resulting plan.
 */
export async function applyStripeSubscription(
  subscription: Stripe.Subscription,
  options: { stripeEventId?: string | null; userIdHint?: string | null } = {},
): Promise<{ userId: string | null }> {
  const userId =
    options.userIdHint ??
    (subscription.metadata?.userId as string | undefined) ??
    null;
  if (!userId) return { userId: null };

  const planMeta = subscription.metadata?.plan as
    | SubscriptionPlan
    | undefined;

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id ?? null;

  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.id ?? null;
  const workspaceId = await ensureOwnerWorkspaceId(userId);

  const detail = mapStripeSubscriptionStatus(subscription.status);
  const dbStatus = dbStatusFromBilling(detail);

  // Cast to avoid TS errors when Stripe types omit period fields.
  const sub = subscription as unknown as {
    current_period_start?: number;
    current_period_end?: number;
    trial_start?: number | null;
    trial_end?: number | null;
    cancel_at_period_end?: boolean;
    canceled_at?: number | null;
  };

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      workspaceId,
      plan: planMeta ?? "STARTER",
      status: dbStatus,
      statusDetail: detail,
      stripeCustomerId: customerId ?? undefined,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId ?? undefined,
      currentPeriodStart: dateOrNull(sub.current_period_start),
      currentPeriodEnd: dateOrNull(sub.current_period_end),
      trialStart: dateOrNull(sub.trial_start),
      trialEnd: dateOrNull(sub.trial_end),
      cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
      cancelledAt: dateOrNull(sub.canceled_at),
    },
    update: {
      workspaceId,
      status: dbStatus,
      statusDetail: detail,
      stripeCustomerId: customerId ?? undefined,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId ?? undefined,
      currentPeriodStart: dateOrNull(sub.current_period_start),
      currentPeriodEnd: dateOrNull(sub.current_period_end),
      trialStart: dateOrNull(sub.trial_start),
      trialEnd: dateOrNull(sub.trial_end),
      cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
      cancelledAt: dateOrNull(sub.canceled_at),
      ...(planMeta ? { plan: planMeta } : {}),
    },
  });

  if (customerId) {
    await ensureBillingCustomer({
      userId,
      workspaceId,
      stripeCustomerId: customerId,
      billingEmail: subscription.metadata?.email as string | undefined,
    });
  }

  await recordBillingEvent({
    userId,
    eventType: "STRIPE_SUBSCRIPTION_SYNCED",
    source: "stripe",
    stripeEventId: options.stripeEventId ?? null,
    summary: `${planMeta ?? "—"} · ${detail}`,
    metadata: {
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
    },
  });

  return { userId };
}

export async function applyStripeCheckoutCompleted(
  session: Stripe.Checkout.Session,
  options: { stripeEventId?: string | null } = {},
): Promise<void> {
  const userId = session.metadata?.userId as string | undefined;
  if (!userId) return;
  const workspaceId = await ensureOwnerWorkspaceId(userId);
  const planMeta = session.metadata?.plan as SubscriptionPlan | undefined;
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      workspaceId,
      plan: planMeta ?? "STARTER",
      status: "ACTIVE",
      statusDetail: "ACTIVE",
      stripeCustomerId: customerId ?? undefined,
      stripeSubscriptionId: subscriptionId ?? undefined,
    },
    update: {
      workspaceId,
      stripeCustomerId: customerId ?? undefined,
      stripeSubscriptionId: subscriptionId ?? undefined,
      ...(planMeta ? { plan: planMeta } : {}),
      status: "ACTIVE",
      statusDetail: "ACTIVE",
    },
  });
  await recordBillingEvent({
    userId,
    eventType: "STRIPE_CHECKOUT_COMPLETED",
    source: "stripe",
    stripeEventId: options.stripeEventId ?? null,
    summary: planMeta ? `Checkout completed for ${planMeta}` : "Checkout completed",
    metadata: { checkoutSessionId: session.id },
  });
}

export async function applyStripeInvoice(invoice: Stripe.Invoice, options: { stripeEventId?: string | null } = {}) {
  const customerId =
    typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id ?? null;
  if (!customerId) return;
  const customer = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
    select: { userId: true },
  });
  if (!customer) return;
  const userId = customer.userId;
  const workspaceId = await ensureOwnerWorkspaceId(userId);

  const statusMap: Record<string, "DRAFT" | "OPEN" | "PAID" | "UNCOLLECTIBLE" | "VOID" | "PENDING"> = {
    draft: "DRAFT",
    open: "OPEN",
    paid: "PAID",
    uncollectible: "UNCOLLECTIBLE",
    void: "VOID",
  };
  const stat = statusMap[invoice.status ?? ""] ?? "PENDING";

  await prisma.invoiceRecord.upsert({
    where: { stripeInvoiceId: invoice.id },
    create: {
      userId,
      workspaceId,
      stripeInvoiceId: invoice.id ?? undefined,
      number: invoice.number ?? undefined,
      status: stat,
      amountDueCents: invoice.amount_due ?? 0,
      amountPaidCents: invoice.amount_paid ?? 0,
      currency: invoice.currency ?? "usd",
      hostedInvoiceUrl: invoice.hosted_invoice_url ?? undefined,
      invoicePdfUrl: invoice.invoice_pdf ?? undefined,
      issuedAt: invoice.created ? new Date(invoice.created * 1000) : undefined,
      paidAt: invoice.status_transitions?.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : undefined,
    },
    update: {
      workspaceId,
      number: invoice.number ?? undefined,
      status: stat,
      amountDueCents: invoice.amount_due ?? 0,
      amountPaidCents: invoice.amount_paid ?? 0,
      hostedInvoiceUrl: invoice.hosted_invoice_url ?? undefined,
      invoicePdfUrl: invoice.invoice_pdf ?? undefined,
      paidAt: invoice.status_transitions?.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000)
        : undefined,
    },
  });
  await recordBillingEvent({
    userId,
    eventType: `STRIPE_INVOICE_${stat}`,
    source: "stripe",
    stripeEventId: options.stripeEventId ?? null,
    summary: invoice.number ? `Invoice ${invoice.number}` : "Stripe invoice",
    metadata: { stripeInvoiceId: invoice.id },
  });
}

export async function listInvoices(userId: string) {
  return prisma.invoiceRecord.findMany({
    where: await invoiceRecordListWhereForOwner(userId),
    orderBy: [{ issuedAt: "desc" }, { createdAt: "desc" }],
    take: 100,
  });
}

export type SubscriptionAdminUpdate = {
  userId: string;
  performedById?: string | null;
  plan?: SubscriptionPlan | null;
  billingMode?: "STRIPE" | "MANUAL" | "INTERNAL_FREE" | "ENTERPRISE_CONTRACT" | "DEV_DISABLED" | null;
  statusDetail?: BillingStatusKey | null;
};

/** Superadmin/owner-only path to override plan + mode without Stripe. */
export async function adminAssignPlan(input: SubscriptionAdminUpdate) {
  const workspaceId = await ensureOwnerWorkspaceId(input.userId);
  const data: Prisma.SubscriptionUpdateInput = {};
  if (input.plan) data.plan = input.plan;
  if (input.billingMode) data.billingMode = input.billingMode;
  data.workspace = { connect: { id: workspaceId } };
  if (input.statusDetail) {
    data.statusDetail = input.statusDetail;
    data.status = dbStatusFromBilling(input.statusDetail);
  }

  await prisma.subscription.upsert({
    where: { userId: input.userId },
    create: {
      userId: input.userId,
      workspaceId,
      plan: input.plan ?? "STARTER",
      billingMode: input.billingMode ?? "MANUAL",
      status: input.statusDetail ? dbStatusFromBilling(input.statusDetail) : "ACTIVE",
      statusDetail: input.statusDetail ?? "INTERNAL",
    },
    update: data,
  });
  await recordBillingEvent({
    userId: input.userId,
    eventType: "ADMIN_ASSIGN_PLAN",
    source: "admin",
    performedById: input.performedById ?? null,
    summary: `Plan=${input.plan ?? "—"} mode=${input.billingMode ?? "—"} status=${input.statusDetail ?? "—"}`,
  });
}
