import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { PilotBetaSurfaceBanner } from "@/components/dashboard/pilot-beta-surface-banner";
import { ChannelCard } from "@/components/channels/channel-card";
import { CapabilityMatrixPanel } from "@/components/capabilities/capability-matrix-panel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getCachedWebhookEventListWhere } from "@/lib/scope/cached-workspace-resource-scope";
import { integrationConnectionListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { resolveAllChannels } from "@/lib/channels/channel-runtime";
import { channelsRecommendedForBusinessType } from "@/lib/channels/channel-registry";
import { loadSalesChannelMetrics } from "@/lib/channels/sales-channel-metrics";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { listCapabilities } from "@/services/capabilities/capability-service";

export default async function SalesChannelsOverviewPage() {
  const { userId } = await getTenantActor();
  const [connections, kitchen, metrics] = await Promise.all([
    prisma.integrationConnection.findMany({
      where: await integrationConnectionListWhereForOwner(userId),
      orderBy: { updatedAt: "desc" },
    }),
    prisma.kitchenSettings.findUnique({ where: { userId } }),
    loadSalesChannelMetrics(userId),
  ]);

  const workspaceDemo = kitchen?.demoMode ?? false;
  const resolved = resolveAllChannels(connections, workspaceDemo);
  const recommended = channelsRecommendedForBusinessType(kitchen?.businessType ?? null);
  const recKeys = new Set(recommended.map((c) => c.providerKey));

  const attention = resolved.filter(
    (c) =>
      c.effectiveStatus === "ERROR" ||
      c.effectiveStatus === "NEEDS_CREDENTIALS" ||
      c.effectiveStatus === "PARTNER_ACCESS_REQUIRED",
  );

  const webhookWhere = await getCachedWebhookEventListWhere();
  const recentEvents = await prisma.webhookEvent.findMany({
    where: webhookWhere,
    orderBy: { receivedAt: "desc" },
    take: 8,
    select: {
      id: true,
      provider: true,
      topic: true,
      processed: true,
      signatureValid: true,
      receivedAt: true,
    },
  });

  const capabilities = listCapabilities();

  return (
    <div className="space-y-8">
      <PilotBetaSurfaceBanner
        title="Sales channel integrations"
        description="WooCommerce and Shopify connectors are beta. Run certification on your test shop before go-live; high-volume sites should enable the async webhook queue."
      />
      <CapabilityMatrixPanel rows={capabilities} title="Capabilities (read-only)" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Connected integrations</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{metrics.connectedCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Live channels (catalog)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{metrics.liveChannelsCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Needs credentials</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{metrics.needsCredentialsCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Partner-gated</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{metrics.partnerRequiredCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Workspace health (estimate)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{metrics.healthScore}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Orders today (Order hub)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{metrics.ordersToday}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Storefront checkouts today</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">
            {metrics.storefrontOrdersToday}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Webhook queue / issues</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{metrics.webhookFailures}</CardContent>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Next best action</CardTitle>
            <CardDescription>Based on credentials, webhooks, imports, and mapping backlog.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{metrics.nextBestAction}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Last successful sync</CardTitle>
            <CardDescription>Latest lastSyncAt across API connections.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {metrics.lastSuccessfulSyncLabel
              ? formatDistanceToNow(new Date(metrics.lastSuccessfulSyncLabel), { addSuffix: true })
              : "No sync timestamps yet."}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Orders & revenue today by source</CardTitle>
          <CardDescription>
            Revenue sums OS Kitchen Order.total for orders created today; slices are mutually
            exclusive heuristics (manual = no storefront link and no known import provider).
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto text-sm">
          <table className="w-full min-w-[480px] text-left">
            <thead>
              <tr className="border-b border-border/60 text-xs text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Source</th>
                <th className="py-2 pr-3 font-medium">Orders</th>
                <th className="py-2 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {metrics.ordersTodayByChannel.map((row) => (
                <tr key={row.key} className="border-b border-border/40">
                  <td className="py-2 pr-3">{row.label}</td>
                  <td className="py-2 pr-3 tabular-nums">{row.orders}</td>
                  <td className="py-2 tabular-nums">{formatCurrency(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Setup checklist</CardTitle>
            <CardDescription>Prioritized for {kitchen?.businessType ?? "your"} mode.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Enable OS Kitchen storefront or confirm manual order flow.</p>
            <p>2. Connect WooCommerce / Shopify with encrypted credentials + webhooks.</p>
            <p>3. Map unmatched catalog SKUs before high-volume sync.</p>
            <p>4. Review webhook log after first live events.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Failed external imports</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metrics.failedExternalImports}</CardContent>
          <Button asChild variant="link" className="h-auto px-0 text-xs">
            <Link href="/dashboard/sales-channels/attention">Review attention tab →</Link>
          </Button>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Unmapped external products</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metrics.unmatchedProducts}</CardContent>
          <Button asChild variant="link" className="h-auto px-0 text-xs">
            <Link href="/dashboard/sales-channels/mapping">Open mapping →</Link>
          </Button>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" className="rounded-full">
          <Link href="/dashboard/order-hub">Order hub</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/outbound-webhooks">Outbound webhooks</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/extensions">Extensions catalog</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/orders/quick">Quick manual order</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/import-center">Import center</Link>
        </Button>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Recommended for your mode
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {resolved
            .filter((c) => recKeys.has(c.providerKey))
            .map((c) => (
              <ChannelCard key={c.providerKey} row={c} />
            ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Needs attention
        </h2>
        {attention.length === 0 ? (
          <p className="text-sm text-muted-foreground">No credential or partner issues flagged.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {attention.map((c) => (
              <ChannelCard key={`a-${c.providerKey}`} row={c} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          All channels
        </h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {resolved.map((c) => (
            <ChannelCard key={c.providerKey} row={c} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Recent webhook activity
        </h2>
        <Card>
          <CardContent className="divide-y divide-border/60 p-0 text-sm">
            {recentEvents.length === 0 ? (
              <p className="p-4 text-muted-foreground">No webhook events yet.</p>
            ) : (
              recentEvents.map((e) => (
                <div key={e.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <span className="font-medium">{e.provider}</span>
                  <span className="text-muted-foreground">{e.topic}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(e.receivedAt, { addSuffix: true })} · sig{" "}
                    {e.signatureValid ? "ok" : "fail"} · {e.processed ? "processed" : "pending"}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Button asChild variant="link" className="mt-2 h-auto px-0 text-sm">
          <Link href="/dashboard/sales-channels/webhooks">Open full webhook center →</Link>
        </Button>
      </div>
    </div>
  );
}
