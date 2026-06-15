"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Camera,
  Download,
  RefreshCw,
  Shield,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ACTIVITY_CLASS,
  EQUIPMENT_CLASS,
  HEATMAP_TONE_CLASS,
  heatmapTone,
} from "@/lib/ai/kitchen-camera-dashboard-builders";
import type {
  CameraAlert,
  CameraDashboardFrame,
  KitchenCameraDashboardPayload,
} from "@/lib/ai/kitchen-camera-dashboard-types";
import { KitchenCameraPreviewBanner } from "@/components/kitchen/kitchen-camera-preview-banner";
import { AiHonestyBanner } from "@/components/ui/ai-honesty-label";
import { cn } from "@/lib/utils";

type Props = KitchenCameraDashboardPayload & {
  showPreviewBanner?: boolean;
};

const SEVERITY_VARIANT: Record<CameraAlert["severity"], "destructive" | "default" | "secondary"> = {
  critical: "destructive",
  warning: "default",
  info: "secondary",
};

function CameraTile({ frame }: { frame: CameraDashboardFrame }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border bg-zinc-900">
      {frame.config.streamUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={frame.config.streamUrl} alt={frame.config.label} className="h-full w-full object-cover opacity-80" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black flex items-center justify-center">
          <Camera className="h-10 w-10 text-zinc-600" aria-hidden />
          <span className="absolute bottom-2 left-2 text-[10px] text-zinc-500">Simulated feed · KDS inference</span>
        </div>
      )}

      <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 to-transparent p-2">
        <p className="text-xs font-medium text-white truncate">{frame.config.label}</p>
        <p className="text-[10px] text-zinc-300">{frame.stationName}</p>
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2 space-y-1">
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className={cn("text-[10px] h-5", ACTIVITY_CLASS[frame.activityLevel])}>
            {frame.activityLevel}
          </Badge>
          <Badge variant="outline" className="text-[10px] h-5 bg-black/40 text-white border-white/20">
            Q:{frame.queueLength}
          </Badge>
          <Badge variant="outline" className="text-[10px] h-5 bg-black/40 text-white border-white/20">
            <Users className="h-3 w-3 mr-0.5" aria-hidden />
            {frame.staffCount}
          </Badge>
        </div>
        <p className={cn("text-[10px] font-medium", EQUIPMENT_CLASS[frame.equipmentStatus])}>
          Equipment: {frame.equipmentStatus}
        </p>
      </div>
    </div>
  );
}

function TimelineChart({ timeline }: { timeline: KitchenCameraDashboardPayload["timeline30m"] }) {
  const byStation = useMemo(() => {
    const map = new Map<string, typeof timeline>();
    for (const p of timeline) {
      const list = map.get(p.stationName) ?? [];
      list.push(p);
      map.set(p.stationName, list);
    }
    return [...map.entries()].slice(0, 4);
  }, [timeline]);

  if (byStation.length === 0) {
    return <p className="text-sm text-muted-foreground">No timeline data yet.</p>;
  }

  return (
    <div className="space-y-3">
      {byStation.map(([station, points]) => {
        const maxQ = Math.max(1, ...points.map((p) => p.queueLength));
        return (
          <div key={station}>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium">{station}</span>
              <span className="text-muted-foreground">{points.length} samples / 30m</span>
            </div>
            <div className="flex items-end gap-0.5 h-12">
              {points.slice(-30).map((p, i) => (
                <div
                  key={`${p.at}-${i}`}
                  className={cn(
                    "flex-1 min-w-[3px] rounded-sm",
                    p.activityLevel === "overloaded"
                      ? "bg-red-500"
                      : p.activityLevel === "busy"
                        ? "bg-amber-500"
                        : p.activityLevel === "normal"
                          ? "bg-emerald-500"
                          : "bg-zinc-400",
                  )}
                  style={{ height: `${Math.max(12, (p.queueLength / maxQ) * 100)}%` }}
                  title={`${new Date(p.at).toLocaleTimeString()} — queue ${p.queueLength}`}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function KitchenCamerasDashboard(props: Props) {
  const [selectedAlert, setSelectedAlert] = useState<CameraAlert | null>(null);

  const maxHeat = useMemo(
    () => Math.max(1, ...props.activityHeatmap.map((c) => c.activityScore)),
    [props.activityHeatmap],
  );

  function exportIncident(alert: CameraAlert) {
    const frame = props.cameras.find((c) => c.cameraId === alert.cameraId);
    const payload = {
      exportedAt: new Date().toISOString(),
      alert,
      frame: frame ?? null,
      workspaceId: props.workspaceId,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kitchen-incident-${alert.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Incident report exported.");
  }

  function exportAllCritical() {
    const critical = props.alerts.filter((a) => a.severity === "critical");
    if (critical.length === 0) {
      toast.info("No critical alerts to export.");
      return;
    }
    critical.forEach(exportIncident);
  }

  return (
    <div className="space-y-6" data-testid="kitchen-cameras-dashboard" id="kitchen-camera-report">
      <AiHonestyBanner moduleId="kitchen-camera" />
      {props.showPreviewBanner ? <KitchenCameraPreviewBanner /> : null}

      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kitchen Cameras</h1>
          <p className="text-muted-foreground max-w-2xl">
            AI-assisted camera analysis — {props.summary.cameraCount} feeds, confidence{" "}
            {Math.round(props.confidence * 100)}%, source {props.dataSource.replace(/_/g, " ")}. Updated{" "}
            {new Date(props.analyzedAt).toLocaleString()}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" className="rounded-full">
            <Link href="/dashboard/kitchen/cameras/live">Open LIVE</Link>
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
            Refresh
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={exportAllCritical}>
            <Download className="mr-2 h-4 w-4" aria-hidden />
            Export incidents
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">PPE compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{props.summary.ppeCompliancePercent}%</p>
            <Progress className="mt-2 h-2" value={props.summary.ppeCompliancePercent} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Avg queue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{props.summary.avgQueueLength}</p>
            <p className="text-sm text-muted-foreground">Max {props.summary.maxQueueLength}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{props.alerts.length}</p>
            <p className="text-sm text-muted-foreground">
              {props.alerts.filter((a) => a.severity === "critical").length} critical
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Equipment issues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{props.summary.equipmentIssues}</p>
            <p className="text-sm text-muted-foreground">
              {props.summary.overloadedStations.length} overloaded stations
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live camera grid</CardTitle>
          <CardDescription>4-up station view with queue, activity, and staff overlays</CardDescription>
        </CardHeader>
        <CardContent>
          {props.cameras.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cameras configured — add production stations first.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {props.cameras.slice(0, 8).map((frame) => (
                <CameraTile key={frame.cameraId} frame={frame} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className={props.alerts.some((a) => a.severity === "critical") ? "border-red-500/40" : undefined}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden />
              Alert feed
            </CardTitle>
            <CardDescription>PPE violations, equipment errors, overload warnings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-80 overflow-y-auto">
            {props.alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active alerts.</p>
            ) : (
              props.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "rounded-md border p-3 text-sm cursor-pointer hover:bg-muted/30",
                    selectedAlert?.id === alert.id && "ring-2 ring-primary",
                  )}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{alert.stationName}</span>
                    <Badge variant={SEVERITY_VARIANT[alert.severity]}>{alert.severity}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="mt-2 h-7 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      exportIncident(alert);
                    }}
                  >
                    Export incident
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" aria-hidden />
              PPE compliance report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {props.cameras.map((frame) => (
              <div key={frame.cameraId} className="flex items-center justify-between gap-2 text-sm border-b pb-2">
                <span>{frame.stationName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {frame.ppe.hairnet ? "✓" : "✗"} net · {frame.ppe.gloves ? "✓" : "✗"} gloves ·{" "}
                    {frame.ppe.apron ? "✓" : "✗"} apron
                  </span>
                  <Badge
                    variant={
                      frame.ppe.status === "compliant"
                        ? "secondary"
                        : frame.ppe.status === "partial"
                          ? "default"
                          : "destructive"
                    }
                  >
                    {frame.ppe.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity timeline (30 min)</CardTitle>
            <CardDescription>Queue depth samples per station</CardDescription>
          </CardHeader>
          <CardContent>
            <TimelineChart timeline={props.timeline30m} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity heat map (by hour)</CardTitle>
            <CardDescription>Kitchen activity score — green low, red peak</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {props.activityHeatmap.map((cell) => {
                const tone = heatmapTone(cell.activityScore);
                return (
                  <div key={cell.hour} className="text-center">
                    <div
                      className={cn(
                        "mx-auto h-16 w-full max-w-[48px] rounded-md flex items-end justify-center pb-1",
                        HEATMAP_TONE_CLASS[tone],
                      )}
                      style={{ opacity: 0.35 + (cell.activityScore / maxHeat) * 0.65 }}
                      title={`${cell.label} — score ${cell.activityScore}`}
                    >
                      <span className="text-[10px] font-medium text-white drop-shadow">{cell.activityScore}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{cell.label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
