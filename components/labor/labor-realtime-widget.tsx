"use client";

import { useEffect, useState } from "react";
import { Minus, TrendingDown, TrendingUp, Users } from "lucide-react";

interface LaborData {
  activeStaff: number;
  activeStaffNames: string[];
  totalLaborHours: number;
  laborCost: number;
  totalRevenue: number;
  laborPercent: number;
  scheduledLaborCost: number;
  scheduledLaborPercent: number;
  targetLaborPercent: number;
  status: "OVER" | "ON_TRACK" | "UNDER";
}

export function LaborRealtimeWidget() {
  const [data, setData] = useState<LaborData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/labor/realtime");
        if (res.ok) {
          const json = (await res.json()) as LaborData;
          setData(json);
        }
      } finally {
        setLoading(false);
      }
    }
    void fetchData();
    const interval = setInterval(() => void fetchData(), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="animate-pulse rounded-2xl bg-muted h-32" />;
  }
  if (!data) return null;

  const StatusIcon =
    data.status === "OVER" ? TrendingUp : data.status === "UNDER" ? TrendingDown : Minus;
  const statusColor =
    data.status === "OVER"
      ? "text-rose-600 bg-rose-50 dark:bg-rose-950/40"
      : data.status === "UNDER"
        ? "text-blue-600 bg-blue-50 dark:bg-blue-950/40"
        : "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40";
  const statusLabel =
    data.status === "OVER"
      ? "Over Target"
      : data.status === "UNDER"
        ? "Under Target"
        : "On Track";

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Labor Cost (Today)
        </h3>
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusColor}`}
        >
          <StatusIcon className="h-3 w-3" />
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-2xl font-bold">{data.laborPercent}%</p>
          <p className="text-xs text-muted-foreground">Target: {data.targetLaborPercent}%</p>
        </div>
        <div>
          <p className="text-2xl font-bold">${data.laborCost.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">of ${data.totalRevenue.toFixed(0)} sales</p>
        </div>
      </div>

      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full transition-all rounded-full ${data.laborPercent > data.targetLaborPercent ? "bg-rose-500" : "bg-emerald-500"}`}
          style={{
            width: `${Math.min((data.laborPercent / data.targetLaborPercent) * 100, 100)}%`,
          }}
        />
      </div>

      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {data.activeStaff} clocked in
        </span>
        <span>{data.totalLaborHours}h today</span>
      </div>

      {data.activeStaffNames.length > 0 ? (
        <div className="flex flex-wrap gap-1 mt-2">
          {data.activeStaffNames.map((name) => (
            <span key={name} className="text-[10px] bg-muted px-2 py-0.5 rounded-full">
              {name}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
