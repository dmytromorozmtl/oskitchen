import { CapitalReferralBillingStatementStatus, Prisma } from "@prisma/client";
import { createHash } from "crypto";

import { recordAuditLog } from "@/lib/audit-log";
import {
  currentCapitalBillingPeriodMonth,
  loadCapitalPartnerBillingConfig,
  resolveCapitalPartnerBillingRates,
} from "@/lib/commercial/capital-partner-billing-config";
import {
  getCapitalPartnerBySlug,
  listLiveLenderOfferPartners,
  loadCapitalPartnersConfig,
  type CapitalPartner,
} from "@/lib/commercial/capital-partners";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";

export type CapitalPartnerOnboardingRow = {
  slug: string;
  name: string;
  lifecycleStatus: CapitalPartner["offerLifecycleStatus"];
  regions: string[];
  referralFee: boolean;
  referralFeeBps: number | null;
  partnerAgreementEffectiveDate: string | null;
  stateDisclosureUrl: string | null;
  contactEmail: string | null;
  webhookConfigured: boolean;
  applyUrlConfigured: boolean;
  currentPeriodAccruedCents: number;
  currency: string;
  fundedReferralsThisPeriod: number;
};

export type CapitalPartnerBillingOverview = {
  disclosure: string;
  periodMonth: string;
  rows: CapitalPartnerOnboardingRow[];
  totals: { accruedCents: number; currency: string; livePartnerCount: number };
};

export type CapitalPartnerBillingStatementView = {
  id: string;
  partnerSlug: string;
  partnerName: string;
  periodMonth: string;
  status: CapitalReferralBillingStatementStatus;
  totalAccruedCents: number;
  currency: string;
  finalizedAt: string | null;
  paidAt: string | null;
};

function partnerWebhookConfigured(partner: CapitalPartner): boolean {
  const envKey = partner.webhookSecretEnvKey?.trim();
  if (envKey && process.env[envKey]?.trim()) return true;
  return Boolean(process.env.CAPITAL_LENDER_WEBHOOK_SECRET?.trim()) || process.env.NODE_ENV === "test";
}

function partnerApplyUrlConfigured(partner: CapitalPartner): boolean {
  const envKey = partner.applyUrlEnvKey?.trim();
  if (envKey && process.env[envKey]?.trim()) return true;
  return Boolean(partner.offerApplyUrlTemplate?.trim());
}

async function ensureCapitalPartnerBillingAccount(partner: CapitalPartner) {
  const rates = resolveCapitalPartnerBillingRates(partner.slug);
  return prisma.capitalPartnerBillingAccount.upsert({
    where: { partnerSlug: partner.slug },
    create: {
      partnerSlug: partner.slug,
      partnerName: partner.name,
      contactEmail: partner.contactEmail ?? null,
      referralFeeBps: partner.referralFeeBps ?? rates.referralFeeBps,
      currency: rates.currency,
      status: "active",
    },
    update: {
      partnerName: partner.name,
      contactEmail: partner.contactEmail ?? null,
      referralFeeBps: partner.referralFeeBps ?? rates.referralFeeBps,
      currency: rates.currency,
    },
  });
}

export function computeCapitalReferralFeeCents(input: {
  fundedAmountCents: number;
  referralFeeBps: number;
}): number {
  if (input.fundedAmountCents <= 0 || input.referralFeeBps <= 0) return 0;
  return Math.round((input.fundedAmountCents * input.referralFeeBps) / 10_000);
}

export async function recordCapitalReferralFundedMeter(input: {
  partnerSlug: string;
  referralId: string;
  workspaceId?: string | null;
  fundedAmountCents?: number;
  idempotencyKey: string;
  periodMonth?: string;
}): Promise<{ created: boolean; referralFeeCents: number }> {
  const partner = getCapitalPartnerBySlug(input.partnerSlug);
  if (!partner?.offersEnabled || !partner.referralFee) {
    return { created: false, referralFeeCents: 0 };
  }

  const rates = resolveCapitalPartnerBillingRates(partner.slug);
  const referralFeeBps = partner.referralFeeBps ?? rates.referralFeeBps;
  const fundedAmountCents = input.fundedAmountCents ?? 0;
  const referralFeeCents = computeCapitalReferralFeeCents({
    fundedAmountCents,
    referralFeeBps,
  });
  const periodMonth = input.periodMonth ?? currentCapitalBillingPeriodMonth();

  await ensureCapitalPartnerBillingAccount(partner);

  try {
    await prisma.capitalReferralBillingMeterEvent.create({
      data: {
        partnerSlug: partner.slug,
        referralId: input.referralId,
        workspaceId: input.workspaceId ?? null,
        kind: "REFERRAL_FUNDED",
        fundedAmountCents,
        referralFeeCents,
        currency: rates.currency,
        periodMonth,
        idempotencyKey: input.idempotencyKey,
        metadataJson: toInputJsonValue({
          referralFeeBps,
          source: "capital_lender_webhook",
        }),
      },
    });
    return { created: true, referralFeeCents };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { created: false, referralFeeCents };
    }
    throw error;
  }
}

export function hashCapitalLenderWebhookPayload(rawBody: string): string {
  return createHash("sha256").update(rawBody, "utf8").digest("hex");
}

export async function claimCapitalLenderWebhookDelivery(input: {
  partnerSlug: string;
  idempotencyKey: string;
  referralId: string;
  payloadHash?: string | null;
}): Promise<{ duplicate: boolean; deliveryId: string | null }> {
  try {
    const delivery = await prisma.capitalLenderWebhookDelivery.create({
      data: {
        partnerSlug: input.partnerSlug,
        idempotencyKey: input.idempotencyKey,
        referralId: input.referralId,
        payloadHash: input.payloadHash ?? null,
      },
    });
    return { duplicate: false, deliveryId: delivery.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { duplicate: true, deliveryId: null };
    }
    throw error;
  }
}

export async function finalizeCapitalLenderWebhookDelivery(input: {
  deliveryId: string;
  response: Record<string, unknown>;
}): Promise<void> {
  await prisma.capitalLenderWebhookDelivery.update({
    where: { id: input.deliveryId },
    data: { responseJson: toInputJsonValue(input.response) },
  });
}

export async function loadCapitalPartnerOnboardingOverview(): Promise<CapitalPartnerBillingOverview> {
  const config = loadCapitalPartnerBillingConfig();
  const periodMonth = currentCapitalBillingPeriodMonth();
  const offerPartners = loadCapitalPartnersConfig().partners.filter((p) => p.offersEnabled);

  const meterTotals = await prisma.capitalReferralBillingMeterEvent.groupBy({
    by: ["partnerSlug"],
    where: { periodMonth },
    _sum: { referralFeeCents: true },
    _count: { _all: true },
  });
  const totalsBySlug = new Map(
    meterTotals.map((row) => [
      row.partnerSlug,
      {
        accruedCents: row._sum.referralFeeCents ?? 0,
        fundedCount: row._count._all,
      },
    ]),
  );

  const rows: CapitalPartnerOnboardingRow[] = offerPartners.map((partner) => {
    const meter = totalsBySlug.get(partner.slug);
    const rates = resolveCapitalPartnerBillingRates(partner.slug);
    return {
      slug: partner.slug,
      name: partner.name,
      lifecycleStatus: partner.offerLifecycleStatus ?? "sandbox",
      regions: partner.regions,
      referralFee: partner.referralFee,
      referralFeeBps: partner.referralFeeBps ?? (partner.referralFee ? rates.referralFeeBps : null),
      partnerAgreementEffectiveDate: partner.partnerAgreementEffectiveDate ?? null,
      stateDisclosureUrl: partner.stateDisclosureUrl ?? null,
      contactEmail: partner.contactEmail ?? null,
      webhookConfigured: partnerWebhookConfigured(partner),
      applyUrlConfigured: partnerApplyUrlConfigured(partner),
      currentPeriodAccruedCents: meter?.accruedCents ?? 0,
      currency: rates.currency,
      fundedReferralsThisPeriod: meter?.fundedCount ?? 0,
    };
  });

  const livePartners = listLiveLenderOfferPartners();
  const accruedCents = rows.reduce((sum, row) => sum + row.currentPeriodAccruedCents, 0);

  return {
    disclosure: config.disclosure,
    periodMonth,
    rows,
    totals: {
      accruedCents,
      currency: config.defaultCurrency,
      livePartnerCount: livePartners.length,
    },
  };
}

export async function listCapitalPartnerBillingStatements(): Promise<
  CapitalPartnerBillingStatementView[]
> {
  const rows = await prisma.capitalReferralBillingStatement.findMany({
    orderBy: [{ periodMonth: "desc" }, { partnerSlug: "asc" }],
    take: 24,
  });

  return rows.map((row) => {
    const partner = getCapitalPartnerBySlug(row.partnerSlug);
    return {
      id: row.id,
      partnerSlug: row.partnerSlug,
      partnerName: partner?.name ?? row.partnerSlug,
      periodMonth: row.periodMonth,
      status: row.status,
      totalAccruedCents: row.totalAccruedCents,
      currency: row.currency,
      finalizedAt: row.finalizedAt?.toISOString() ?? null,
      paidAt: row.paidAt?.toISOString() ?? null,
    };
  });
}

export async function syncCapitalPartnerBillingStatements(input?: {
  periodMonth?: string;
}): Promise<{ upserted: number }> {
  const periodMonth = input?.periodMonth ?? currentCapitalBillingPeriodMonth();
  const grouped = await prisma.capitalReferralBillingMeterEvent.groupBy({
    by: ["partnerSlug", "currency"],
    where: { periodMonth },
    _sum: { referralFeeCents: true },
  });

  let upserted = 0;
  for (const row of grouped) {
    const partner = getCapitalPartnerBySlug(row.partnerSlug);
    if (partner) {
      await ensureCapitalPartnerBillingAccount(partner);
    }
    await prisma.capitalReferralBillingStatement.upsert({
      where: {
        partnerSlug_periodMonth: {
          partnerSlug: row.partnerSlug,
          periodMonth,
        },
      },
      create: {
        partnerSlug: row.partnerSlug,
        periodMonth,
        status: "DRAFT",
        totalAccruedCents: row._sum.referralFeeCents ?? 0,
        currency: row.currency,
      },
      update: {
        totalAccruedCents: row._sum.referralFeeCents ?? 0,
        currency: row.currency,
      },
    });
    upserted += 1;
  }
  return { upserted };
}

export async function finalizeCapitalPartnerBillingStatement(input: {
  statementId: string;
  actorUserId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const statement = await prisma.capitalReferralBillingStatement.findUnique({
    where: { id: input.statementId },
  });
  if (!statement) return { ok: false, error: "Statement not found." };
  if (statement.status !== "DRAFT") {
    return { ok: false, error: "Only draft statements can be finalized." };
  }

  await prisma.capitalReferralBillingStatement.update({
    where: { id: statement.id },
    data: {
      status: "FINALIZED",
      finalizedAt: new Date(),
    },
  });

  await recordAuditLog({
    userId: input.actorUserId,
    action: "capital.partner_billing_finalized",
    entityType: "CapitalReferralBillingStatement",
    entityId: statement.id,
    metadata: {
      partnerSlug: statement.partnerSlug,
      periodMonth: statement.periodMonth,
      totalAccruedCents: statement.totalAccruedCents,
    },
  });

  return { ok: true };
}
