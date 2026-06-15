"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { CartRecoveryDailyPoint } from "@/services/storefront/storefront-cart-recovery-service";

export function CartRecoveryChart({ data }: { data: CartRecoveryDailyPoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No cart recovery data yet.</p>;
  }

  const chartData = data.map((d) => ({
    ...d,
    label: d.date.slice(5),
    rate: d.emailed > 0 ? Math.round((d.converted / d.emailed) * 100) : 0,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="left" allowDecimals={false} tick={{ fontSize: 11 }} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
          <Tooltip
            formatter={(value: number, name: string) =>
              name === "Recovery %" ? [`${value}%`, name] : [value, name]
            }
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="tracked" name="Tracked" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="left" dataKey="emailed" name="Emailed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="left" dataKey="converted" name="Converted" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="rate"
            name="Recovery %"
            stroke="hsl(262 83% 58%)"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
