"use client";

import { useMemo, useState, useTransition } from "react";
import { AlertTriangle, Download, Play, Users, Wrench } from "lucide-react";
import { toast } from "sonner";

import { runDigitalTwinScenarioAction } from "@/actions/digital-twin";
import type { DigitalTwinDashboardPayload } from "@/lib/ai/digital-twin-types";
import type { SimulationResult } from "@/lib/ai/digital-twin-types";
import { DigitalTwinDataGateBanner } from "@/components/dashboard/digital-twin-data-gate-banner";
import { AiHonestyBanner } from "@/components/ui/ai-honesty-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RangeInput } from "@/components/ui/range-input";
import { cn } from "@/lib/utils";

const TIME_WINDOWS = [
  { label: "30 min", value: 30 },
  { label: "1 hr", value: 60 },
  { label: "2 hr", value: 120 },
  { label: "4 hr", value: 240 },
] as const;

type Props = DigitalTwinDashboardPayload;

export function DigitalTwinDashboard({ config, defaultMenuMix, initialResult, dataGate }: Props) {
  const [orderCount, setOrderCount] = useState(60);
  const [timeWindow, setTimeWindow] = useState(60);
  const [menuMixMode, setMenuMixMode] = useState<"auto" | "custom">("auto");
  const [result, setResult] = useState<SimulationResult>(initialResult);
  const [previousResult, setPreviousResult] = useState<SimulationResult | null>(null);
  const [pending, startTransition] = useTransition();

  const menuMix = menuMixMode === "auto" ? defaultMenuMix : defaultMenuMix;

  const staffByStation = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const s of config.staff) {
      const list = map.get(s.station) ?? [];
      list.push(s.name);
      map.set(s.station, list);
    }
    return map;
  }, [config.staff]);

  function runSimulation() {
    startTransition(async () => {
      try {
        const next = await runDigitalTwinScenarioAction({
          orderCount,
          timeWindow,
          menuMix,
        });
        setPreviousResult(result);
        setResult(next);
      } catch {
        toast.error("Simulation failed. Try again.");
      }
    });
  }

  function exportReport() {
    const payload = {
      exportedAt: new Date().toISOString(),
      scenario: { orderCount, timeWindow, menuMixMode, menuMix },
      config,
      result,
      previousResult,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `digital-twin-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Simulation report downloaded.");
  }

  return (
    <div className="space-y-6" data-testid="digital-twin-dashboard">
      <AiHonestyBanner moduleId="digital-twin" />
      <DigitalTwinDataGateBanner gate={dataGate} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Digital Twin</h1>
          <p className="text-muted-foreground max-w-2xl">
            AI-assisted kitchen simulation — model throughput, find bottlenecks, and test what-if
            scenarios before service. Confidence {Math.round(result.confidence * 100)}%.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={exportReport}>
          <Download className="mr-2 h-4 w-4" aria-hidden />
          Export report
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Kitchen layout</CardTitle>
            <CardDescription>Stations, assigned staff, and equipment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {config.stations.map((station) => {
                const isBottleneck = station.name === result.bottleneckStation;
                const utilization =
                  result.stationUtilization.find((u) => u.station === station.name)?.utilization ?? 0;
                const equipment = config.equipment.find((e) => e.station === station.name);
                const staff = staffByStation.get(station.name) ?? [];

                return (
                  <div
                    key={station.name}
                    className={cn(
                      "rounded-xl border p-3 transition-colors",
                      isBottleneck
                        ? "border-red-400 bg-red-50/60 dark:border-red-800 dark:bg-red-950/30"
                        : "border-border/70 bg-background/80",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">{station.name}</p>
                      {isBottleneck ? (
                        <Badge className="bg-red-600 text-white hover:bg-red-600">
                          <AlertTriangle className="mr-1 h-3 w-3" aria-hidden />
                          Bottleneck
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Capacity {station.capacity} · Load {station.currentLoad}
                    </p>
                    <div className="mt-2">
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>Utilization</span>
                        <span>{Math.round(utilization * 100)}%</span>
                      </div>
                      <Progress value={utilization * 100} max={100} />
                    </div>
                    <div className="mt-2 flex items-start gap-1 text-xs text-muted-foreground">
                      <Users className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                      <span>{staff.length > 0 ? staff.join(", ") : "No staff assigned"}</span>
                    </div>
                    {equipment ? (
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Wrench className="h-3 w-3 shrink-0" aria-hidden />
                        {equipment.name} · {equipment.throughput.toFixed(2)}× throughput
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">What-if scenario</CardTitle>
            <CardDescription>Adjust demand and re-run simulation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label id="order-count-label" htmlFor="order-count">
                  Expected orders
                </Label>
                <span className="text-sm font-medium tabular-nums">{orderCount}</span>
              </div>
              <RangeInput
                id="order-count"
                min={50}
                max={500}
                step={10}
                value={orderCount}
                valueText={`${orderCount} orders`}
                aria-labelledby="order-count-label"
                onChange={(e) => setOrderCount(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">50 – 500 orders in window</p>
            </div>

            <div className="space-y-2">
              <Label>Time window</Label>
              <div className="flex flex-wrap gap-2">
                {TIME_WINDOWS.map((tw) => (
                  <Button
                    key={tw.value}
                    type="button"
                    size="sm"
                    variant={timeWindow === tw.value ? "default" : "outline"}
                    onClick={() => setTimeWindow(tw.value)}
                  >
                    {tw.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Menu mix</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={menuMixMode === "auto" ? "default" : "outline"}
                  onClick={() => setMenuMixMode("auto")}
                >
                  Auto from history
                </Button>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                {menuMix.slice(0, 5).map((m) => (
                  <li key={m.item}>
                    {m.item} — {m.percentage.toFixed(0)}%
                  </li>
                ))}
              </ul>
            </div>

            <Button type="button" className="w-full" onClick={runSimulation} disabled={pending}>
              <Play className="mr-2 h-4 w-4" aria-hidden />
              {pending ? "Simulating…" : "Run simulation"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Simulation results</CardTitle>
            <CardDescription>
              Bottleneck: <span className="font-medium text-foreground">{result.bottleneckStation}</span> ·
              max delay {result.bottleneckDelay.toFixed(1)} min · total {result.totalTime.toFixed(1)} min
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.waitTimes.map((w) => (
              <div key={w.station} className="rounded-lg border border-border/70 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className={cn("font-medium", w.station === result.bottleneckStation && "text-red-600")}>
                    {w.station}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    avg {w.avgWait.toFixed(1)} min · max {w.maxWait.toFixed(1)} min
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recommendations</CardTitle>
            <CardDescription>AI-assisted suggestions — verify before changing staffing</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {result.recommendations.map((rec) => (
                <li key={rec} className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                  {rec}
                </li>
              ))}
            </ul>
            {previousResult ? (
              <p className="mt-4 text-xs text-muted-foreground">
                vs prior run: bottleneck delay{" "}
                {previousResult.bottleneckDelay.toFixed(1)} → {result.bottleneckDelay.toFixed(1)} min (
                {result.bottleneckStation === previousResult.bottleneckStation
                  ? "same station"
                  : `${previousResult.bottleneckStation} → ${result.bottleneckStation}`}
                )
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
