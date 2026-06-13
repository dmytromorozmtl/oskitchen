import Link from 'next/link';
import { Activity, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

import type { PublicIntegrationFleetSnapshot } from '@/lib/marketing/integration-status-page-data';
import {
  INTEGRATION_STATUS_PAGE_EXPECTED_COUNT,
  PUBLIC_INTEGRATION_STATUS_LABELS,
  publicIntegrationStatusCtaHref,
  type PublicIntegrationDisplayStatus,
} from '@/lib/marketing/integration-status-page-content';
import { cn } from '@/lib/utils';

function statusIcon(status: PublicIntegrationDisplayStatus) {
  switch (status) {
    case 'verified':
      return CheckCircle2;
    case 'smoke_failed':
      return AlertTriangle;
    case 'monitoring_pending':
      return Clock;
  }
}

function statusClass(status: PublicIntegrationDisplayStatus): string {
  switch (status) {
    case 'verified':
      return 'text-emerald-700 dark:text-emerald-400';
    case 'smoke_failed':
      return 'text-rose-700 dark:text-rose-400';
    case 'monitoring_pending':
      return 'text-amber-700 dark:text-amber-400';
  }
}

export function IntegrationStatusFleetPanel({
  snapshot,
}: {
  snapshot: PublicIntegrationFleetSnapshot;
}) {
  const providerRows = snapshot.rows.filter((row) => row.integrationId !== 'integration-health');

  return (
    <section className="space-y-6" aria-labelledby="integration-fleet-heading">
      <div>
        <h2 id="integration-fleet-heading" className="text-xl font-semibold">
          Integration fleet
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {INTEGRATION_STATUS_PAGE_EXPECTED_COUNT} LIVE surfaces — status from last staging smoke
          run. Uptime percentages are not shown until merchant credentials enable continuous
          monitoring.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Verified</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-700">{snapshot.passedCount}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Monitoring pending</p>
          <p className="mt-1 text-2xl font-semibold text-amber-700">{snapshot.skippedCount}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Smoke failed</p>
          <p className="mt-1 text-2xl font-semibold text-rose-700">{snapshot.failedCount}</p>
        </div>
      </div>

      <p
        className="rounded-lg border border-border/80 bg-muted/40 p-4 text-sm text-muted-foreground"
        data-testid="integration-status-honesty-disclaimer"
      >
        <strong>Honesty disclaimer:</strong> {snapshot.honestyNote} We do not publish fabricated
        99.9% uptime — only staging smoke results and platform health checks.
      </p>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="px-4 py-3 font-medium">Integration</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Uptime / monitoring</th>
            </tr>
          </thead>
          <tbody>
            {providerRows.map((row) => {
              const Icon = statusIcon(row.displayStatus);
              return (
                <tr key={row.integrationId} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className={cn('px-4 py-3', statusClass(row.displayStatus))}>
                    <span className="inline-flex items-center gap-2">
                      <Icon className="h-4 w-4" aria-hidden />
                      {PUBLIC_INTEGRATION_STATUS_LABELS[row.displayStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.uptimeLabel}
                    {row.reason ? (
                      <span className="mt-0.5 block text-xs">{row.reason}</span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {snapshot.runAt ? (
        <p className="text-xs text-muted-foreground">
          Last fleet smoke: {new Date(snapshot.runAt).toLocaleString()} · Overall:{' '}
          {snapshot.overall ?? 'unknown'}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href={publicIntegrationStatusCtaHref('/restaurant-integration-health')} className="text-primary underline">
          Integration Health overview
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link href={publicIntegrationStatusCtaHref('/roadmap')} className="text-primary underline">
          Product roadmap
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link href={publicIntegrationStatusCtaHref('/book-demo')} className="text-primary underline">
          Book a demo
        </Link>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Activity className="h-4 w-4" aria-hidden />
        Signed-in operators: detailed health at /dashboard/integration-health/live
      </div>
    </section>
  );
}
