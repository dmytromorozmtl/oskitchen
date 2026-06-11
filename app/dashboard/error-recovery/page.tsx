import { ErrorRecoveryAttentionStrip } from "@/components/dashboard/error-recovery-attention-strip";
import { ErrorRecoveryTileNextAction } from "@/components/dashboard/error-recovery-tile-next-action";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IntegrationActionButton } from "@/components/integrations/integration-action-button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  externalOrderListWhereForOwner,
  externalProductListWhereForOwner,
} from "@/lib/scope/workspace-channel-scope";
import {
  integrationConnectionListWhereForOwner,
  webhookEventListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { loadProductionCronExecutionAudit } from "@/services/cron/cron-execution-evidence";
import { loadProductionIncidentRollup } from "@/services/incidents/production-incident-rollup-service";
import { listWorkspaceErrorEvents } from "@/services/observability/error-event-service";
import type { ErrorRecoveryTileId } from "@/lib/error-recovery/error-recovery-focus-era18";
import { IntegrationStatus } from "@prisma/client";

export default async function ErrorRecoveryPage() {
  const { userId } = await getTenantActor();

  const [webhookWhere, integrationWhere, externalOrderWhere, externalProductWhere] =
    await Promise.all([
      webhookEventListWhereForOwner(userId),
      integrationConnectionListWhereForOwner(userId),
      externalOrderListWhereForOwner(userId),
      externalProductListWhereForOwner(userId),
    ]);

  const [
    failedWebhooks,
    errorIntegrations,
    failedExternalOrders,
    failedImports,
    unmappedProducts,
    cronAudit,
    incidentRollup,
    recentEvents,
  ] = await Promise.all([
    prisma.webhookEvent.count({ where: { AND: [webhookWhere, { processed: false }] } }),
    prisma.integrationConnection.count({
      where: { AND: [integrationWhere, { status: IntegrationStatus.ERROR }] },
    }),
    prisma.externalOrder.count({
      where: { AND: [externalOrderWhere, { syncStatus: "FAILED" }] },
    }),
    prisma.importJob.count({
      where: { userId, status: "FAILED" },
    }),
    prisma.externalProduct.count({
      where: { AND: [externalProductWhere, { mappedProductId: null }] },
    }),
    loadProductionCronExecutionAudit(),
    loadProductionIncidentRollup(userId),
    listWorkspaceErrorEvents(userId, 8),
  ]);

  const snapshot = {
    failedWebhooks,
    errorIntegrations,
    failedExternalOrders,
    failedImports,
    unmappedProducts,
    cronOpenIncidents: cronAudit.summary.openIncidents,
    cronStalledEscalations: cronAudit.summary.stalledAutoEscalations,
    productionIncidentsOpen: incidentRollup.summary.open,
    productionIncidentsCritical: incidentRollup.summary.critical,
  } as const;

  const tiles: {
    id: ErrorRecoveryTileId;
    title: string;
    count: number | null;
    href: string;
    detail: string;
    criticalCount?: number;
    stalledEscalations?: number;
  }[] = [
    {
      id: "webhooks-queued",
      title: "Webhooks queued (unprocessed)",
      count: failedWebhooks,
      href: "/dashboard/sales-channels/webhooks",
      detail: "Unprocessed events — may include normal backlog; inspect errors separately in Webhooks.",
    },
    {
      id: "integration-errors",
      title: "Integration errors",
      count: errorIntegrations,
      href: "/dashboard/sales-channels/health",
      detail: "OAuth, scopes, or remote API failures.",
    },
    {
      id: "failed-channel-orders",
      title: "Failed channel orders",
      count: failedExternalOrders,
      href: "/dashboard/order-hub",
      detail: "Rows that never became OS Kitchen orders.",
    },
    {
      id: "import-jobs",
      title: "Import jobs (failed / partial)",
      count: failedImports,
      href: "/dashboard/import-center/history",
      detail: "CSV / connector uploads needing fixes.",
    },
    {
      id: "unmapped-catalog",
      title: "Unmapped catalog rows",
      count: unmappedProducts,
      href: "/dashboard/product-mapping",
      detail: "External SKUs without menu linkage.",
    },
    {
      id: "cron-attention",
      title: "Cron execution attention",
      count: cronAudit.summary.openIncidents,
      href: "/dashboard/system-health/cron-execution",
      detail: `Production cron incidents that are stale/failing and not yet acknowledged. Stalled escalations: ${cronAudit.summary.stalledAutoEscalations}, auto-escalated: ${cronAudit.summary.autoEscalatedIncidents}.`,
      stalledEscalations: cronAudit.summary.stalledAutoEscalations,
    },
    {
      id: "production-incidents",
      title: "Production incidents",
      count: incidentRollup.summary.open,
      href: "/dashboard/system-health/incidents",
      detail: `Unified incident queue across startup readiness, critical cron incidents, and webhook recovery. Critical: ${incidentRollup.summary.critical}.`,
      criticalCount: incidentRollup.summary.critical,
    },
    {
      id: "data-integrity",
      title: "Data integrity workspace",
      count: null,
      href: "/dashboard/system-health/data-integrity",
      detail: "Structural checks (empty orders, missing prices, etc.).",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Error recovery</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          One hub for operational failures across webhooks, imports, channels, and catalog mapping.
          Links open the owning module — use tasks to assign follow-up.
        </p>
      </div>

      <ErrorRecoveryAttentionStrip snapshot={snapshot} recentEvents={recentEvents} />

      <div className="rounded-lg border border-border/80 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Webhook replay & integration retry</p>
        <p className="mt-1 text-xs">
          UI stays honest until real server actions are registered — no fake audit entries are written from disabled
          controls.
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs">
          <IntegrationActionButton action="webhook_replay" variant="inline" />
          <IntegrationActionButton action="integration_retry" variant="inline" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tiles.map((t) => (
          <Card key={t.id} className="border-border/80 bg-card/90 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t.title}</CardTitle>
              <CardDescription>{t.detail}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-2">
              {t.count !== null ? (
                <p className="text-3xl font-semibold tabular-nums">{t.count}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Open checker</p>
              )}
              <ErrorRecoveryTileNextAction
                tileId={t.id}
                context={{
                  count: t.count,
                  criticalCount: t.criticalCount,
                  stalledEscalations: t.stalledEscalations,
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
