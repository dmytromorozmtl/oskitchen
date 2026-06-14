import {
  PartnerAppInstallationStatus,
  PartnerBillingMeterKind,
  PartnerBillingPayoutStatus,
  PartnerBillingStatementStatus,
  Prisma,
} from "@prisma/client";

import { recordAuditLog } from "@/lib/audit-log";
import { getStripeClient, safeStripeError } from "@/lib/billing/stripe-client";
import {
  currentBillingPeriodMonth,
  loadPartnerBillingConfig,
  resolvePartnerBillingRates,
} from "@/lib/platform/partner-billing-config";
import {
  computePartnerPublisherShareCents,
  partnerBillingMeterKindLabel,
} from "@/lib/platform/partner-billing-meter-math";
import {
  isMarketplacePartnerStripeConnectEnabled,
  partnerConnectStatusLabel,
  resolvePartnerConnectStatus,
} from "@/lib/platform/partner-stripe-connect";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import { getMergedPartnerOAuthAppByClientId } from "@/services/platform/partner-oauth-app-registry-service";

export type PartnerBillingOverviewRow = {
  publisherKey: string;
  publisherName: string;
  contactEmail: string | null;
  status: string;
  activeInstallations: number;
  currentPeriodAccruedCents: number;
  currency: string;
  revenueShareBps: number;
  monthlyPlatformFeeCentsPerInstall: number;
  stripeConnectAccountId: string | null;
  stripeConnectPayoutsEnabled: boolean;
  connectStatus: string;
  connectReady: boolean;
};

export type PartnerBillingStatementView = {
  id: string;
  publisherKey: string;
  publisherName: string;
  periodMonth: string;
  status: PartnerBillingStatementStatus;
  totalAccruedCents: number;
  totalGrossCents: number;
  revenueShareBps: number;
  currency: string;
  lineItems: Array<{
    label: string;
    kind: PartnerBillingMeterKind;
    quantity: number;
    grossCents: number;
    amountCents: number;
  }>;
  finalizedAt: string | null;
  paidAt: string | null;
  stripeTransferId: string | null;
  payoutStatus: PartnerBillingPayoutStatus;
  payoutError: string | null;
  payoutInitiatedAt: string | null;
  canExecuteStripePayout: boolean;
};

async function ensurePartnerBillingAccount(input: {
  publisherKey: string;
  publisherName: string;
  contactEmail?: string | null;
  revenueShareBps: number;
  monthlyPlatformFeeCentsPerInstall: number;
  currency: string;
}) {
  return prisma.partnerBillingAccount.upsert({
    where: { publisherKey: input.publisherKey },
    create: {
      publisherKey: input.publisherKey,
      publisherName: input.publisherName,
      contactEmail: input.contactEmail ?? null,
      revenueShareBps: input.revenueShareBps,
      monthlyPlatformFeeCentsPerInstall: input.monthlyPlatformFeeCentsPerInstall,
      currency: input.currency,
      status: "active",
    },
    update: {
      publisherName: input.publisherName,
      contactEmail: input.contactEmail ?? null,
      revenueShareBps: input.revenueShareBps,
      monthlyPlatformFeeCentsPerInstall: input.monthlyPlatformFeeCentsPerInstall,
      currency: input.currency,
    },
  });
}

export async function recordPartnerBillingMeterEvent(input: {
  publisherKey: string;
  publisherName: string;
  clientId: string;
  workspaceId?: string | null;
  installationId?: string | null;
  kind: PartnerBillingMeterKind;
  quantity?: number;
  unitAmountCents?: number;
  currency?: string;
  periodMonth?: string;
  idempotencyKey: string;
  contactEmail?: string | null;
  revenueShareBps?: number;
  monthlyPlatformFeeCentsPerInstall?: number;
  metadata?: Record<string, unknown>;
}): Promise<{ created: boolean }> {
  const config = loadPartnerBillingConfig();
  const periodMonth = input.periodMonth ?? currentBillingPeriodMonth();
  const quantity = input.quantity ?? 1;
  const unitAmountCents = input.unitAmountCents ?? 0;
  const currency = input.currency ?? config.defaultCurrency;

  await ensurePartnerBillingAccount({
    publisherKey: input.publisherKey,
    publisherName: input.publisherName,
    contactEmail: input.contactEmail,
    revenueShareBps: input.revenueShareBps ?? config.defaultRevenueShareBps,
    monthlyPlatformFeeCentsPerInstall:
      input.monthlyPlatformFeeCentsPerInstall ??
      config.defaultMonthlyPlatformFeeCentsPerInstall,
    currency,
  });

  try {
    await prisma.partnerBillingMeterEvent.create({
      data: {
        publisherKey: input.publisherKey,
        clientId: input.clientId,
        workspaceId: input.workspaceId ?? null,
        installationId: input.installationId ?? null,
        kind: input.kind,
        quantity,
        unitAmountCents,
        currency,
        periodMonth,
        idempotencyKey: input.idempotencyKey,
        metadataJson: input.metadata ? toInputJsonValue(input.metadata) : undefined,
      },
    });
    return { created: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { created: false };
    }
    throw error;
  }
}

export async function recordPartnerAppInstallBillingMeter(input: {
  clientId: string;
  installationId: string;
  workspaceId: string | null;
  isNewInstall: boolean;
}): Promise<void> {
  const app = await getMergedPartnerOAuthAppByClientId(input.clientId);
  if (!app) return;

  const rates = resolvePartnerBillingRates({
    clientId: input.clientId,
    publisher: app.publisher,
  });
  const config = loadPartnerBillingConfig();
  const periodMonth = currentBillingPeriodMonth();
  const kind = input.isNewInstall
    ? PartnerBillingMeterKind.INSTALL_NEW
    : PartnerBillingMeterKind.INSTALL_ACTIVE;

  await recordPartnerBillingMeterEvent({
    publisherKey: rates.publisherKey,
    publisherName: app.publisher,
    clientId: input.clientId,
    workspaceId: input.workspaceId,
    installationId: input.installationId,
    kind,
    quantity: 1,
    unitAmountCents: input.isNewInstall
      ? config.installActivationFeeCents
      : rates.monthlyPlatformFeeCentsPerInstall,
    currency: rates.currency,
    periodMonth,
    idempotencyKey: `${kind}:${input.installationId}:${periodMonth}`,
    revenueShareBps: rates.revenueShareBps,
    monthlyPlatformFeeCentsPerInstall: rates.monthlyPlatformFeeCentsPerInstall,
    metadata: { appName: app.name },
  });
}

export async function recordPartnerAppRevokeBillingMeter(input: {
  clientId: string;
  installationId: string;
  workspaceId: string | null;
}): Promise<void> {
  const app = await getMergedPartnerOAuthAppByClientId(input.clientId);
  if (!app) return;

  const rates = resolvePartnerBillingRates({
    clientId: input.clientId,
    publisher: app.publisher,
  });
  const periodMonth = currentBillingPeriodMonth();

  await recordPartnerBillingMeterEvent({
    publisherKey: rates.publisherKey,
    publisherName: app.publisher,
    clientId: input.clientId,
    workspaceId: input.workspaceId,
    installationId: input.installationId,
    kind: PartnerBillingMeterKind.INSTALL_REVOKED,
    quantity: 1,
    unitAmountCents: 0,
    currency: rates.currency,
    periodMonth,
    idempotencyKey: `INSTALL_REVOKED:${input.installationId}:${periodMonth}`,
    metadata: { appName: app.name },
  });
}

export async function syncActiveInstallBillingMeters(periodMonth = currentBillingPeriodMonth()): Promise<{
  scanned: number;
  recorded: number;
}> {
  const activeInstalls = await prisma.partnerAppInstallation.findMany({
    where: { status: PartnerAppInstallationStatus.ACTIVE },
  });

  let recorded = 0;
  for (const install of activeInstalls) {
    const app = await getMergedPartnerOAuthAppByClientId(install.clientId);
    if (!app) continue;

    const rates = resolvePartnerBillingRates({
      clientId: install.clientId,
      publisher: app.publisher,
    });

    const result = await recordPartnerBillingMeterEvent({
      publisherKey: rates.publisherKey,
      publisherName: app.publisher,
      clientId: install.clientId,
      workspaceId: install.workspaceId,
      installationId: install.id,
      kind: PartnerBillingMeterKind.INSTALL_ACTIVE,
      quantity: 1,
      unitAmountCents: rates.monthlyPlatformFeeCentsPerInstall,
      currency: rates.currency,
      periodMonth,
      idempotencyKey: `INSTALL_ACTIVE:${install.id}:${periodMonth}`,
      revenueShareBps: rates.revenueShareBps,
      monthlyPlatformFeeCentsPerInstall: rates.monthlyPlatformFeeCentsPerInstall,
      metadata: { appName: app.name, sync: true },
    });
    if (result.created) recorded += 1;
  }

  return { scanned: activeInstalls.length, recorded };
}

function sumPublisherShareForEvents(
  events: Array<{ unitAmountCents: number; quantity: number }>,
  revenueShareBps: number,
): { grossCents: number; publisherShareCents: number } {
  const grossCents = events.reduce((sum, row) => sum + row.unitAmountCents * row.quantity, 0);
  return {
    grossCents,
    publisherShareCents: computePartnerPublisherShareCents({
      grossCents,
      revenueShareBps,
    }),
  };
}

export async function recordPartnerApiRequestBillingMeter(input: {
  clientId: string;
  installationId: string;
  workspaceId?: string | null;
  routeKey: string;
  nowMs?: number;
}): Promise<void> {
  const app = await getMergedPartnerOAuthAppByClientId(input.clientId);
  if (!app) return;

  let workspaceId = input.workspaceId ?? null;
  if (!workspaceId) {
    const install = await prisma.partnerAppInstallation.findUnique({
      where: { id: input.installationId },
      select: { workspaceId: true },
    });
    workspaceId = install?.workspaceId ?? null;
  }

  const rates = resolvePartnerBillingRates({
    clientId: input.clientId,
    publisher: app.publisher,
  });
  if (rates.apiRequestFeeCentsPerCall <= 0) return;

  const periodMonth = currentBillingPeriodMonth();
  const minuteBucket = Math.floor((input.nowMs ?? Date.now()) / 60_000);
  const routeKey = input.routeKey.replace(/[^a-zA-Z0-9:_-]/g, "_").slice(0, 64);

  await recordPartnerBillingMeterEvent({
    publisherKey: rates.publisherKey,
    publisherName: app.publisher,
    clientId: input.clientId,
    workspaceId: input.workspaceId,
    installationId: input.installationId,
    kind: PartnerBillingMeterKind.API_REQUEST,
    quantity: 1,
    unitAmountCents: rates.apiRequestFeeCentsPerCall,
    currency: rates.currency,
    periodMonth,
    idempotencyKey: `API_REQUEST:${input.installationId}:${periodMonth}:${minuteBucket}:${routeKey}`,
    revenueShareBps: rates.revenueShareBps,
    metadata: { appName: app.name, routeKey: input.routeKey },
  });
}

export async function recordPartnerWebhookDeliveryBillingMeter(input: {
  clientId: string;
  installationId: string;
  workspaceId: string | null;
  deliveryId: string;
  eventType: string;
}): Promise<void> {
  const app = await getMergedPartnerOAuthAppByClientId(input.clientId);
  if (!app) return;

  const rates = resolvePartnerBillingRates({
    clientId: input.clientId,
    publisher: app.publisher,
  });
  if (rates.webhookDeliveryFeeCentsPerDelivery <= 0) return;

  const periodMonth = currentBillingPeriodMonth();

  await recordPartnerBillingMeterEvent({
    publisherKey: rates.publisherKey,
    publisherName: app.publisher,
    clientId: input.clientId,
    workspaceId: input.workspaceId,
    installationId: input.installationId,
    kind: PartnerBillingMeterKind.WEBHOOK_DELIVERY,
    quantity: 1,
    unitAmountCents: rates.webhookDeliveryFeeCentsPerDelivery,
    currency: rates.currency,
    periodMonth,
    idempotencyKey: `WEBHOOK_DELIVERY:${input.deliveryId}`,
    revenueShareBps: rates.revenueShareBps,
    metadata: { appName: app.name, eventType: input.eventType },
  });
}

export async function loadPartnerBillingOverview(): Promise<{
  disclosure: string;
  periodMonth: string;
  rows: PartnerBillingOverviewRow[];
  totals: { activeInstallations: number; accruedCents: number; currency: string };
}> {
  const config = loadPartnerBillingConfig();
  const periodMonth = currentBillingPeriodMonth();

  const activeInstalls = await prisma.partnerAppInstallation.findMany({
    where: { status: PartnerAppInstallationStatus.ACTIVE },
    select: { clientId: true },
  });

  const installsByPublisher = new Map<string, number>();
  for (const install of activeInstalls) {
    const app = await getMergedPartnerOAuthAppByClientId(install.clientId);
    if (!app) continue;
    const rates = resolvePartnerBillingRates({
      clientId: install.clientId,
      publisher: app.publisher,
    });
    installsByPublisher.set(
      rates.publisherKey,
      (installsByPublisher.get(rates.publisherKey) ?? 0) + 1,
    );
  }

  const dbAccounts = await prisma.partnerBillingAccount.findMany({
    orderBy: { publisherName: "asc" },
  });
  const accountByKey = new Map(dbAccounts.map((account) => [account.publisherKey, account]));

  const publisherKeys = new Set([
    ...dbAccounts.map((account) => account.publisherKey),
    ...installsByPublisher.keys(),
  ]);

  const rows: PartnerBillingOverviewRow[] = [];
  let totalAccrued = 0;
  let totalActive = 0;

  for (const publisherKey of publisherKeys) {
    const account = accountByKey.get(publisherKey);
    const configApp = config.apps.find((app) => app.publisherKey === publisherKey);
    const activeInstallations = installsByPublisher.get(publisherKey) ?? 0;

    const eventRows = await prisma.partnerBillingMeterEvent.findMany({
      where: { publisherKey, periodMonth },
      select: { unitAmountCents: true, quantity: true },
    });
    const revenueShareBps =
      account?.revenueShareBps ?? configApp?.revenueShareBps ?? config.defaultRevenueShareBps;
    const { publisherShareCents: currentPeriodAccruedCents } = sumPublisherShareForEvents(
      eventRows,
      revenueShareBps,
    );

    totalAccrued += currentPeriodAccruedCents;
    totalActive += activeInstallations;

    rows.push({
      publisherKey,
      publisherName: account?.publisherName ?? configApp?.publisherKey ?? publisherKey,
      contactEmail: account?.contactEmail ?? null,
      status: account?.status ?? "pending_meter",
      activeInstallations,
      currentPeriodAccruedCents,
      currency: account?.currency ?? config.defaultCurrency,
      revenueShareBps,
      monthlyPlatformFeeCentsPerInstall:
        account?.monthlyPlatformFeeCentsPerInstall ??
        configApp?.monthlyPlatformFeeCentsPerInstall ??
        config.defaultMonthlyPlatformFeeCentsPerInstall,
      stripeConnectAccountId: account?.stripeConnectAccountId ?? null,
      stripeConnectPayoutsEnabled: account?.stripeConnectPayoutsEnabled ?? false,
      connectStatus: partnerConnectStatusLabel(
        resolvePartnerConnectStatus({
          stripeConnectAccountId: account?.stripeConnectAccountId ?? null,
          stripeConnectPayoutsEnabled: account?.stripeConnectPayoutsEnabled ?? false,
          stripeConnectDetailsSubmitted: account?.stripeConnectDetailsSubmitted ?? false,
        }),
      ),
      connectReady:
        resolvePartnerConnectStatus({
          stripeConnectAccountId: account?.stripeConnectAccountId ?? null,
          stripeConnectPayoutsEnabled: account?.stripeConnectPayoutsEnabled ?? false,
          stripeConnectDetailsSubmitted: account?.stripeConnectDetailsSubmitted ?? false,
        }) === "ready",
    });
  }

  rows.sort((a, b) => a.publisherName.localeCompare(b.publisherName));

  return {
    disclosure: config.disclosure,
    periodMonth,
    rows,
    totals: {
      activeInstallations: totalActive,
      accruedCents: totalAccrued,
      currency: config.defaultCurrency,
    },
  };
}

export async function generatePartnerBillingStatement(input: {
  publisherKey: string;
  periodMonth: string;
  actorUserId: string;
  finalize?: boolean;
}): Promise<PartnerBillingStatementView> {
  const account = await prisma.partnerBillingAccount.findUnique({
    where: { publisherKey: input.publisherKey },
  });
  if (!account) {
    throw new Error("Partner billing account not found.");
  }

  const events = await prisma.partnerBillingMeterEvent.findMany({
    where: { publisherKey: input.publisherKey, periodMonth: input.periodMonth },
    orderBy: { recordedAt: "asc" },
  });

  const byKind = new Map<PartnerBillingMeterKind, { quantity: number; grossCents: number }>();
  for (const event of events) {
    const current = byKind.get(event.kind) ?? { quantity: 0, grossCents: 0 };
    current.quantity += event.quantity;
    current.grossCents += event.unitAmountCents * event.quantity;
    byKind.set(event.kind, current);
  }

  const lineItems = [...byKind.entries()].map(([kind, totals]) => ({
    label: partnerBillingMeterKindLabel(kind),
    kind,
    quantity: totals.quantity,
    grossCents: totals.grossCents,
    amountCents: computePartnerPublisherShareCents({
      grossCents: totals.grossCents,
      revenueShareBps: account.revenueShareBps,
    }),
  }));

  const totalGrossCents = lineItems.reduce((sum, item) => sum + item.grossCents, 0);
  const totalAccruedCents = lineItems.reduce((sum, item) => sum + item.amountCents, 0);

  const statement = await prisma.partnerBillingStatement.upsert({
    where: {
      publisherKey_periodMonth: {
        publisherKey: input.publisherKey,
        periodMonth: input.periodMonth,
      },
    },
    create: {
      publisherKey: input.publisherKey,
      periodMonth: input.periodMonth,
      status: input.finalize ? PartnerBillingStatementStatus.FINALIZED : PartnerBillingStatementStatus.DRAFT,
      totalAccruedCents,
      currency: account.currency,
      lineItemsJson: toInputJsonValue(lineItems),
      finalizedAt: input.finalize ? new Date() : null,
    },
    update: {
      totalAccruedCents,
      lineItemsJson: toInputJsonValue(lineItems),
      status: input.finalize ? PartnerBillingStatementStatus.FINALIZED : PartnerBillingStatementStatus.DRAFT,
      finalizedAt: input.finalize ? new Date() : undefined,
    },
  });

  await recordAuditLog({
    userId: input.actorUserId,
    action: "partner.billing_statement_generated",
    entityType: "PartnerBillingStatement",
    entityId: statement.id,
    metadata: {
      publisherKey: input.publisherKey,
      periodMonth: input.periodMonth,
      totalAccruedCents,
      finalized: Boolean(input.finalize),
    },
  });

  return mapStatementView(statement, account.publisherName, account);
}

export async function listPartnerBillingStatements(limit = 24): Promise<PartnerBillingStatementView[]> {
  const statements = await prisma.partnerBillingStatement.findMany({
    orderBy: [{ periodMonth: "desc" }, { updatedAt: "desc" }],
    take: limit,
    include: { account: true },
  });

  return statements.map((row) => mapStatementView(row, row.account.publisherName, row.account));
}

function mapStatementView(
  row: {
    id: string;
    publisherKey: string;
    periodMonth: string;
    status: PartnerBillingStatementStatus;
    totalAccruedCents: number;
    currency: string;
    lineItemsJson: unknown;
    finalizedAt: Date | null;
    paidAt: Date | null;
    stripeTransferId: string | null;
    payoutStatus: PartnerBillingPayoutStatus;
    payoutError: string | null;
    payoutInitiatedAt: Date | null;
  },
  publisherName: string,
  account?: {
    stripeConnectAccountId: string | null;
    stripeConnectPayoutsEnabled: boolean;
    stripeConnectDetailsSubmitted: boolean;
    revenueShareBps?: number;
  } | null,
): PartnerBillingStatementView {
  const lineItems = (row.lineItemsJson as PartnerBillingStatementView["lineItems"]) ?? [];
  const totalGrossCents = lineItems.reduce((sum, item) => sum + (item.grossCents ?? 0), 0);
  const revenueShareBps = account?.revenueShareBps ?? 0;
  const connectReady =
    account &&
    resolvePartnerConnectStatus({
      stripeConnectAccountId: account.stripeConnectAccountId,
      stripeConnectPayoutsEnabled: account.stripeConnectPayoutsEnabled,
      stripeConnectDetailsSubmitted: account.stripeConnectDetailsSubmitted,
    }) === "ready";

  const canExecuteStripePayout = Boolean(
    isMarketplacePartnerStripeConnectEnabled() &&
      connectReady &&
      row.status === PartnerBillingStatementStatus.FINALIZED &&
      row.totalAccruedCents > 0 &&
      row.payoutStatus !== PartnerBillingPayoutStatus.PENDING &&
      row.payoutStatus !== PartnerBillingPayoutStatus.COMPLETED,
  );

  return {
    id: row.id,
    publisherKey: row.publisherKey,
    publisherName,
    periodMonth: row.periodMonth,
    status: row.status,
    totalAccruedCents: row.totalAccruedCents,
    totalGrossCents,
    revenueShareBps,
    currency: row.currency,
    lineItems,
    finalizedAt: row.finalizedAt?.toISOString() ?? null,
    paidAt: row.paidAt?.toISOString() ?? null,
    stripeTransferId: row.stripeTransferId,
    payoutStatus: row.payoutStatus,
    payoutError: row.payoutError,
    payoutInitiatedAt: row.payoutInitiatedAt?.toISOString() ?? null,
    canExecuteStripePayout,
  };
}

export async function markPartnerBillingStatementPaid(input: {
  statementId: string;
  actorUserId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const statement = await prisma.partnerBillingStatement.findUnique({
    where: { id: input.statementId },
  });
  if (!statement) return { ok: false, error: "Statement not found." };
  if (statement.status === PartnerBillingStatementStatus.VOID) {
    return { ok: false, error: "Cannot mark a void statement as paid." };
  }

  await prisma.partnerBillingStatement.update({
    where: { id: statement.id },
    data: {
      status: PartnerBillingStatementStatus.PAID,
      paidAt: new Date(),
    },
  });

  await recordAuditLog({
    userId: input.actorUserId,
    action: "partner.billing_statement_paid",
    entityType: "PartnerBillingStatement",
    entityId: statement.id,
    metadata: { publisherKey: statement.publisherKey, periodMonth: statement.periodMonth },
  });

  return { ok: true };
}

export async function executePartnerStatementStripePayout(input: {
  statementId: string;
  actorUserId: string;
}): Promise<
  | { ok: true; transferId: string; dryRun: boolean }
  | { ok: false; error: string }
> {
  if (!isMarketplacePartnerStripeConnectEnabled()) {
    return { ok: false, error: "Partner Stripe Connect payouts are not enabled." };
  }

  const statement = await prisma.partnerBillingStatement.findUnique({
    where: { id: input.statementId },
    include: { account: true },
  });
  if (!statement) return { ok: false, error: "Statement not found." };
  if (statement.status !== PartnerBillingStatementStatus.FINALIZED) {
    return { ok: false, error: "Only finalized statements can be paid out." };
  }
  if (statement.payoutStatus === PartnerBillingPayoutStatus.PENDING) {
    return { ok: false, error: "Payout is already in progress." };
  }
  if (statement.payoutStatus === PartnerBillingPayoutStatus.COMPLETED) {
    return { ok: false, error: "Stripe payout already completed for this statement." };
  }
  if (statement.totalAccruedCents <= 0) {
    return { ok: false, error: "Statement total must be greater than zero." };
  }

  const account = statement.account;
  if (!account.stripeConnectAccountId?.trim()) {
    return { ok: false, error: "Publisher has not completed Stripe Connect onboarding." };
  }
  if (!account.stripeConnectPayoutsEnabled) {
    return { ok: false, error: "Publisher Stripe account is not payout-ready yet." };
  }

  const dryRun = process.env.PARTNER_STRIPE_PAYOUT_DRY_RUN === "1";
  const stripe = getStripeClient();

  await prisma.partnerBillingStatement.update({
    where: { id: statement.id },
    data: {
      payoutStatus: PartnerBillingPayoutStatus.PENDING,
      payoutInitiatedAt: new Date(),
      payoutError: null,
    },
  });

  try {
    let transferId: string;

    if (dryRun || !stripe) {
      transferId = `dryrun_tr_${statement.id.replace(/-/g, "").slice(0, 24)}`;
    } else {
      const transfer = await stripe.transfers.create(
        {
          amount: statement.totalAccruedCents,
          currency: statement.currency.toLowerCase(),
          destination: account.stripeConnectAccountId,
          description: `KitchenOS partner billing ${statement.periodMonth}`,
          metadata: {
            kitchenosPublisherKey: statement.publisherKey,
            kitchenosStatementId: statement.id,
            kitchenosPeriodMonth: statement.periodMonth,
          },
        },
        { idempotencyKey: `partner-payout:${statement.id}` },
      );
      transferId = transfer.id;
    }

    await prisma.partnerBillingStatement.update({
      where: { id: statement.id },
      data: {
        status: PartnerBillingStatementStatus.PAID,
        paidAt: new Date(),
        stripeTransferId: transferId,
        payoutStatus: PartnerBillingPayoutStatus.COMPLETED,
        payoutError: null,
      },
    });

    await recordAuditLog({
      userId: input.actorUserId,
      action: "partner.billing_statement_stripe_payout",
      entityType: "PartnerBillingStatement",
      entityId: statement.id,
      metadata: {
        publisherKey: statement.publisherKey,
        periodMonth: statement.periodMonth,
        transferId,
        amountCents: statement.totalAccruedCents,
        dryRun,
      },
    });

    return { ok: true, transferId, dryRun };
  } catch (e) {
    const message = safeStripeError(e);
    await prisma.partnerBillingStatement.update({
      where: { id: statement.id },
      data: {
        payoutStatus: PartnerBillingPayoutStatus.FAILED,
        payoutError: message,
      },
    });
    return { ok: false, error: message };
  }
}
