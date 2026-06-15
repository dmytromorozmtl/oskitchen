"use client";

import Link from "next/link";
import { CloudRain, PartyPopper, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Forecasting2Snapshot } from "@/lib/ai/forecasting-types";
import { formatCurrency } from "@/lib/utils";

type Props = {
  snapshot: Forecasting2Snapshot;
};

export function Forecasting2Panel({ snapshot }: Props) {
  const next30 = snapshot.dailyForecast.slice(0, 30);

  return (
    <div className="space-y-6" data-testid="forecasting-2-panel">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">90-day orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.summary.projectedTotalOrders}</p>
            <p className="text-xs text-muted-foreground">Weather + holiday adjusted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">90-day revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(snapshot.summary.projectedTotalRevenueUsd)}
            </p>
            <p className="text-xs text-muted-foreground">Estimate only</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg daily orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.summary.avgDailyOrders}</p>
            <Badge variant="outline" className="mt-1 rounded-full text-xs capitalize">
              {snapshot.summary.confidence} confidence
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Uplift days</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {snapshot.summary.weatherUpliftDays + snapshot.summary.holidayUpliftDays}
            </p>
            <p className="text-xs text-muted-foreground">
              {snapshot.summary.holidayUpliftDays} holiday · {snapshot.summary.weatherUpliftDays} weather
            </p>
          </CardContent>
        </Card>
      </div>

      {snapshot.summary.warning ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4 text-sm">{snapshot.summary.warning}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PartyPopper className="h-4 w-4" />
              Upcoming holidays
            </CardTitle>
            <CardDescription>Holiday windows in the next {snapshot.horizonDays} days</CardDescription>
          </CardHeader>
          <CardContent>
            {snapshot.upcomingHolidays.length === 0 ? (
              <p className="text-sm text-muted-foreground">No major holiday windows in horizon.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {snapshot.upcomingHolidays.map((holiday) => (
                  <li
                    key={`${holiday.label}-${holiday.startIso}`}
                    className="flex items-center justify-between border-b border-border/40 py-2 last:border-0"
                  >
                    <span>{holiday.label}</span>
                    <span className="text-muted-foreground">
                      {holiday.startIso} → {holiday.endIso} · ×{holiday.boost}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CloudRain className="h-4 w-4" />
              Weather adjustments
            </CardTitle>
            <CardDescription>Deterministic weather proxy applied per forecast day</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Rain, heat, and cold snaps adjust daily demand. {snapshot.summary.weatherUpliftDays} days
              in the 90-day horizon show weather-driven uplift.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Next 30 days
          </CardTitle>
          <CardDescription>
            Baseline from {snapshot.historyDays}-day trailing average · adjusted for weather and holidays
          </CardDescription>
        </CardHeader>
        <CardContent>
          {next30.length === 0 ? (
            <p className="text-sm text-muted-foreground">Insufficient history to project demand.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr className="border-b border-border/70">
                    <th className="py-2 pr-2">Date</th>
                    <th className="py-2 pr-2 text-right">Orders</th>
                    <th className="py-2 pr-2 text-right">Revenue</th>
                    <th className="py-2 pr-2">Weather</th>
                    <th className="py-2 pr-2">Event</th>
                  </tr>
                </thead>
                <tbody>
                  {next30.map((row) => (
                    <tr key={row.dateIso} className="border-b border-border/40">
                      <td className="py-2 pr-2">{row.dateIso}</td>
                      <td className="py-2 pr-2 text-right tabular-nums">{row.adjustedOrders}</td>
                      <td className="py-2 pr-2 text-right tabular-nums">
                        {formatCurrency(row.adjustedRevenueUsd)}
                      </td>
                      <td className="py-2 pr-2 text-xs text-muted-foreground">{row.weatherLabel}</td>
                      <td className="py-2 pr-2 text-xs text-muted-foreground">
                        {row.holidayLabel ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/forecast/new">Run detailed forecast</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/forecast">Forecast hub</Link>
        </Button>
      </div>
    </div>
  );
}
