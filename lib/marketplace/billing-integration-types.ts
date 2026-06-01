import type { VendorPlanTier } from "@prisma/client";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type VendorSubscriptionStatus = "active" | "past_due" | "cancelled" | "trialing";

export type MarketplaceVendorSubscription = {
  planTier: VendorPlanTier;
  status: VendorSubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  monthlyFeeUsd: number;
  createdAt: string;
  updatedAt: string;
};

export type MarketplaceVendorInvoiceLineKind = "saas_subscription" | "marketplace_commission";

export type MarketplaceVendorInvoiceLine = {
  kind: MarketplaceVendorInvoiceLineKind;
  description: string;
  quantity: number;
  unitAmountUsd: number;
  amountUsd: number;
};

export type MarketplaceVendorInvoiceStatus = "draft" | "open" | "paid" | "failed";

export type MarketplaceVendorInvoice = {
  id: string;
  vendorId: string;
  periodStart: string;
  periodEnd: string;
  planTier: VendorPlanTier;
  lines: MarketplaceVendorInvoiceLine[];
  subtotalUsd: number;
  totalUsd: number;
  status: MarketplaceVendorInvoiceStatus;
  stripeInvoiceId: string | null;
  paidAt: string | null;
  createdAt: string;
};

export type MarketplaceVendorBillingDocument = {
  kind: "marketplace_billing";
  subscription: MarketplaceVendorSubscription;
  invoices: MarketplaceVendorInvoice[];
  updatedAt: string;
};

export const VENDOR_PLAN_MONTHLY_FEE_USD: Record<VendorPlanTier, number> = {
  FREE: 0,
  GROWTH: 99,
  ENTERPRISE: 299,
};

export const VENDOR_PLAN_ORDER: VendorPlanTier[] = ["FREE", "GROWTH", "ENTERPRISE"];

export function commissionRateForPlan(planTier: VendorPlanTier): number {
  if (planTier === "ENTERPRISE") return 2;
  if (planTier === "GROWTH") return 3.5;
  return 5;
}

export function currentBillingPeriod(now = new Date()): { start: Date; end: Date } {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
  return { start, end };
}

export function calculatePlanUpgradeProration(input: {
  currentPlan: VendorPlanTier;
  newPlan: VendorPlanTier;
  periodStart: Date;
  periodEnd: Date;
  now?: Date;
}): {
  daysInPeriod: number;
  daysRemaining: number;
  currentPlanDailyUsd: number;
  newPlanDailyUsd: number;
  proratedChargeUsd: number;
} {
  const now = input.now ?? new Date();
  const msPerDay = 86_400_000;
  const daysInPeriod = Math.max(
    1,
    Math.ceil((input.periodEnd.getTime() - input.periodStart.getTime()) / msPerDay),
  );
  const daysRemaining = Math.max(
    0,
    Math.ceil((input.periodEnd.getTime() - now.getTime()) / msPerDay),
  );

  const currentMonthly = VENDOR_PLAN_MONTHLY_FEE_USD[input.currentPlan];
  const newMonthly = VENDOR_PLAN_MONTHLY_FEE_USD[input.newPlan];
  const currentPlanDailyUsd = currentMonthly / daysInPeriod;
  const newPlanDailyUsd = newMonthly / daysInPeriod;
  const proratedChargeUsd = round2((newPlanDailyUsd - currentPlanDailyUsd) * daysRemaining);

  return {
    daysInPeriod,
    daysRemaining,
    currentPlanDailyUsd: round2(currentPlanDailyUsd),
    newPlanDailyUsd: round2(newPlanDailyUsd),
    proratedChargeUsd,
  };
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function defaultMarketplaceVendorBillingDocument(
  planTier: VendorPlanTier,
  now = new Date(),
): MarketplaceVendorBillingDocument {
  const { start, end } = currentBillingPeriod(now);
  const iso = now.toISOString();
  return {
    kind: "marketplace_billing",
    subscription: {
      planTier,
      status: "active",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodStart: start.toISOString(),
      currentPeriodEnd: end.toISOString(),
      monthlyFeeUsd: VENDOR_PLAN_MONTHLY_FEE_USD[planTier],
      createdAt: iso,
      updatedAt: iso,
    },
    invoices: [],
    updatedAt: iso,
  };
}

function parseSubscription(raw: unknown, fallbackPlan: VendorPlanTier): MarketplaceVendorSubscription {
  const defaults = defaultMarketplaceVendorBillingDocument(fallbackPlan).subscription;
  if (!isPlainObject(raw)) return defaults;

  const planTier = parsePlanTier(raw.planTier) ?? defaults.planTier;
  const status = parseSubscriptionStatus(raw.status) ?? defaults.status;

  return {
    planTier,
    status,
    stripeCustomerId: typeof raw.stripeCustomerId === "string" ? raw.stripeCustomerId : null,
    stripeSubscriptionId: typeof raw.stripeSubscriptionId === "string" ? raw.stripeSubscriptionId : null,
    currentPeriodStart:
      typeof raw.currentPeriodStart === "string" ? raw.currentPeriodStart : defaults.currentPeriodStart,
    currentPeriodEnd: typeof raw.currentPeriodEnd === "string" ? raw.currentPeriodEnd : defaults.currentPeriodEnd,
    monthlyFeeUsd:
      typeof raw.monthlyFeeUsd === "number" && Number.isFinite(raw.monthlyFeeUsd)
        ? raw.monthlyFeeUsd
        : VENDOR_PLAN_MONTHLY_FEE_USD[planTier],
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : defaults.createdAt,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : defaults.updatedAt,
  };
}

function parseInvoiceLine(raw: unknown): MarketplaceVendorInvoiceLine | null {
  if (!isPlainObject(raw)) return null;
  const kind = raw.kind;
  if (kind !== "saas_subscription" && kind !== "marketplace_commission") return null;
  return {
    kind,
    description: typeof raw.description === "string" ? raw.description : kind,
    quantity: typeof raw.quantity === "number" && raw.quantity > 0 ? raw.quantity : 1,
    unitAmountUsd: typeof raw.unitAmountUsd === "number" ? raw.unitAmountUsd : 0,
    amountUsd: typeof raw.amountUsd === "number" ? raw.amountUsd : 0,
  };
}

function parseInvoice(raw: unknown): MarketplaceVendorInvoice | null {
  if (!isPlainObject(raw)) return null;
  if (typeof raw.id !== "string" || typeof raw.vendorId !== "string") return null;
  const planTier = parsePlanTier(raw.planTier);
  if (!planTier) return null;
  const status = parseInvoiceStatus(raw.status);
  if (!status) return null;

  const lines = Array.isArray(raw.lines)
    ? raw.lines.map(parseInvoiceLine).filter((line): line is MarketplaceVendorInvoiceLine => line != null)
    : [];

  return {
    id: raw.id,
    vendorId: raw.vendorId,
    periodStart: typeof raw.periodStart === "string" ? raw.periodStart : new Date().toISOString(),
    periodEnd: typeof raw.periodEnd === "string" ? raw.periodEnd : new Date().toISOString(),
    planTier,
    lines,
    subtotalUsd: typeof raw.subtotalUsd === "number" ? raw.subtotalUsd : 0,
    totalUsd: typeof raw.totalUsd === "number" ? raw.totalUsd : 0,
    status,
    stripeInvoiceId: typeof raw.stripeInvoiceId === "string" ? raw.stripeInvoiceId : null,
    paidAt: typeof raw.paidAt === "string" ? raw.paidAt : null,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
  };
}

function parsePlanTier(value: unknown): VendorPlanTier | null {
  return value === "FREE" || value === "GROWTH" || value === "ENTERPRISE" ? value : null;
}

function parseSubscriptionStatus(value: unknown): VendorSubscriptionStatus | null {
  return value === "active" || value === "past_due" || value === "cancelled" || value === "trialing"
    ? value
    : null;
}

function parseInvoiceStatus(value: unknown): MarketplaceVendorInvoiceStatus | null {
  return value === "draft" || value === "open" || value === "paid" || value === "failed" ? value : null;
}

export function parseMarketplaceVendorBillingDocument(
  documents: unknown,
  fallbackPlan: VendorPlanTier = "FREE",
): MarketplaceVendorBillingDocument {
  if (!Array.isArray(documents)) return defaultMarketplaceVendorBillingDocument(fallbackPlan);
  const entry = documents.find(
    (item): item is MarketplaceVendorBillingDocument =>
      isPlainObject(item) && item.kind === "marketplace_billing",
  );
  if (!entry) return defaultMarketplaceVendorBillingDocument(fallbackPlan);

  return {
    kind: "marketplace_billing",
    subscription: parseSubscription(entry.subscription, fallbackPlan),
    invoices: Array.isArray(entry.invoices)
      ? entry.invoices.map(parseInvoice).filter((invoice): invoice is MarketplaceVendorInvoice => invoice != null)
      : [],
    updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : new Date().toISOString(),
  };
}

export function mergeMarketplaceBillingIntoDocuments(
  documents: unknown,
  billing: MarketplaceVendorBillingDocument,
): unknown[] {
  const list = Array.isArray(documents)
    ? documents.filter((doc) => !isPlainObject(doc) || doc.kind !== "marketplace_billing")
    : [];
  return [...list, billing];
}

export function buildVendorInvoiceLines(input: {
  planTier: VendorPlanTier;
  commissionTotalUsd: number;
  prorationUsd?: number;
}): MarketplaceVendorInvoiceLine[] {
  const lines: MarketplaceVendorInvoiceLine[] = [];
  const saasFee = VENDOR_PLAN_MONTHLY_FEE_USD[input.planTier];

  if (saasFee > 0) {
    lines.push({
      kind: "saas_subscription",
      description: `${input.planTier} vendor cabinet subscription`,
      quantity: 1,
      unitAmountUsd: saasFee,
      amountUsd: saasFee,
    });
  }

  if (input.commissionTotalUsd > 0) {
    lines.push({
      kind: "marketplace_commission",
      description: "Marketplace order commission",
      quantity: 1,
      unitAmountUsd: round2(input.commissionTotalUsd),
      amountUsd: round2(input.commissionTotalUsd),
    });
  }

  if (input.prorationUsd && input.prorationUsd > 0) {
    lines.push({
      kind: "saas_subscription",
      description: "Prorated plan upgrade",
      quantity: 1,
      unitAmountUsd: round2(input.prorationUsd),
      amountUsd: round2(input.prorationUsd),
    });
  }

  return lines;
}

export function sumInvoiceLines(lines: readonly MarketplaceVendorInvoiceLine[]): number {
  return round2(lines.reduce((sum, line) => sum + line.amountUsd, 0));
}
