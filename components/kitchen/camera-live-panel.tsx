"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Camera, RefreshCw, Shield, Users } from "lucide-react";

import { refreshCameraLiveDashboardAction } from "@/actions/camera-live";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ACTIVITY_CLASS,
  EQUIPMENT_CLASS,
} from "@/lib/ai/kitchen-camera-dashboard-builders";
import type { CameraLiveDashboard } from "@/lib/ai/camera-live-types";
import { cn } from "@/lib/utils";

const EVENT_VARIANT: Record<string, "destructive" | "default" | "secondary"> = {
  critical: "destructive",
  warning: "default",
  info: "secondary",
};

export function CameraLivePanel({ dashboard }: { dashboard: CameraLiveDashboard }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function refresh() {
    startTransition(async () => {
      await refreshCameraLiveDashboardAction();
      router.refresh();
    });
  }

  return (
    <div className="space-y-6" data-testid="camera-live-panel">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="default">LIVE CV</Badge>
        <Badge variant="outline">{dashboard.dataSource.replace(/_/g, " ")}</Badge>
        <Badge variant="secondary">
          Refreshes every {dashboard.refreshSeconds}s
        </Badge>
        <Badge variant="outline">
          Confidence {Math.round(dashboard.confidence * 100)}%
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Live feeds</CardDescription>
            <CardTitle className="text-2xl">{dashboard.summary.liveCameraCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>PPE compliance</CardDescription>
            <CardTitle className="text-2xl">
              {Math.round(dashboard.summary.ppeCompliancePercent)}%
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Queue alerts</CardDescription>
            <CardTitle className="text-2xl">{dashboard.summary.openEvents}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Idle stations</CardDescription>
            <CardTitle className="text-2xl">{dashboard.summary.idleStations.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={pending}
          data-testid="camera-live-refresh"
          onClick={refresh}
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", pending && "animate-spin")} />
          Refresh LIVE
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/dashboard/kitchen/cameras">Camera overview</Link>
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {dashboard.cameras.map((frame) => (
          <Card key={frame.cameraId}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{frame.config.label}</CardTitle>
                {frame.live ? (
                  <Badge className="bg-red-600 hover:bg-red-600">LIVE</Badge>
                ) : (
                  <Badge variant="outline">KDS</Badge>
                )}
              </div>
              <CardDescription>{frame.stationName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative aspect-video overflow-hidden rounded-lg border bg-zinc-900 flex items-center justify-center">
                <Camera className="h-10 w-10 text-zinc-600" />
                <span className="absolute bottom-2 left-2 text-[10px] text-zinc-400">
                  CV: {frame.detections.length} objects
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className={cn("text-xs", ACTIVITY_CLASS[frame.activityLevel])}>
                  {frame.activityLevel}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Q:{frame.queueLength}
                </Badge>
                <Badge variant="outline" className="text-xs gap-0.5">
                  <Users className="h-3 w-3" />
                  {frame.staffCount}
                </Badge>
                <Badge variant="outline" className="text-xs gap-0.5">
                  <Shield className="h-3 w-3" />
                  {frame.ppe.status}
                </Badge>
              </div>
              <p className={cn("text-xs", EQUIPMENT_CLASS[frame.equipmentStatus])}>
                Equipment: {frame.equipmentStatus}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">LIVE event feed</CardTitle>
          <CardDescription>Queues, PPE, equipment stress, and idle downtime</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 max-h-80 overflow-y-auto">
          {dashboard.events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events in the last window.</p>
          ) : (
            dashboard.events.map((event) => (
              <div
                key={event.id}
                className="flex flex-wrap items-start justify-between gap-2 rounded-lg border p-2 text-sm"
                data-testid="camera-live-event"
              >
                <div>
                  <p className="font-medium">{event.stationName}</p>
                  <p className="text-muted-foreground">{event.message}</p>
                </div>
                <Badge variant={EVENT_VARIANT[event.severity] ?? "secondary"}>
                  {event.type.replace(/_/g, " ")}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Edge devices POST detections to{" "}
        <code className="rounded bg-muted px-1">/api/kitchen/cameras/live/frame</code> for true
        on-device CV. Without a stream, LIVE tick hydrates from KDS + synthetic object detection.
      </p>
    </div>
  );
}
