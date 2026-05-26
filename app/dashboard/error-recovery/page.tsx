import Link from "next/link";

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
  ]);

  const tiles = [
    {
      title: "Webhooks queued (unprocessed)",
      count: failedWebhooks,
      href: "/dashboard/sales-channels/webhooks",
      detail: "Unprocessed events — may include normal backlog; inspect errors separately in Webhooks.",
    },
    {
      title: "Integration errors",
      count: errorIntegrations,
      href: "/dashboard/sales-channels/health",
      detail: "OAuth, scopes, or remote API failures.",
    },
    {
      title: "Failed channel orders",
      count: failedExternalOrders,
      href: "/dashboard/order-hub",
      detail: "Rows that never became KitchenOS orders.",
    },
    {
      title: "Import jobs (failed / partial)",
      count: failedImports,
      href: "/dashboard/import-center/history",
      detail: "CSV / connector uploads needing fixes.",
    },
    {
      title: "Unmapped catalog rows",
      count: unmappedProducts,
      href: "/dashboard/product-mapping",
      detail: "External SKUs without menu linkage.",
    },
    {
      title: "Cron execution attention",
      count: cronAudit.summary.openIncidents,
      href: "/dashboard/system-health/cron-execution",
      detail: `Production cron incidents that are stale/failing and not yet acknowledged. Stalled escalations: ${cronAudit.summary.stalledAutoEscalations}, auto-escalated: ${cronAudit.summary.autoEscalatedIncidents}.`,
    },
    {
      title: "Production incidents",
      count: incidentRollup.summary.open,
      href: "/dashboard/system-health/incidents",
      detail: `Unified incident queue across startup readiness, critical cron incidents, and webhook recovery. Critical: ${incidentRollup.summary.critical}.`,
    },
    {
      title: "Data integrity workspace",
      count: null,
      href: "/dashboard/system-health/data-integrity",
      detail: "Structural checks (empty orders, missing prices, etc.).",
    },
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Error recovery</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          One hub for operational failures across webhooks, imports, channels, and catalog mapping.
          Links open the owning module — use tasks to assign follow-up.
        </p>
      </div>

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
          <Card key={t.href} className="border-border/80 bg-card/90 shadow-sm">
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
              <Link
                href={t.href}
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Open
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
