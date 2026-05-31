import {
  PartnerAppInstallationStatus,
  PartnerBillingMeterKind,
  PartnerBillingStatementStatus,
  Prisma,
} from "@prisma/client";

import { recordAuditLog } from "@/lib/audit-log";
import {
  currentBillingPeriodMonth,
  loadPartnerBillingConfig,
  resolvePartnerBillingRates,
} from "@/lib/platform/partner-billing-config";
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
};

export type PartnerBillingStatementView = {
  id: string;
  publisherKey: string;
  publisherName: string;
  periodMonth: string;
  status: PartnerBillingStatementStatus;
  totalAccruedCents: number;
  currency: string;
  lineItems: Array<{
    label: string;
    kind: PartnerBillingMeterKind;
    quantity: number;
    amountCents: number;
  }>;
  finalizedAt: string | null;
  paidAt: string | null;
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
    const currentPeriodAccruedCents = eventRows.reduce(
      (sum, row) => sum + row.unitAmountCents * row.quantity,
      0,
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
      revenueShareBps: account?.revenueShareBps ?? configApp?.revenueShareBps ?? config.defaultRevenueShareBps,
      monthlyPlatformFeeCentsPerInstall:
        account?.monthlyPlatformFeeCentsPerInstall ??
        configApp?.monthlyPlatformFeeCentsPerInstall ??
        config.defaultMonthlyPlatformFeeCentsPerInstall,
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

  const byKind = new Map<PartnerBillingMeterKind, { quantity: number; amountCents: number }>();
  for (const event of events) {
    const current = byKind.get(event.kind) ?? { quantity: 0, amountCents: 0 };
    current.quantity += event.quantity;
    current.amountCents += event.unitAmountCents * event.quantity;
    byKind.set(event.kind, current);
  }

  const lineItems = [...byKind.entries()].map(([kind, totals]) => ({
    label: kind.replaceAll("_", " ").toLowerCase(),
    kind,
    quantity: totals.quantity,
    amountCents: totals.amountCents,
  }));

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

  return mapStatementView(statement, account.publisherName);
}

export async function listPartnerBillingStatements(limit = 24): Promise<PartnerBillingStatementView[]> {
  const statements = await prisma.partnerBillingStatement.findMany({
    orderBy: [{ periodMonth: "desc" }, { updatedAt: "desc" }],
    take: limit,
    include: { account: true },
  });

  return statements.map((row) => mapStatementView(row, row.account.publisherName));
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
  },
  publisherName: string,
): PartnerBillingStatementView {
  const lineItems = (row.lineItemsJson as PartnerBillingStatementView["lineItems"]) ?? [];
  return {
    id: row.id,
    publisherKey: row.publisherKey,
    publisherName,
    periodMonth: row.periodMonth,
    status: row.status,
    totalAccruedCents: row.totalAccruedCents,
    currency: row.currency,
    lineItems,
    finalizedAt: row.finalizedAt?.toISOString() ?? null,
    paidAt: row.paidAt?.toISOString() ?? null,
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
