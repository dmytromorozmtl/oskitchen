import Link from "next/link";
import { Navigation } from "lucide-react";

import { Button } from "@/components/ui/button";
import { KDS_DRIVER_ETA_TRACKING_ROUTE } from "@/lib/kitchen/kds-driver-eta-tracking-absolute-final-policy";

export function KdsDriverEtaStrip() {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"
      data-testid="kds-driver-eta-strip"
    >
      <div className="flex items-start gap-3">
        <Navigation className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="font-semibold">Driver ETA tracking</p>
          <p className="text-sm text-muted-foreground">
            Dispatch status badges and estimated ETA for delivery tickets on expo handoff. BETA —
            not live GPS certified.
          </p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
        <Link href={KDS_DRIVER_ETA_TRACKING_ROUTE}>Open driver ETA board</Link>
      </Button>
    </div>
  );
}
