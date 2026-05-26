import Link from "next/link";

import { StorefrontFunnelCard } from "@/components/storefront/analytics/storefront-funnel-card";
import { StorefrontProductTable } from "@/components/storefront/analytics/storefront-product-table";
import { StorefrontSourceTable } from "@/components/storefront/analytics/storefront-source-table";
import { StorefrontTimeseriesChart } from "@/components/storefront/analytics/storefront-timeseries-chart";
import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { formatCurrency } from "@/lib/utils";
import { getStorefrontAnalyticsReport, type StorefrontAnalyticsRangeDays } from "@/services/storefront/storefront-analytics-report-service";

export const dynamic = "force-dynamic";

function daysParam(v: string | undefined): StorefrontAnalyticsRangeDays {
  if (v === "30") return 30;
  if (v === "90") return 90;
  return 7;
}

export default async function StorefrontAnalyticsPage({
  searchParams,
}: {
  searchParams?: Promise<{ days?: string }>;
}) {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const sp = searchParams ? await searchParams : {};
  const days = daysParam(sp.days);
  const sf = await findAdminStorefront(user.id, { id: true, storeSlug: true, currency: true });
  if (!sf) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Save storefront settings on Overview to see analytics.</p>
        <Button asChild variant="secondary" className="rounded-full">
          <Link href="/dashboard/storefront">Open overview</Link>
        </Button>
      </div>
    );
  }

  const report = await getStorefrontAnalyticsReport(sf.id, days);
  const empty = report.visits === 0 && Object.keys(report.conversionCounts).length === 0 && report.ordersCount === 0;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            First-party visits and conversion events from <span className="font-mono">/api/storefront/analytics</span>. Third-party
            pixels respect consent on the public storefront (see{" "}
            <Link href="/dashboard/storefront/seo" className="text-primary underline-offset-4 hover:underline">
              SEO &amp; social
            </Link>
            ).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[7, 30, 90].map((d) => (
            <Button key={d} asChild variant={days === d ? "default" : "outline"} size="sm" className="rounded-full">
              <Link href={`/dashboard/storefront/analytics?days=${d}`}>{d}d</Link>
            </Button>
          ))}
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/storefront/preview">Live preview</Link>
          </Button>
        </div>
      </div>

      {empty ? (
        <p className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-6 text-sm text-muted-foreground">
          No analytics in the last {days} days yet. Browse the public storefront to generate visits and events.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border/80 p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Visits</p>
          <p className="text-2xl font-semibold tabular-nums">{report.visits}</p>
        </div>
        <div className="rounded-2xl border border-border/80 p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Orders</p>
          <p className="text-2xl font-semibold tabular-nums">{report.ordersCount}</p>
        </div>
        <div className="rounded-2xl border border-border/80 p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Revenue (non-test)</p>
          <p className="text-2xl font-semibold tabular-nums">{formatCurrency(report.revenue, sf.currency)}</p>
        </div>
        <div className="rounded-2xl border border-border/80 p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Raw event rows</p>
          <p className="text-2xl font-semibold tabular-nums">
            {Object.values(report.conversionCounts).reduce((a, b) => a + b, 0)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StorefrontFunnelCard funnel={report.funnel} conversionRate={report.conversionRate} />
        <div className="rounded-2xl border border-border/80 p-4 shadow-sm">
          <p className="text-sm font-medium">Orders by day</p>
          <div className="mt-3">
            <StorefrontTimeseriesChart data={report.timeSeries} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 text-lg font-semibold">Top products</h2>
          <StorefrontProductTable rows={report.topProducts} />
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold">Traffic sources</h2>
          <StorefrontSourceTable rows={report.referrers} />
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Event names</p>
        <p className="mt-1">
          page_view, view_item, add_to_cart, cart_view, checkout_start, checkout_submit, order_created, order_confirmation_view,
          contact_submit, catering_inquiry_submit, and other structured form submits.
        </p>
      </div>
    </div>
  );
}
