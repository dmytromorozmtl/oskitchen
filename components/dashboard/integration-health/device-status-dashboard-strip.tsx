import Link from "next/link";
import { LayoutGrid } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DEVICE_STATUS_DASHBOARD_ROUTE } from "@/lib/integration-health/device-status-dashboard-absolute-final-policy";

export function DeviceStatusDashboardStrip() {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"
      data-testid="device-status-dashboard-strip"
    >
      <div className="flex items-start gap-3">
        <LayoutGrid className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="font-semibold">Device status dashboard</p>
          <p className="text-sm text-muted-foreground">
            Clover parity grid — location-grouped cards with online/offline badges and last-seen
            labels. Configuration only for registers; Stripe sync for readers.
          </p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
        <Link href="/dashboard/devices">Open device dashboard</Link>
      </Button>
    </div>
  );
}
