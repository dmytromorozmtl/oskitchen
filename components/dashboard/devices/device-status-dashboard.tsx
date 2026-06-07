import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  MonitorSmartphone,
  Printer,
  Radio,
  Wifi,
  WifiOff,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  DeviceStatusConnectivity,
  DeviceStatusDashboardModel,
  DeviceStatusLocationGroup,
} from "@/lib/integration-health/device-status-dashboard-absolute-final-policy";
import {
  DEVICE_STATUS_DASHBOARD_ROUTE,
} from "@/lib/integration-health/device-status-dashboard-absolute-final-policy";
import type { HardwareFleetDeviceKind } from "@/lib/integration-health/hardware-device-fleet-policy";

function kindIcon(kind: HardwareFleetDeviceKind) {
  switch (kind) {
    case "pos_register":
      return Printer;
    case "pos_terminal":
      return MonitorSmartphone;
    case "stripe_reader":
      return Radio;
    default:
      return MonitorSmartphone;
  }
}

function connectivityBadge(connectivity: DeviceStatusConnectivity) {
  const variant =
    connectivity === "online" || connectivity === "configured"
      ? "default"
      : connectivity === "pending"
        ? "secondary"
        : "outline";
  return (
    <Badge variant={variant} className="rounded-full text-[10px] font-normal capitalize">
      {connectivity}
    </Badge>
  );
}

function connectivityIcon(connectivity: DeviceStatusConnectivity) {
  if (connectivity === "online" || connectivity === "configured") {
    return <Wifi className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />;
  }
  if (connectivity === "offline") {
    return <WifiOff className="h-4 w-4 text-destructive" aria-hidden />;
  }
  return <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden />;
}

function LocationGroup({ group }: { group: DeviceStatusLocationGroup }) {
  return (
    <section className="space-y-3" data-testid="device-status-location-group">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{group.locationName}</h2>
        <Badge variant="outline" className="rounded-full text-[10px] font-normal">
          {group.devices.length} device(s)
        </Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {group.devices.map((device) => {
          const Icon = kindIcon(device.kind);
          return (
            <Card
              key={device.id}
              className="border-border/70 shadow-sm"
              data-testid="device-status-card"
            >
              <CardHeader className="space-y-2 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                    <CardTitle className="text-base">{device.label}</CardTitle>
                  </div>
                  {connectivityIcon(device.connectivity)}
                </div>
                <CardDescription className="text-xs">{device.deviceType}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  {connectivityBadge(device.connectivity)}
                  {device.alertLevel !== "none" ? (
                    <Badge variant="destructive" className="rounded-full text-[10px] font-normal">
                      Needs attention
                    </Badge>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">{device.lastSeenLabel}</p>
                {device.detail ? (
                  <p className="truncate text-xs text-muted-foreground">{device.detail}</p>
                ) : null}
                <Button asChild size="sm" variant="outline" className="w-full rounded-full">
                  <Link href={device.manageHref}>Manage device</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export function DeviceStatusDashboard({ model }: { model: DeviceStatusDashboardModel }) {
  const { summary, groups, refreshedAt } = model;

  return (
    <div className="space-y-6" data-testid="device-status-dashboard">
      {summary.needsAttentionCount > 0 ? (
        <div
          className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4"
          data-testid="device-status-attention-banner"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
          <div>
            <p className="font-semibold">Device attention required</p>
            <p className="text-sm text-muted-foreground">
              {summary.needsAttentionCount} device(s) are offline, inactive, or pending pairing.
              Clover parity view — status reflects saved configuration and Stripe reader sync, not
              proprietary hub telemetry.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardDescription>Total devices</CardDescription>
            <CardTitle className="text-2xl">{summary.totalDevices}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardDescription>Online / active</CardDescription>
            <CardTitle className="text-2xl">{summary.onlineCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardDescription>Configured (no heartbeat)</CardDescription>
            <CardTitle className="text-2xl">{summary.configuredCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardDescription>Offline / inactive</CardDescription>
            <CardTitle className="text-2xl">{summary.offlineCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="rounded-full">
          {summary.registerCount} register(s)
        </Badge>
        <Badge variant="outline" className="rounded-full">
          {summary.terminalCount} terminal(s)
        </Badge>
        <Badge variant="outline" className="rounded-full">
          {summary.readerCount} reader(s)
        </Badge>
        {!summary.stripeConfigured ? (
          <Badge variant="secondary" className="rounded-full">
            Stripe not configured
          </Badge>
        ) : null}
      </div>

      {groups.length ? (
        groups.map((group) => <LocationGroup key={group.locationName} group={group} />)
      ) : (
        <Card className="border-dashed border-border/70">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No devices registered yet. Pair a Stripe reader or create a POS register to populate
            this Clover parity status grid.
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>
          Refreshed {formatDistanceToNow(new Date(refreshedAt), { addSuffix: true })} on page load.
          Clover parity grid — not proprietary hub telemetry. POS registers and terminals show
          Configuration only until live heartbeat ships; Stripe readers sync online/offline when
          credentials are configured.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="ghost" className="rounded-full">
            <Link href="/dashboard/integration-health">Integration Health Center</Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="rounded-full">
            <Link href="/dashboard/pos/settings/hardware">Manage readers</Link>
          </Button>
        </div>
      </div>

      <p className="sr-only">{DEVICE_STATUS_DASHBOARD_ROUTE}</p>
      <p className="sr-only">device-status-dashboard-absolute-final-v1</p>
    </div>
  );
}
