import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { runIntegrationHealthCheckFormAction } from "@/actions/integration-health";
import { ChannelLiveProofStatusPanel } from "@/components/dashboard/channel-live-proof-status-panel";
import { IntegrationHealthAttentionStrip } from "@/components/dashboard/integration-health-attention-strip";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getServerEnv } from "@/lib/env";
import {
  buildIntegrationHealthFocusSnapshot,
} from "@/lib/integrations/integration-health-focus-era18";
import {
  liveProofSliceForProvider,
  mergeLiveProofIntoIntegrationHealthSnapshot,
  resolveSalesChannelHealthConnectionNextActionWithLiveProof,
  salesChannelHealthLiveProofPanelHref,
} from "@/lib/integrations/integration-health-live-proof-focus-era18";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  getCachedIntegrationConnectionListWhere,
  getCachedWebhookEventListWhere,
} from "@/lib/scope/cached-workspace-resource-scope";
import { loadSalesChannelMetrics } from "@/lib/channels/sales-channel-metrics";
import { prisma } from "@/lib/prisma";
import {
  listChannelPilotLiveProofSlices,
  listIntegrationHealthCards,
  summarizeIntegrationHealth,
} from "@/services/developer/integration-health-service";

export default async function SalesChannelsHealthPage() {
  const { userId } = await getTenantActor();
  const env = getServerEnv();

  const [connectionWhere, webhookWhere] = await Promise.all([
    getCachedIntegrationConnectionListWhere(),
    getCachedWebhookEventListWhere(),
  ]);
  const [connections, webhookFailCount, unprocessedWebhookCount, metrics, healthCards, liveProofSlices] =
    await Promise.all([
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
      prisma.webhookEvent.count({
        where: { AND: [webhookWhere, { processed: false }] },
      }),
      loadSalesChannelMetrics(userId),
      listIntegrationHealthCards(userId),
      listChannelPilotLiveProofSlices(userId),
    ]);

  const stripeConfigured = Boolean(
    env.STRIPE_SECRET_KEY?.trim() && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim(),
  );
  const emailConfigured = Boolean(env.RESEND_API_KEY?.trim() && env.RESEND_FROM_EMAIL?.trim());
  const healthSummary = summarizeIntegrationHealth(healthCards, {
    stripe: stripeConfigured,
    email: emailConfigured,
  });
  const focusSnapshot = mergeLiveProofIntoIntegrationHealthSnapshot(
    buildIntegrationHealthFocusSnapshot({
      summary: healthSummary,
      cards: healthCards,
      failedWebhookCount: unprocessedWebhookCount,
    }),
    liveProofSlices,
  );
  const healthCardById = new Map(healthCards.map((card) => [card.id, card]));
  const liveProofPanelHref = salesChannelHealthLiveProofPanelHref();

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
          <Link href="/dashboard/integration-health">Full integration health</Link>
        </Button>
      </div>

      <IntegrationHealthAttentionStrip
        snapshot={focusSnapshot}
        liveProofPanelHref={liveProofPanelHref}
      />

      <ChannelLiveProofStatusPanel slices={liveProofSlices} />

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
          const healthCard = healthCardById.get(c.id);
          const liveProofSlice = healthCard
            ? liveProofSliceForProvider(liveProofSlices, healthCard.provider)
            : null;
          const nextAction = healthCard
            ? resolveSalesChannelHealthConnectionNextActionWithLiveProof(
                healthCard,
                liveProofSlice,
                last ?? null,
              )
            : null;

          return (
            <Card key={c.id} className="border-border/80" data-testid={`sales-channel-health-${c.id}`}>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
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
                  {nextAction ? (
                    <p className="mt-2 text-sm">
                      <span className="text-muted-foreground">Next: </span>
                      <Link
                        href={nextAction.href}
                        data-testid={`sales-channel-health-next-${c.id}`}
                        className={
                          nextAction.tone === "urgent"
                            ? "font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-200"
                            : "font-medium text-primary underline-offset-2 hover:underline"
                        }
                      >
                        {nextAction.label}
                      </Link>
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">Next: On track — run check to verify.</p>
                  )}
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
