import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Cpu, MonitorSmartphone, Printer, Radio } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  HardwareDeviceFleetModel,
  HardwareFleetDeviceKind,
  HardwareFleetDeviceStatus,
} from "@/lib/integration-health/hardware-device-fleet-policy";

function kindIcon(kind: HardwareFleetDeviceKind) {
  switch (kind) {
    case "pos_register":
      return Printer;
    case "pos_terminal":
      return MonitorSmartphone;
    case "stripe_reader":
      return Radio;
    default:
      return Cpu;
  }
}

function statusBadge(status: HardwareFleetDeviceStatus) {
  const variant =
    status === "online" || status === "active"
      ? "default"
      : status === "pending"
        ? "secondary"
        : "outline";
  return (
    <Badge variant={variant} className="rounded-full text-[10px] font-normal">
      {status}
    </Badge>
  );
}

export function HardwareDeviceFleetPanel({ model }: { model: HardwareDeviceFleetModel }) {
  const { summary, devices } = model;

  return (
    <Card data-testid="hardware-device-fleet-panel">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Hardware device fleet</CardTitle>
            <CardDescription>
              Registers, POS terminals, and Stripe readers across your workspace — status reflects
              saved configuration, not proprietary hub telemetry.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link href="/dashboard/pos/settings/hardware">Manage readers</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link href="/dashboard/pos/settings">Manage registers</Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="outline" className="rounded-full">
            {summary.totalDevices} device(s)
          </Badge>
          <Badge variant="secondary" className="rounded-full">
            {summary.registerCount} register(s)
          </Badge>
          <Badge variant="secondary" className="rounded-full">
            {summary.readerCount} reader(s)
          </Badge>
          <Badge variant="outline" className="rounded-full">
            {summary.onlineCount} online/active
          </Badge>
          {summary.needsAttentionCount > 0 ? (
            <Badge variant="destructive" className="rounded-full">
              {summary.needsAttentionCount} need attention
            </Badge>
          ) : null}
          {!summary.stripeConfigured ? (
            <Badge variant="outline" className="rounded-full">
              Stripe not configured
            </Badge>
          ) : null}
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Linked to</TableHead>
                <TableHead>Detail</TableHead>
                <TableHead className="text-right">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => {
                const Icon = kindIcon(device.kind);
                return (
                  <TableRow key={device.id} data-testid="hardware-fleet-device-row">
                    <TableCell className="font-medium">
                      <span className="inline-flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                        {device.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{device.deviceType}</TableCell>
                    <TableCell className="text-xs">{device.locationName ?? "—"}</TableCell>
                    <TableCell>{statusBadge(device.status)}</TableCell>
                    <TableCell className="text-xs">{device.linkedTo ?? "—"}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                      {device.detail ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost" className="rounded-full">
                        <Link href={device.manageHref}>Open</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!devices.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-sm text-muted-foreground">
                    No hardware devices registered yet — pair a Stripe reader or create a POS register
                    to populate the fleet view.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground">
          Last refreshed {formatDistanceToNow(new Date(), { addSuffix: true })} on page load. Reader
          online/offline status syncs from Stripe when credentials are configured.
        </p>
      </CardContent>
    </Card>
  );
}
