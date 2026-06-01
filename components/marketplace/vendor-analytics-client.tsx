"use client";

import Link from "next/link";
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
import { Download, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { VendorAnalyticsModel } from "@/services/marketplace/vendor-analytics-service";

const SEGMENT_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

export function VendorAnalyticsClient({ model }: { model: VendorAnalyticsModel }) {
  const segmentChart = model.customerSegments.slice(0, 4).map((row, index) => ({
    name: row.segment,
    value: row.revenue,
    fill: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" className="rounded-full">
          <a href="/api/vendor/analytics/export">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </a>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Revenue (30d)" value={formatCurrency(model.revenue30d, "USD")} />
        <MetricCard label="Orders (30d)" value={String(model.orders30d)} />
        <MetricCard label="Avg order" value={formatCurrency(model.avgOrderValue, "USD")} />
        <MetricCard
          label="Repeat buyers"
          value={`${model.repeatBuyerRate}%`}
          hint={model.avgRating != null ? `Rating ${model.avgRating}/5` : "No reviews yet"}
        />
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Sales revenue</CardTitle>
          <CardDescription>Daily gross marketplace revenue over the last 30 days.</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={model.salesTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.15}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Conversion funnel</CardTitle>
            <CardDescription>Catalog → placed → confirmed → completed (30d).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {model.conversionFunnel.map((step) => (
              <div key={step.key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{step.label}</span>
                  <span className="font-medium">
                    {step.count.toLocaleString()}
                    {step.ratePercent != null ? ` · ${step.ratePercent}%` : ""}
                  </span>
                </div>
                <Progress
                  value={
                    step.ratePercent ??
                    (model.conversionFunnel[0]?.count
                      ? (step.count / model.conversionFunnel[0].count) * 100
                      : 0)
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Customer segments</CardTitle>
            <CardDescription>Revenue share by buyer type and workspace segment.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {segmentChart.length === 0 ? (
              <p className="text-sm text-muted-foreground">No buyer activity in the last 30 days.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={segmentChart} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                    {segmentChart.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value, "USD")} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Product performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-border/80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Conv.</TableHead>
                  <TableHead>Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {model.productPerformance.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <p className="font-medium">{row.name}</p>
                      <p className="text-xs text-muted-foreground">{row.sku}</p>
                    </TableCell>
                    <TableCell>{formatCurrency(row.revenue, "USD")}</TableCell>
                    <TableCell>{row.unitsSold}</TableCell>
                    <TableCell>{row.orderCount}</TableCell>
                    <TableCell>{row.conversionRate}%</TableCell>
                    <TableCell>{row.stockQty}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Customer analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Segment</TableHead>
                  <TableHead>Buyers</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {model.customerSegments.map((row) => (
                  <TableRow key={row.segment}>
                    <TableCell>{row.segment}</TableCell>
                    <TableCell>{row.buyers}</TableCell>
                    <TableCell>{formatCurrency(row.revenue, "USD")}</TableCell>
                    <TableCell>{row.sharePercent}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Marketplace insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {model.marketplaceInsights.map((insight) => (
              <div
                key={insight.id}
                className="rounded-xl border border-border/70 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{insight.title}</p>
                  <Badge
                    variant={insight.tone === "warning" ? "destructive" : "outline"}
                    className="rounded-full capitalize"
                  >
                    {insight.tone}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{insight.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Inventory forecasting</CardTitle>
          <CardDescription>14-day reorder suggestions based on 30-day sales velocity.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-border/80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Avg daily sales</TableHead>
                  <TableHead>Days to stockout</TableHead>
                  <TableHead>Suggested reorder</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {model.inventoryForecast.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <p className="font-medium">{row.name}</p>
                      <p className="text-xs text-muted-foreground">{row.sku}</p>
                    </TableCell>
                    <TableCell>{row.stockQty}</TableCell>
                    <TableCell>{row.avgDailySales}</TableCell>
                    <TableCell>{row.daysUntilStockout ?? "—"}</TableCell>
                    <TableCell>{row.suggestedReorderQty}</TableCell>
                    <TableCell>
                      <Badge
                        variant={row.urgency === "high" ? "destructive" : "outline"}
                        className="rounded-full capitalize"
                      >
                        {row.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm" className="rounded-full">
                        <Link href={`/vendor/products/${row.id}/edit`}>Restock</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Orders trend</CardTitle>
        </CardHeader>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={model.salesTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="orders" name="Orders" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      {hint ? (
        <CardContent>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}
