"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, Minus, TrendingDown, TrendingUp, Users } from "lucide-react";

import type { LaborRealtimeSnapshot } from "@/services/labor/labor-realtime-service";

type Props = {
  compact?: boolean;
};

export function LaborRealtimeWidget({ compact = false }: Props) {
  const [data, setData] = useState<LaborRealtimeSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/labor/realtime");
        if (res.ok) {
          const json = (await res.json()) as LaborRealtimeSnapshot;
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
    data.status === "OVER" ? "Over Target" : data.status === "UNDER" ? "Under Target" : "On Track";

  const otCount = data.overtimePredictions.length;
  const criticalOt = data.overtimePredictions.filter((o) => o.severity === "critical").length;

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Labor cost (today)
        </h3>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}
        >
          <StatusIcon className="h-3 w-3" />
          {statusLabel}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-2xl font-bold">{data.laborPercent}%</p>
          <p className="text-xs text-muted-foreground">Target: {data.targetLaborPercent}%</p>
        </div>
        <div>
          <p className="text-2xl font-bold">${data.laborCost.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">of ${data.totalRevenue.toFixed(0)} sales</p>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${data.laborPercent > data.targetLaborPercent ? "bg-rose-500" : "bg-emerald-500"}`}
          style={{
            width: `${Math.min((data.laborPercent / Math.max(data.targetLaborPercent, 1)) * 100, 100)}%`,
          }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {data.activeStaff} clocked in
        </span>
        <span>{data.totalLaborHours}h today</span>
      </div>

      {otCount > 0 && (
        <div
          className={`mt-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${
            criticalOt > 0
              ? "border-amber-500/50 bg-amber-500/5 text-amber-900 dark:text-amber-100"
              : "border-border bg-muted/30"
          }`}
        >
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <p className="font-medium">
              OT risk: {otCount} staff{criticalOt > 0 ? ` (${criticalOt} critical)` : ""}
            </p>
            {!compact && (
              <p className="mt-0.5 text-muted-foreground">
                {data.overtimePredictions
                  .slice(0, 2)
                  .map((o) => `${o.staffName} → ${o.projectedWeekHours}h`)
                  .join(" · ")}
              </p>
            )}
          </div>
        </div>
      )}

      {!compact && (
        <div className="mt-3 text-xs">
          <Link href="/dashboard/staff/labor-realtime" className="text-primary hover:underline">
            Open labor tracker →
          </Link>
        </div>
      )}
    </div>
  );
}
