"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { chartAxisChrome, chartSeriesColor, colorVar } from "@/lib/design/color-tokens";
import type { PlatformMarketplaceAnalyticsModel } from "@/services/marketplace/platform-marketplace-analytics-service";

function formatMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** METRIC_CARD_EXCEPTION — platform admin dark zinc chrome, not dashboard MetricCard tokens. */
function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}

export function MarketplaceAnalyticsAdminClient({ model }: { model: PlatformMarketplaceAnalyticsModel }) {
  const gmvChange =
    model.gmvPrev30d > 0
      ? Math.round(((model.gmv30d - model.gmvPrev30d) / model.gmvPrev30d) * 100)
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <a href="/api/platform/marketplace/analytics/export">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </a>
        </Button>
        <Badge variant="outline" className="rounded-full border-zinc-700 text-zinc-400">
          Featured placement revenue pending featured-service module
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="GMV (30d)"
          value={formatMoney(model.gmv30d, model.currency)}
          hint={`${model.orders30d} orders${gmvChange != null ? ` · ${gmvChange >= 0 ? "+" : ""}${gmvChange}% vs prior 30d` : ""}`}
        />
        <MetricCard
          label="Commission revenue (30d)"
          value={formatMoney(model.commissionRevenue30d, model.currency)}
          hint={`All time ${formatMoney(model.commissionRevenueAllTime, model.currency)}`}
        />
        <MetricCard
          label="Featured placement revenue (30d)"
          value={formatMoney(model.featuredPlacementRevenue30d, model.currency)}
          hint="Populated when featured placements ship"
        />
        <MetricCard
          label="Active vendors / buyers"
          value={`${model.vendorMetrics.active} / ${model.buyerMetrics.active}`}
          hint="Last 30 days"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h2 className="text-lg font-semibold text-white">GMV over time</h2>
          <p className="mb-4 text-sm text-zinc-400">Monthly gross marketplace volume (12 months).</p>
          <div className="h-72">
            {model.gmvTrend.every((point) => point.gmv === 0) ? (
              <p className="text-sm text-zinc-500">No GMV recorded yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={model.gmvTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartAxisChrome.gridStroke} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: chartAxisChrome.tickFill }} />
                  <YAxis tick={{ fontSize: 11, fill: chartAxisChrome.tickFill }} />
                  <Tooltip
                    contentStyle={{
                      background: chartAxisChrome.tooltipBackground,
                      border: `1px solid ${chartAxisChrome.tooltipBorder}`,
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="gmv"
                    name="GMV"
                    stroke={colorVar.warning}
                    fill={`color-mix(in srgb, ${colorVar.warning} 20%, transparent)`}
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke={colorVar.info}
                    fill={`color-mix(in srgb, ${colorVar.info} 20%, transparent)`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h2 className="text-lg font-semibold text-white">Revenue by category</h2>
          <p className="mb-4 text-sm text-zinc-400">Line-item revenue in the last 30 days.</p>
          <div className="h-72">
            {model.revenueByCategory.length === 0 ? (
              <p className="text-sm text-zinc-500">No category revenue yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={model.revenueByCategory}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {model.revenueByCategory.map((_, index) => (
                      <Cell key={index} fill={chartSeriesColor(index)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatMoney(value, model.currency)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h2 className="text-lg font-semibold text-white">Revenue by vendor tier</h2>
          <p className="mb-4 text-sm text-zinc-400">GMV grouped by vendor subscription plan (30d).</p>
          <div className="h-64">
            {model.revenueByVendorTier.length === 0 ? (
              <p className="text-sm text-zinc-500">No tier revenue yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={model.revenueByVendorTier}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartAxisChrome.gridStroke} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: chartAxisChrome.tickFill }} />
                  <YAxis tick={{ fontSize: 11, fill: chartAxisChrome.tickFill }} />
                  <Tooltip formatter={(value: number) => formatMoney(value, model.currency)} />
                  <Bar dataKey="value" fill={colorVar.warning} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h2 className="text-lg font-semibold text-white">Vendor & buyer metrics</h2>
          <p className="mb-4 text-sm text-zinc-400">Active, new, and repeat marketplace participants.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-zinc-800 p-3">
              <p className="text-xs uppercase text-zinc-500">Vendors</p>
              <dl className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Active (30d)</dt>
                  <dd className="font-medium text-white">{model.vendorMetrics.active}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-400">New (30d)</dt>
                  <dd className="font-medium text-white">{model.vendorMetrics.new}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Churned (90d+ idle)</dt>
                  <dd className="font-medium text-white">{model.vendorMetrics.churned}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Approved total</dt>
                  <dd className="font-medium text-white">{model.vendorMetrics.totalApproved}</dd>
                </div>
              </dl>
            </div>
            <div className="rounded-lg border border-zinc-800 p-3">
              <p className="text-xs uppercase text-zinc-500">Buyers</p>
              <dl className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Active (30d)</dt>
                  <dd className="font-medium text-white">{model.buyerMetrics.active}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-400">New (first order 30d)</dt>
                  <dd className="font-medium text-white">{model.buyerMetrics.new}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Repeat (2+ orders)</dt>
                  <dd className="font-medium text-white">{model.buyerMetrics.repeat}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Total buyers</dt>
                  <dd className="font-medium text-white">{model.buyerMetrics.totalBuyers}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
