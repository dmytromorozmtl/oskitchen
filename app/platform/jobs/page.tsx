import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { getPlatformJobQueueSnapshot } from "@/services/observability/job-monitor-service";

export default async function PlatformJobsPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:automations:read");
  const snap = await getPlatformJobQueueSnapshot();

  return (
    <div className="space-y-8 text-zinc-100">
      <div>
        <h1 className="text-2xl font-semibold">Jobs / queues</h1>
        <p className="mt-1 max-w-3xl text-sm text-zinc-400">
          High-level job counters from Prisma models. This is not a full distributed tracing view — it complements
          Automations and Integrations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="text-base text-white">Channel sync</CardTitle>
            <CardDescription className="text-zinc-500">`ChannelSyncJob` aggregate status.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3 text-sm">
            <Stat label="Pending" value={snap.channelSync.pending} />
            <Stat label="Running" value={snap.channelSync.running} />
            <Stat label="Failed" value={snap.channelSync.failed} highlight />
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="text-base text-white">Exports</CardTitle>
            <CardDescription className="text-zinc-500">`ExportJob` terminal and in-flight counts.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Queued + running" value={snap.exports.queuedOrRunning} />
            <Stat label="Failed" value={snap.exports.failed} highlight />
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="text-base text-white">Imports</CardTitle>
            <CardDescription className="text-zinc-500">`ImportJob` rows in FAILED state.</CardDescription>
          </CardHeader>
          <CardContent>
            <Stat label="Failed" value={snap.imports.failed} highlight />
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="text-base text-white">Automations</CardTitle>
            <CardDescription className="text-zinc-500">Failed executions in the last 24 hours.</CardDescription>
          </CardHeader>
          <CardContent>
            <Stat label="Failed (24h)" value={snap.automations.failedLast24h} highlight />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" className="border-zinc-700 text-zinc-100">
          <Link href="/platform/automations">Automation executions</Link>
        </Button>
        <Button asChild variant="outline" className="border-zinc-700 text-zinc-100">
          <Link href="/platform/errors">Error signals</Link>
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`text-2xl font-semibold tabular-nums ${highlight && value > 0 ? "text-amber-200" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}
