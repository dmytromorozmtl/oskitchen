"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  MarketplaceCostPerUnitRow,
  MarketplaceSpendSlice,
  MarketplaceSpendTrendPoint,
} from "@/services/marketplace/marketplace-analytics-service";
import { chartSeriesColor, colorVar } from "@/lib/design/color-tokens";

export function MarketplaceSpendDonutChart({ data }: { data: MarketplaceSpendSlice[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No category spend this month.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="label" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {data.map((_, index) => (
            <Cell key={index} fill={chartSeriesColor(index)} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MarketplaceSpendBarChart({ data }: { data: MarketplaceSpendSlice[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No vendor spend this month.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MarketplaceSpendLineChart({ data }: { data: MarketplaceSpendTrendPoint[] }) {
  if (data.every((point) => point.spend === 0 && point.orders === 0)) {
    return <p className="text-sm text-muted-foreground">No spend trend yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="spend" name="Spend" stroke={colorVar.accent} strokeWidth={2} dot />
        <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke={colorVar.info} strokeWidth={2} dot />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MarketplaceCostPerUnitTable({ rows }: { rows: MarketplaceCostPerUnitRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No unit cost history in the last 90 days.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/80">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/80 bg-muted/30 text-left">
            <th className="p-3">SKU</th>
            <th className="p-3">Product</th>
            <th className="p-3">Latest</th>
            <th className="p-3">Avg</th>
            <th className="p-3">Orders</th>
            <th className="p-3">Change</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.productId} className="border-b border-border/60">
              <td className="p-3 font-mono text-xs">{row.sku}</td>
              <td className="p-3">{row.productName}</td>
              <td className="p-3 tabular-nums">${row.latestUnitPrice.toFixed(2)}</td>
              <td className="p-3 tabular-nums">${row.avgUnitPrice.toFixed(2)}</td>
              <td className="p-3 tabular-nums">{row.orderCount}</td>
              <td className="p-3 tabular-nums">
                {row.priceChangePercent != null ? `${row.priceChangePercent > 0 ? "+" : ""}${row.priceChangePercent}%` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
