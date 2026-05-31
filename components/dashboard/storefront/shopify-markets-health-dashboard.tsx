"use client";

import { useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { Activity, HeartPulse, Loader2 } from "lucide-react";
import Link from "next/link";

import { runFullShopifyMarketsReconcileAction } from "@/actions/shopify-markets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  healthLevelLabel,
  SHOPIFY_MARKETS_HEALTH_DASHBOARD_HONESTY,
  type ShopifyMarketsHealthSnapshot,
} from "@/lib/commercial/shopify-markets-health-dashboard";
import type { ShopifyMarketsSyncSettings } from "@/lib/integrations/shopify-markets-settings";

type ShopifyMarketsHealthDashboardProps = {
  connectionId: string | null;
  hasCredentials: boolean;
  canManage: boolean;
  snapshot: ShopifyMarketsHealthSnapshot;
  syncSettings: ShopifyMarketsSyncSettings | null;
};

function levelBadgeVariant(
  level: string,
): "outline" | "secondary" | "destructive" {
  if (level === "healthy") return "outline";
  if (level === "attention") return "secondary";
  return "destructive";
}

export function ShopifyMarketsHealthDashboard({
  connectionId,
  hasCredentials,
  canManage,
  snapshot,
  syncSettings,
}: ShopifyMarketsHealthDashboardProps) {
  const [reconcilePending, startReconcile] = useTransition();

  return (
    <Card id="shopify-markets-health" className="scroll-mt-24 border-border/80">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <HeartPulse className="h-4 w-4" />
              Markets health — Phase 10 BETA
            </CardTitle>
            <CardDescription>
              Operational snapshot across discovery, prices, catalog, tax guard, hostname routing,
              and webhook registry for linked Shopify markets.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={levelBadgeVariant(snapshot.overallLevel)}>
              {healthLevelLabel(snapshot.overallLevel)}
            </Badge>
            <Badge variant="outline">Score {snapshot.overallScore}/100</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">{SHOPIFY_MARKETS_HEALTH_DASHBOARD_HONESTY}</p>

        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary">
            {snapshot.linkedMarkets}/{snapshot.totalMarkets} linked
          </Badge>
          {snapshot.syncModeSummary.bidirectional > 0 ? (
            <Badge variant="outline">{snapshot.syncModeSummary.bidirectional} bidirectional</Badge>
          ) : null}
          {snapshot.syncModeSummary.import > 0 ? (
            <Badge variant="outline">{snapshot.syncModeSummary.import} import</Badge>
          ) : null}
          {snapshot.syncModeSummary.push > 0 ? (
            <Badge variant="outline">{snapshot.syncModeSummary.push} push</Badge>
          ) : null}
          {snapshot.openPriceConflicts + snapshot.openCatalogConflicts > 0 ? (
            <Badge variant="destructive">
              {snapshot.openPriceConflicts + snapshot.openCatalogConflicts} sync conflict(s)
            </Badge>
          ) : null}
          {snapshot.webhookDriftCount > 0 ? (
            <Badge variant="destructive">{snapshot.webhookDriftCount} webhook drift</Badge>
          ) : null}
        </div>

        {canManage && connectionId && hasCredentials ? (
          <Button
            type="button"
            size="sm"
            className="rounded-full"
            disabled={reconcilePending}
            onClick={() =>
              startReconcile(async () => {
                await runFullShopifyMarketsReconcileAction(connectionId);
              })
            }
          >
            {reconcilePending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Activity className="h-4 w-4" />
            )}
            <span className="ml-2">Run full reconcile</span>
          </Button>
        ) : null}

        {syncSettings?.lastFullMarketsReconcileAt ? (
          <p className="text-xs text-muted-foreground">
            Last full reconcile{" "}
            {formatDistanceToNow(new Date(syncSettings.lastFullMarketsReconcileAt), {
              addSuffix: true,
            })}
            {syncSettings.lastFullMarketsReconcileResult ? (
              <> · {syncSettings.lastFullMarketsReconcileResult}</>
            ) : null}
          </p>
        ) : null}

        <div className="grid gap-2 sm:grid-cols-2">
          {snapshot.domains.map((domain) => (
            <Link
              key={domain.key}
              href={domain.linkHref}
              className="rounded-lg border border-border/70 p-3 text-xs transition-colors hover:bg-muted/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-foreground">{domain.label}</span>
                <Badge variant={levelBadgeVariant(domain.level)}>{healthLevelLabel(domain.level)}</Badge>
              </div>
              <p className="mt-1 text-muted-foreground">{domain.summary}</p>
              {domain.lastActivityAt ? (
                <p className="mt-1 text-muted-foreground">
                  Last activity{" "}
                  {formatDistanceToNow(new Date(domain.lastActivityAt), { addSuffix: true })}
                </p>
              ) : null}
            </Link>
          ))}
        </div>

        {snapshot.recommendations.length > 0 ? (
          <div className="rounded-lg border border-border/70 bg-muted/15 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Recommendations</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {snapshot.recommendations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
