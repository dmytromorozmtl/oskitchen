"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LaborRealtimeSnapshot } from "@/services/labor/labor-realtime-service";

type Props = {
  initial: LaborRealtimeSnapshot;
};

export function LaborRealtimeTracker({ initial }: Props) {
  const [data, setData] = useState(initial);

  useEffect(() => {
    async function refresh() {
      const res = await fetch("/api/labor/realtime");
      if (res.ok) setData((await res.json()) as LaborRealtimeSnapshot);
    }
    const interval = setInterval(() => void refresh(), 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Updated {new Date(data.updatedAtIso).toLocaleTimeString()} · refreshes every 60s
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Labor %</CardTitle>
            <p className="text-2xl font-semibold">{data.laborPercent}%</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Labor cost</CardTitle>
            <p className="text-2xl font-semibold">${data.laborCost.toFixed(0)}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Today sales</CardTitle>
            <p className="text-2xl font-semibold">${data.totalRevenue.toFixed(0)}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Scheduled labor</CardTitle>
            <p className="text-2xl font-semibold">{data.scheduledLaborPercent}%</p>
            <p className="text-xs text-muted-foreground">${data.scheduledLaborCost.toFixed(0)} planned</p>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Clocked in now</CardTitle>
          </CardHeader>
          <CardContent>
            {data.activeStaffNames.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active time clock entries.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {data.activeStaffNames.map((name) => (
                  <li key={name} className="rounded-full bg-muted px-3 py-1 text-sm">
                    {name}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-sm text-muted-foreground">
              {data.totalLaborHours}h logged today · ${data.hourlyRate}/hr blended rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Overtime prediction (this week)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.overtimePredictions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No staff projected above 36h this week.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="pb-2 pr-3">Staff</th>
                      <th className="pb-2 pr-3">Scheduled</th>
                      <th className="pb-2 pr-3">Today clocked</th>
                      <th className="pb-2 pr-3">Projected</th>
                      <th className="pb-2">OT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.overtimePredictions.map((row) => (
                      <tr key={row.staffMemberId} className="border-t">
                        <td className="py-2 pr-3 font-medium">{row.staffName}</td>
                        <td className="py-2 pr-3">{row.weekScheduledHours}h</td>
                        <td className="py-2 pr-3">{row.todayClockedHours}h</td>
                        <td className="py-2 pr-3">{row.projectedWeekHours}h</td>
                        <td className="py-2">
                          <span
                            className={
                              row.severity === "critical"
                                ? "font-semibold text-rose-600"
                                : "text-amber-700 dark:text-amber-300"
                            }
                          >
                            {row.overtimeHours > 0 ? `+${row.overtimeHours}h` : "Near limit"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
