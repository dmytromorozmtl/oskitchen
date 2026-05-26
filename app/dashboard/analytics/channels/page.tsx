import { AnalyticsBars } from "@/components/dashboard/analytics-bars";
import { AnalyticsFilterBar } from "@/components/dashboard/analytics-filter-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ANALYTICS_CHANNEL_LABEL } from "@/lib/analytics/channel-attribution";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { loadFilterableBrandsAndLocations } from "@/lib/analytics/server-helpers";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { formatCurrency } from "@/lib/utils";
import { loadExecutiveOverview } from "@/services/analytics/analytics-service";

export default async function ChannelsAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const sp = await searchParams;
  const filters = parseAnalyticsFilters(sp);
  const [{ brands, locations }, overview] = await Promise.all([
    loadFilterableBrandsAndLocations(dataUserId),
    loadExecutiveOverview({ userId: dataUserId }, filters),
  ]);

  const totalRev = overview.channelMix.reduce((a, b) => a + b.revenue, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Channel analytics</h1>
        <p className="text-muted-foreground">Revenue, order share, and fulfillment mix by attribution channel.</p>
      </div>
      <AnalyticsFilterBar filters={filters} basePath="/dashboard/analytics/channels" brands={brands} locations={locations} />

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Revenue per channel</CardTitle>
          <CardDescription>Sum of contributing order totals in the window.</CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsBars
            rows={overview.channelMix
              .filter((c) => c.revenue > 0 || c.orders > 0)
              .map((c) => ({ label: ANALYTICS_CHANNEL_LABEL[c.channel], value: c.revenue }))}
            formatValue={formatCurrency}
          />
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Channel detail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {overview.channelMix
            .filter((c) => c.revenue > 0 || c.orders > 0)
            .map((c) => (
              <div key={c.channel} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 px-3 py-2 text-sm">
                <div>
                  <p className="font-medium">{ANALYTICS_CHANNEL_LABEL[c.channel]}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.orders} orders · {totalRev > 0 ? `${Math.round((c.revenue / totalRev) * 100)}% revenue` : "0% revenue"}
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full tabular-nums">
                  {formatCurrency(c.revenue)}
                </Badge>
              </div>
            ))}
          {overview.channelMix.every((c) => c.revenue === 0 && c.orders === 0) ? (
            <p className="text-sm text-muted-foreground">No channel activity in window.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-sm">Attribution notes</CardTitle>
          <CardDescription className="text-xs">
            Orders with an import link are credited to their source provider.
            Orders linked to the Storefront are credited to STOREFRONT. Everything else is MANUAL.
            Imported orders that have been promoted to internal orders are counted only once, by the import side.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
