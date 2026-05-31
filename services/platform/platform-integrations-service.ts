import {
  ErrorRecoveryItemStatus,
  ErrorRecoverySource,
  type IntegrationProvider,
  WebhookProcessingJobStatus,
} from "@prisma/client";

import type { IntegrationMaturityTier } from "@/lib/integrations/integration-maturity-types";
import { toSafeErrorPreview } from "@/lib/security/sensitive-redaction";
import { prisma } from "@/lib/prisma";

export type PlatformIntegrationAggregateRow = {
  provider: IntegrationProvider;
  label: string;
  maturity: IntegrationMaturityTier;
  workspaceCount: number;
  connectionCount: number;
  connectedCount: number;
  errorCount: number;
  lastSyncAt: Date | null;
  lastErrorSample: string | null;
  lastErrorSampleRedacted: boolean;
  worksSummary: string;
  gapsSummary: string;
  integrationHonestyNote: string;
};

function providerLabel(p: IntegrationProvider): string {
  switch (p) {
    case "WOOCOMMERCE":
      return "WooCommerce";
    case "SHOPIFY":
      return "Shopify";
    case "UBER_EATS":
      return "Uber Eats";
    case "UBER_DIRECT":
      return "Uber Direct";
    case "MANUAL":
      return "Manual / internal";
    default:
      return p;
  }
}

function baseMaturity(provider: IntegrationProvider): {
  maturity: IntegrationMaturityTier;
  works: string;
  gaps: string;
  note: string;
} {
  switch (provider) {
    case "SHOPIFY":
    case "WOOCOMMERCE":
      return {
        maturity: "SETUP_READY",
        works: "Credential storage, webhook ingestion plumbing, and import batches when keys are valid.",
        gaps: "LIVE requires your own store, verified webhooks, and operational burn-in — not inferred from this matrix.",
        note: "Never marketed as marketplace delivery — storefront/e-commerce shaped payloads only.",
      };
    case "UBER_EATS":
      return {
        maturity: "PARTNER_ACCESS_REQUIRED",
        works: "Operational data model and mapping surfaces for marketplace-shaped orders when partner access exists.",
        gaps: "Uber Eats traffic requires appropriate partner/API access — OS Kitchen does not imply marketplace approval.",
        note: "Treat as partner-gated; do not demo as live marketplace unless you have real credentials and scope.",
      };
    case "UBER_DIRECT":
      return {
        maturity: "BETA",
        works: "Dispatch-oriented route planning hooks where Uber Direct credentials and geography are configured.",
        gaps: "Quotes, SLA, and rider availability depend on Uber service coverage and credential scope.",
        note: "Not a replacement for your courier contracts — verify dispatch in staging.",
      };
    case "MANUAL":
      return {
        maturity: "LIVE",
        works: "First-party manual orders, CSV import, and internal POS sales without external OAuth.",
        gaps: "Does not include third-party POS (Toast/Square/Clover) native sync — see roadmap honesty in workspace health.",
        note: "Internal/manual path is the always-available baseline.",
      };
    default:
      return {
        maturity: "DEV_ONLY",
        works: "Provider enum placeholder — treat as internal until surfaced in product.",
        gaps: "No customer-facing contract.",
        note: "Internal only.",
      };
  }
}

function refineMaturity(
  base: IntegrationMaturityTier,
  hasConnected: boolean,
  hasError: boolean,
): IntegrationMaturityTier {
  if (hasError) return "PARTIAL";
  if (base === "SETUP_READY" && hasConnected) return "BETA";
  return base;
}

export async function loadPlatformIntegrationAggregates(): Promise<{
  rows: PlatformIntegrationAggregateRow[];
  webhookPending: number;
  webhookFailedUnprocessed: number;
}> {
  const connections = await prisma.integrationConnection.findMany({
    select: {
      provider: true,
      status: true,
      userId: true,
      lastSyncAt: true,
      lastError: true,
    },
  });

  const [pendingHooks, failedHooks] = await Promise.all([
    prisma.webhookEvent.count({ where: { processed: false } }),
    prisma.webhookEvent.count({
      where: { processed: false, processingError: { not: null } },
    }),
  ]);

  const byProvider = new Map<
    IntegrationProvider,
    {
      users: Set<string>;
      lastSync: Date | null;
      lastErr: string | null;
      lastErrRedacted: boolean;
      connected: number;
      errors: number;
      total: number;
    }
  >();

  for (const c of connections) {
    const cur = byProvider.get(c.provider) ?? {
      users: new Set<string>(),
      lastSync: null as Date | null,
      lastErr: null as string | null,
      lastErrRedacted: false,
      connected: 0,
      errors: 0,
      total: 0,
    };
    cur.users.add(c.userId);
    cur.total += 1;
    if (c.status === "CONNECTED") cur.connected += 1;
    if (c.status === "ERROR") {
      cur.errors += 1;
      const preview = toSafeErrorPreview(c.lastError, 240);
      cur.lastErr = preview.text === "—" ? "Connection error" : preview.text;
      if (preview.redacted) cur.lastErrRedacted = true;
    }
    if (c.lastSyncAt && (!cur.lastSync || c.lastSyncAt > cur.lastSync)) cur.lastSync = c.lastSyncAt;
    byProvider.set(c.provider, cur);
  }

  const seen = new Set<IntegrationProvider>();
  for (const c of connections) seen.add(c.provider);

  const allProviders: IntegrationProvider[] =
    seen.size > 0 ? Array.from(seen) : ["MANUAL", "SHOPIFY", "WOOCOMMERCE", "UBER_EATS", "UBER_DIRECT"];

  const rows: PlatformIntegrationAggregateRow[] = allProviders.map((provider) => {
    const meta = baseMaturity(provider);
    const agg = byProvider.get(provider);
    const hasConnected = Boolean(agg && agg.connected > 0);
    const hasError = Boolean(agg && agg.errors > 0);
    return {
      provider,
      label: providerLabel(provider),
      maturity: refineMaturity(meta.maturity, hasConnected, hasError),
      workspaceCount: agg?.users.size ?? 0,
      connectionCount: agg?.total ?? 0,
      connectedCount: agg?.connected ?? 0,
      errorCount: agg?.errors ?? 0,
      lastSyncAt: agg?.lastSync ?? null,
      lastErrorSample: agg?.lastErr ?? null,
      lastErrorSampleRedacted: agg?.lastErrRedacted ?? false,
      worksSummary: meta.works,
      gapsSummary: meta.gaps,
      integrationHonestyNote: meta.note,
    };
  });

  rows.sort((a, b) => a.label.localeCompare(b.label));

  return { rows, webhookPending: pendingHooks, webhookFailedUnprocessed: failedHooks };
}

export async function loadPlatformWebhookHealth(): Promise<{
  pendingUnprocessed: number;
  failedUnprocessed: number;
  queuedJobs: number;
  retryingJobs: number;
  terminalFailedJobs: number;
  openRecoveryItems: number;
}> {
  const [
    pendingUnprocessed,
    failedUnprocessed,
    queuedJobs,
    retryingJobs,
    terminalFailedJobs,
    openRecoveryItems,
  ] = await Promise.all([
    prisma.webhookEvent.count({ where: { processed: false } }),
    prisma.webhookEvent.count({
      where: { processed: false, processingError: { not: null } },
    }),
    prisma.webhookProcessingJob.count({
      where: { status: WebhookProcessingJobStatus.QUEUED },
    }),
    prisma.webhookProcessingJob.count({
      where: { status: WebhookProcessingJobStatus.RETRYING },
    }),
    prisma.webhookProcessingJob.count({
      where: {
        status: {
          in: [
            WebhookProcessingJobStatus.FAILED,
            WebhookProcessingJobStatus.UNSUPPORTED,
            WebhookProcessingJobStatus.SIGNATURE_FAILED,
          ],
        },
      },
    }),
    prisma.errorRecoveryItem.count({
      where: {
        source: ErrorRecoverySource.WEBHOOK_JOB,
        status: ErrorRecoveryItemStatus.OPEN,
      },
    }),
  ]);
  return {
    pendingUnprocessed,
    failedUnprocessed,
    queuedJobs,
    retryingJobs,
    terminalFailedJobs,
    openRecoveryItems,
  };
}
