import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { runIntegrationHealthCheckFormAction } from "@/actions/integration-health";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  getCachedIntegrationConnectionListWhere,
  getCachedWebhookEventListWhere,
} from "@/lib/scope/cached-workspace-resource-scope";
import { loadSalesChannelMetrics } from "@/lib/channels/sales-channel-metrics";
import { prisma } from "@/lib/prisma";

export default async function SalesChannelsHealthPage() {
  const { userId } = await getTenantActor();

  const [connectionWhere, webhookWhere] = await Promise.all([
    getCachedIntegrationConnectionListWhere(),
    getCachedWebhookEventListWhere(),
  ]);
  const [connections, webhookFailCount, metrics] = await Promise.all([
    prisma.integrationConnection.findMany({
      where: connectionWhere,
      orderBy: { updatedAt: "desc" },
      include: {
        healthChecks: { orderBy: { checkedAt: "desc" }, take: 1 },
      },
    }),
    prisma.webhookEvent.count({
      where: { AND: [webhookWhere, { processed: false, signatureValid: false }] },
    }),
    loadSalesChannelMetrics(userId),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Channel health</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Workspace score blends connection errors, webhook backlog, failed imports, and mapping
            debt — per-connection checks below add latency evidence from manual probes.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/health">Legacy URL</Link>
        </Button>
      </div>

      {webhookFailCount > 0 ? (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-base">Webhook attention</CardTitle>
            <CardDescription>
              {webhookFailCount} event(s) with invalid signature or still unprocessed — inspect the
              webhook center.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" className="rounded-full">
              <Link href="/dashboard/sales-channels/webhooks">Open webhooks</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workspace channel score</CardTitle>
          <CardDescription>Heuristic 0–100 from the command center metrics engine.</CardDescription>
        </CardHeader>
        <CardContent className="text-3xl font-semibold tabular-nums">{metrics.healthScore}</CardContent>
      </Card>

      <div className="grid gap-4">
        {connections.map((c) => {
          const last = c.healthChecks[0];
          return (
            <Card key={c.id} className="border-border/80">
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">
                    {c.name}{" "}
                    <span className="text-xs font-normal text-muted-foreground">{c.provider}</span>
                  </CardTitle>
                  <CardDescription>
                    Status: {c.status}
                    {c.lastSyncAt
                      ? ` · last sync ${formatDistanceToNow(c.lastSyncAt, { addSuffix: true })}`
                      : ""}
                  </CardDescription>
                </div>
                <form action={runIntegrationHealthCheckFormAction}>
                  <input type="hidden" name="connectionId" value={c.id} />
                  <Button type="submit" size="sm" className="rounded-full" variant="outline">
                    Check health
                  </Button>
                </form>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {last ? (
                  <p>
                    Last check: {last.status} · {last.latencyMs}ms ·{" "}
                    {formatDistanceToNow(last.checkedAt, { addSuffix: true })}
                    {last.errorMessage ? ` — ${last.errorMessage}` : ""}
                  </p>
                ) : (
                  <p>No health checks yet — run a manual check.</p>
                )}
              </CardContent>
            </Card>
          );
        })}
        {!connections.length ? (
          <p className="text-sm text-muted-foreground">No API connections yet — storefront and manual still work.</p>
        ) : null}
      </div>
    </div>
  );
}
