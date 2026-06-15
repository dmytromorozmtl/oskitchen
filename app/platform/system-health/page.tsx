import { PlatformSystemHealthAttentionStrip } from "@/components/platform/platform-system-health-attention-strip";
import { PlatformSystemHealthTileNextAction } from "@/components/platform/platform-system-health-tile-next-action";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadPlatformObservabilityPanel } from "@/services/observability/observability-service";
import { getPlatformDashboardSnapshot } from "@/services/platform/platform-service";
import type { PlatformSystemHealthTileId } from "@/lib/system-health/system-health-focus-era18";

export default async function PlatformSystemHealthPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:access");
  const [s, obs] = await Promise.all([
    getPlatformDashboardSnapshot(),
    loadPlatformObservabilityPanel(),
  ]);

  const snapshot = {
    rollup: obs.rollup,
    webhookPending: s.webhookPending,
    integrationErrors: s.integrationErrors,
    automationFailures: s.automationFailures,
    openTickets: s.openTickets,
    criticalTickets: s.criticalTickets,
    activeIncidents: s.activeIncidents,
    criticalProductionIncidents: s.criticalProductionIncidents,
    webhookProcessingErrors7d: obs.counts.webhookProcessingErrors7d,
    openWebhookJobRecoveries: obs.counts.openWebhookJobRecoveries,
    channelSyncFailed: obs.counts.channelSyncFailed,
    notificationFailures7d: obs.counts.notificationFailures7d,
  } as const;

  return (
    <div className="space-y-8 text-zinc-100">
      <div>
        <h1 className="text-2xl font-semibold">System health (platform)</h1>
        <p className="mt-1 max-w-3xl text-sm text-zinc-400">
          Cross-tenant operational signals. Revenue figures stay honest — only show aggregates backed by
          Stripe or warehouse exports.
        </p>
      </div>

      <PlatformSystemHealthAttentionStrip snapshot={snapshot} recentEvents={obs.events} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Tile id="webhook-backlog" title="Webhook backlog (all)" value={s.webhookPending} />
        <Tile id="integration-errors" title="Integration errors" value={s.integrationErrors} />
        <Tile id="automation-failures" title="Automation failures" value={s.automationFailures} />
        <Tile id="open-tickets" title="Open tickets" value={s.openTickets} />
        <Tile id="critical-tickets" title="Critical tickets" value={s.criticalTickets} />
        <Tile id="workspaces" title="Workspaces" value={s.workspaces} />
      </div>

      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-base text-white">Recent platform audit</CardTitle>
          <CardDescription className="text-zinc-500">Latest platform-scoped audit entries.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-300">
          {s.recentPlatformAudit.length === 0 ? (
            <p className="text-zinc-500">No recent entries.</p>
          ) : (
            s.recentPlatformAudit.map((row) => (
              <div key={row.id} className="flex flex-col rounded-lg border border-zinc-800 px-3 py-2">
                <span className="font-medium text-white">{row.action}</span>
                <span className="text-xs text-zinc-500">
                  {row.createdAt.toISOString().slice(0, 19)} · {row.entityType ?? "—"}{" "}
                  {row.entityLabel ? `· ${row.entityLabel}` : ""}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Tile({ id, title, value }: { id: PlatformSystemHealthTileId; title: string; value: number }) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2">
        <p className="text-3xl font-semibold tabular-nums text-white">{value}</p>
        <PlatformSystemHealthTileNextAction tileId={id} value={value} />
      </CardContent>
    </Card>
  );
}
