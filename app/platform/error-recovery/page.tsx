import Link from "next/link";

import { canManageProductionIncidentsForUser } from "@/actions/production-incidents";
import { IntegrationActionButton } from "@/components/integrations/integration-action-button";
import { PlatformErrorRecoveryAttentionStrip } from "@/components/platform/platform-error-recovery-attention-strip";
import { PlatformProductionIncidentPanel } from "@/components/platform/production-incident-panel";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  listProductionIncidentAssignees,
  loadProductionIncidentRollup,
} from "@/services/incidents/production-incident-rollup-service";
import { listPlatformErrorEvents } from "@/services/observability/error-event-service";
import { getPlatformDashboardSnapshot } from "@/services/platform/platform-service";

export default async function PlatformErrorRecoveryPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:access");
  const [s, incidentRollup, assignees, canManageIncidents, recentEvents] = await Promise.all([
    getPlatformDashboardSnapshot(),
    loadProductionIncidentRollup(),
    listProductionIncidentAssignees(),
    canManageProductionIncidentsForUser({ id: ctx.userId, email: ctx.email }),
    listPlatformErrorEvents(8),
  ]);

  const snapshot = {
    webhookPending: s.webhookPending,
    integrationErrors: s.integrationErrors,
    automationFailures: s.automationFailures,
    openTickets: s.openTickets,
    criticalTickets: s.criticalTickets,
    activeIncidents: s.activeIncidents,
    criticalProductionIncidents: s.criticalProductionIncidents,
  } as const;

  const tiles = [
    {
      title: "Webhook backlog (all tenants)",
      count: s.webhookPending,
      href: "/platform/webhooks",
      detail: "Investigate signing, retries, and dead-letter patterns.",
    },
    {
      title: "Integration errors",
      count: s.integrationErrors,
      href: "/platform/integrations",
      detail: "OAuth / token / remote API failures aggregated globally.",
    },
    {
      title: "Automation failures",
      count: s.automationFailures,
      href: "/platform/automations",
      detail: "Failed playbook or automation executions.",
    },
    {
      title: "Open support tickets",
      count: s.openTickets,
      href: "/platform/support",
      detail: "Customer-visible issues requiring operator response.",
    },
    {
      title: "Critical tickets",
      count: s.criticalTickets,
      href: "/platform/support/escalations",
      detail: "Highest priority incidents.",
    },
  ] as const;

  return (
    <div className="space-y-8 text-zinc-100">
      <div>
        <h1 className="text-2xl font-semibold">Error recovery (platform)</h1>
        <p className="mt-1 max-w-3xl text-sm text-zinc-400">
          Cross-tenant triage for failed pipelines. Individual workspace detail remains in each tenant&apos;s
          dashboard error recovery view.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-xs text-zinc-400">
        <p className="font-medium text-zinc-200">Replay / retry honesty</p>
        <p className="mt-1">
          Cross-tenant views never imply tenant-scoped repairs completed. Buttons stay inert until audited mutations
          exist.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <IntegrationActionButton action="webhook_replay" context={{ isPlatform: true }} variant="inline" />
          <IntegrationActionButton action="integration_retry" context={{ isPlatform: true }} variant="inline" />
        </div>
      </div>

      <PlatformErrorRecoveryAttentionStrip snapshot={snapshot} recentEvents={recentEvents} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tiles.map((t) => (
          <Card key={t.href} className="border-zinc-800 bg-zinc-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white">{t.title}</CardTitle>
              <CardDescription className="text-zinc-500">{t.detail}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-2">
              <p className="text-3xl font-semibold tabular-nums text-white">{t.count}</p>
              <Button asChild variant="link" className="text-amber-200">
                <Link href={t.href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <PlatformProductionIncidentPanel
        title="Production incident queue"
        description="Same persistent workflow used by platform health, webhook triage, and source-specific ops pages. Use this panel when a recovery blocker crosses into platform-level incident management."
        incidents={incidentRollup.items}
        assignees={assignees}
        canManage={canManageIncidents}
        emptyLabel="No active production incidents are currently open."
        ctaHref="/platform/incidents"
        ctaLabel="Open platform incident hub"
        maxItems={4}
      />
    </div>
  );
}
