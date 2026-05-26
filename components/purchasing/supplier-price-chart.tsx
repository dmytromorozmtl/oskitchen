"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SupplierPriceChartPoint } from "@/services/purchasing/supplier-price-history-service";

const COLORS = ["#4f46e5", "#059669", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];

type Props = { data: SupplierPriceChartPoint[] };

export function SupplierPriceChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No price history in this window.</p>;
  }

  const suppliers = [...new Set(data.map((d) => d.supplierName))];
  const dates = [...new Set(data.map((d) => d.date))].sort();
  const chartData = dates.map((date) => {
    const row: Record<string, string | number> = { date };
    for (const s of suppliers) {
      const pt = data.find((d) => d.date === date && d.supplierName === s);
      if (pt) row[s] = pt.price;
    }
    return row;
  });

  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="mb-4 text-base font-semibold">Price history</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          {suppliers.map((supplier, i) => (
            <Line
              key={supplier}
              type="monotone"
              dataKey={supplier}
              name={supplier}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
