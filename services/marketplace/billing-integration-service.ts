import { randomUUID } from "crypto";

import { getStripeClient, safeStripeError } from "@/lib/billing/stripe-client";
import {
  buildVendorInvoiceLines,
  calculatePlanUpgradeProration,
  commissionRateForPlan,
  currentBillingPeriod,
  defaultMarketplaceVendorBillingDocument,
  mergeMarketplaceBillingIntoDocuments,
  parseMarketplaceVendorBillingDocument,
  round2,
  sumInvoiceLines,
  VENDOR_PLAN_MONTHLY_FEE_USD,
  VENDOR_PLAN_ORDER,
  type MarketplaceVendorBillingDocument,
  type MarketplaceVendorInvoice,
} from "@/lib/marketplace/billing-integration-types";
import { extractRegistrationMeta, parseVendorDocuments } from "@/lib/marketplace/vendor-registration-types";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import { auditLog } from "@/services/audit/audit-service";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import type { VendorPlanTier } from "@prisma/client";

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function toMinorUnits(amountUsd: number): number {
  return Math.max(0, Math.round(amountUsd * 100));
}

async function loadVendorBillingContext(vendorId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: {
      id: true,
      companyName: true,
      legalName: true,
      planTier: true,
      commissionRate: true,
      stripeAccountId: true,
      workspaceId: true,
      documents: true,
    },
  });
  if (!vendor) return null;

  const billing = parseMarketplaceVendorBillingDocument(vendor.documents, vendor.planTier);
  return { vendor, billing };
}

async function persistVendorBilling(vendorId: string, billing: MarketplaceVendorBillingDocument): Promise<void> {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { documents: true },
  });
  if (!vendor) throw new Error("Vendor not found.");

  const nextDocuments = mergeMarketplaceBillingIntoDocuments(vendor.documents, {
    ...billing,
    updatedAt: new Date().toISOString(),
  });

  await prisma.vendor.update({
    where: { id: vendorId },
    data: { documents: toInputJsonValue(nextDocuments) },
  });
}

async function ensureStripeCustomer(input: {
  vendorId: string;
  companyName: string;
  billing: MarketplaceVendorBillingDocument;
  contactEmail?: string | null;
}): Promise<string | null> {
  if (input.billing.subscription.stripeCustomerId) {
    return input.billing.subscription.stripeCustomerId;
  }

  const stripe = getStripeClient();
  if (!stripe) return null;

  try {
    const customer = await stripe.customers.create({
      name: input.companyName,
      email: input.contactEmail ?? undefined,
      metadata: { kitchenosVendorId: input.vendorId, purpose: "marketplace_vendor_saas" },
    });
    return customer.id;
  } catch (error) {
    logger.error("[marketplace-billing] ensureStripeCustomer failed", error);
    return null;
  }
}

export async function createVendorSubscription(
  vendorId: string,
  planTier: VendorPlanTier,
): Promise<
  | { ok: true; subscription: MarketplaceVendorBillingDocument["subscription"] }
  | { ok: false; error: string }
> {
  const context = await loadVendorBillingContext(vendorId);
  if (!context) return { ok: false, error: "Vendor not found." };

  const { vendor, billing } = context;
  const docs = parseVendorDocuments(vendor.documents);
  const meta = extractRegistrationMeta(docs);
  const { start, end } = currentBillingPeriod();
  const now = new Date().toISOString();

  let stripeCustomerId = billing.subscription.stripeCustomerId;
  if (planTier !== "FREE") {
    stripeCustomerId = await ensureStripeCustomer({
      vendorId,
      companyName: vendor.companyName,
      billing,
      contactEmail: meta.contactEmail,
    });
  }

  const nextBilling: MarketplaceVendorBillingDocument = {
    ...billing,
    subscription: {
      planTier,
      status: "active",
      stripeCustomerId,
      stripeSubscriptionId: billing.subscription.stripeSubscriptionId,
      currentPeriodStart: start.toISOString(),
      currentPeriodEnd: end.toISOString(),
      monthlyFeeUsd: VENDOR_PLAN_MONTHLY_FEE_USD[planTier],
      createdAt: billing.subscription.createdAt || now,
      updatedAt: now,
    },
    updatedAt: now,
  };

  await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      planTier,
      commissionRate: commissionRateForPlan(planTier),
    },
  });

  await persistVendorBilling(vendorId, nextBilling);

  await auditLog({
    workspaceId: vendor.workspaceId,
    actor: { userId: null, email: null, role: "SYSTEM" },
    action: AUDIT_ACTIONS.BILLING_PLAN_CHANGED,
    category: "BILLING",
    source: "SYSTEM",
    severity: "INFO",
    entity: { type: "MarketplaceVendorSubscription", id: vendorId, label: vendor.companyName },
    metadata: {
      operation: "marketplace.billing.create_subscription",
      planTier,
      stripeCustomerId,
    },
  }).catch(() => undefined);

  return { ok: true, subscription: nextBilling.subscription };
}

export async function generateVendorInvoice(input: {
  vendorId: string;
  periodStart?: Date;
  periodEnd?: Date;
  prorationUsd?: number;
}): Promise<
  | { ok: true; invoice: MarketplaceVendorInvoice }
  | { ok: false; error: string }
> {
  const context = await loadVendorBillingContext(input.vendorId);
  if (!context) return { ok: false, error: "Vendor not found." };

  const { vendor, billing } = context;
  const period = input.periodStart && input.periodEnd
    ? { start: input.periodStart, end: input.periodEnd }
    : currentBillingPeriod();

  const commissionAgg = await prisma.vendorTransaction.aggregate({
    where: {
      vendorId: vendor.id,
      createdAt: { gte: period.start, lte: period.end },
    },
    _sum: { commissionAmount: true },
  });

  const commissionTotalUsd = round2(decimalToNumber(commissionAgg._sum.commissionAmount));
  const lines = buildVendorInvoiceLines({
    planTier: vendor.planTier,
    commissionTotalUsd,
    prorationUsd: input.prorationUsd,
  });
  const totalUsd = sumInvoiceLines(lines);

  const invoice: MarketplaceVendorInvoice = {
    id: randomUUID(),
    vendorId: vendor.id,
    periodStart: period.start.toISOString(),
    periodEnd: period.end.toISOString(),
    planTier: vendor.planTier,
    lines,
    subtotalUsd: totalUsd,
    totalUsd,
    status: totalUsd > 0 ? "open" : "paid",
    stripeInvoiceId: null,
    paidAt: totalUsd > 0 ? null : new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  const nextBilling: MarketplaceVendorBillingDocument = {
    ...billing,
    invoices: [invoice, ...billing.invoices].slice(0, 36),
    updatedAt: new Date().toISOString(),
  };

  await persistVendorBilling(vendor.id, nextBilling);

  return { ok: true, invoice };
}

export async function chargeVendorSubscription(
  vendorId: string,
  invoiceId: string,
): Promise<
  | { ok: true; invoice: MarketplaceVendorInvoice; stripeInvoiceId: string | null }
  | { ok: false; error: string }
> {
  const context = await loadVendorBillingContext(vendorId);
  if (!context) return { ok: false, error: "Vendor not found." };

  const { vendor, billing } = context;
  const invoiceIndex = billing.invoices.findIndex((row) => row.id === invoiceId);
  if (invoiceIndex < 0) return { ok: false, error: "Invoice not found." };

  const invoice = billing.invoices[invoiceIndex];
  if (invoice.status === "paid") {
    return { ok: true, invoice, stripeInvoiceId: invoice.stripeInvoiceId };
  }
  if (invoice.totalUsd <= 0) {
    const paid: MarketplaceVendorInvoice = {
      ...invoice,
      status: "paid",
      paidAt: new Date().toISOString(),
    };
    billing.invoices[invoiceIndex] = paid;
    await persistVendorBilling(vendorId, billing);
    return { ok: true, invoice: paid, stripeInvoiceId: null };
  }

  const stripe = getStripeClient();
  const customerId = billing.subscription.stripeCustomerId;

  if (stripe && customerId) {
    try {
      for (const line of invoice.lines) {
        await stripe.invoiceItems.create({
          customer: customerId,
          amount: toMinorUnits(line.amountUsd),
          currency: "usd",
          description: line.description,
          metadata: {
            kitchenosVendorId: vendorId,
            kitchenosInvoiceId: invoice.id,
            lineKind: line.kind,
          },
        });
      }

      const stripeInvoice = await stripe.invoices.create({
        customer: customerId,
        auto_advance: true,
        collection_method: "charge_automatically",
        metadata: {
          kitchenosVendorId: vendorId,
          kitchenosInvoiceId: invoice.id,
          purpose: "marketplace_vendor_billing",
        },
      });

      const finalized = stripeInvoice.id
        ? await stripe.invoices.finalizeInvoice(stripeInvoice.id)
        : stripeInvoice;
      const paidInvoice = finalized.id ? await stripe.invoices.pay(finalized.id) : finalized;

      const next: MarketplaceVendorInvoice = {
        ...invoice,
        status: paidInvoice.status === "paid" ? "paid" : "open",
        stripeInvoiceId: paidInvoice.id ?? null,
        paidAt: paidInvoice.status === "paid" ? new Date().toISOString() : null,
      };
      billing.invoices[invoiceIndex] = next;
      await persistVendorBilling(vendorId, billing);

      await auditLog({
        workspaceId: vendor.workspaceId,
        actor: { userId: null, email: null, role: "SYSTEM" },
        action: AUDIT_ACTIONS.BILLING_PLAN_CHANGED,
        category: "BILLING",
        source: "SYSTEM",
        severity: "INFO",
        entity: { type: "MarketplaceVendorInvoice", id: invoice.id, label: vendor.companyName },
        metadata: {
          operation: "marketplace.billing.charge_invoice",
          invoiceId,
          stripeInvoiceId: paidInvoice.id,
          totalUsd: invoice.totalUsd,
        },
      }).catch(() => undefined);

      return { ok: true, invoice: next, stripeInvoiceId: paidInvoice.id ?? null };
    } catch (error) {
      billing.invoices[invoiceIndex] = { ...invoice, status: "failed" };
      await persistVendorBilling(vendorId, billing);
      return { ok: false, error: safeStripeError(error) };
    }
  }

  const manualPaid: MarketplaceVendorInvoice = {
    ...invoice,
    status: "paid",
    paidAt: new Date().toISOString(),
  };
  billing.invoices[invoiceIndex] = manualPaid;
  await persistVendorBilling(vendorId, billing);

  return { ok: true, invoice: manualPaid, stripeInvoiceId: null };
}

export async function upgradePlan(
  vendorId: string,
  newPlanTier: VendorPlanTier,
): Promise<
  | {
      ok: true;
      planTier: VendorPlanTier;
      proratedChargeUsd: number;
      invoice: MarketplaceVendorInvoice | null;
    }
  | { ok: false; error: string }
> {
  const context = await loadVendorBillingContext(vendorId);
  if (!context) return { ok: false, error: "Vendor not found." };

  const { vendor, billing } = context;
  const currentIndex = VENDOR_PLAN_ORDER.indexOf(vendor.planTier);
  const newIndex = VENDOR_PLAN_ORDER.indexOf(newPlanTier);
  if (newIndex <= currentIndex) {
    return { ok: false, error: "Select a higher plan tier to upgrade." };
  }

  const periodStart = new Date(billing.subscription.currentPeriodStart);
  const periodEnd = new Date(billing.subscription.currentPeriodEnd);
  const proration = calculatePlanUpgradeProration({
    currentPlan: vendor.planTier,
    newPlan: newPlanTier,
    periodStart,
    periodEnd,
  });

  await createVendorSubscription(vendorId, newPlanTier);

  let invoice: MarketplaceVendorInvoice | null = null;
  if (proration.proratedChargeUsd > 0) {
    const generated = await generateVendorInvoice({
      vendorId,
      periodStart,
      periodEnd,
      prorationUsd: proration.proratedChargeUsd,
    });
    if (generated.ok) {
      invoice = generated.invoice;
      await chargeVendorSubscription(vendorId, generated.invoice.id);
    }
  }

  await auditLog({
    workspaceId: vendor.workspaceId,
    actor: { userId: null, email: null, role: "SYSTEM" },
    action: AUDIT_ACTIONS.BILLING_PLAN_CHANGED,
    category: "BILLING",
    source: "SYSTEM",
    severity: "INFO",
    entity: { type: "MarketplaceVendorSubscription", id: vendorId, label: vendor.companyName },
    metadata: {
      operation: "marketplace.billing.upgrade_plan",
      fromPlan: vendor.planTier,
      toPlan: newPlanTier,
      proratedChargeUsd: proration.proratedChargeUsd,
    },
  }).catch(() => undefined);

  return {
    ok: true,
    planTier: newPlanTier,
    proratedChargeUsd: proration.proratedChargeUsd,
    invoice,
  };
}

export async function loadVendorBillingSnapshot(vendorId: string) {
  const context = await loadVendorBillingContext(vendorId);
  if (!context) return null;
  if (
    !Array.isArray(context.vendor.documents) ||
    !context.vendor.documents.some(
      (doc) => typeof doc === "object" && doc !== null && (doc as { kind?: string }).kind === "marketplace_billing",
    )
  ) {
    return defaultMarketplaceVendorBillingDocument(context.vendor.planTier);
  }
  return context.billing;
}
