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

export function StorefrontTimeseriesChart({
  data,
}: {
  data: { day: string; visits: number; events: number; orders: number }[];
}) {
  if (!data.length) return <p className="text-sm text-muted-foreground">No data in this range.</p>;
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
          <XAxis dataKey="day" tick={{ fontSize: 10 }} />
          <YAxis allowDecimals={false} width={32} tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="visits" name="Visits" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="events" name="Events" stroke="hsl(142 70% 40%)" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="orders" name="Orders" stroke="hsl(280 60% 45%)" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
