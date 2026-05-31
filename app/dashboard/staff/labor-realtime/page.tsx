import Link from "next/link";

import { LaborRealtimeTracker } from "@/components/labor/labor-realtime-tracker";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getLaborRealtimeData } from "@/services/labor/labor-realtime-load";

export default async function LaborRealtimePage() {
  const { userId } = await getTenantActor();
  const initial = await getLaborRealtimeData(userId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Labor cost tracker</h1>
          <p className="text-sm text-muted-foreground">
            Real-time labor % vs sales, scheduled cost overlay, and weekly overtime prediction.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link href="/dashboard/staff/schedule" className="rounded-md border px-2 py-1">
            Schedule →
          </Link>
          <Link href="/dashboard/staff/time-clock" className="rounded-md border px-2 py-1">
            Time clock →
          </Link>
        </div>
      </div>

      <LaborRealtimeTracker initial={initial} />
    </div>
  );
}
