import Link from "next/link";

import { canManageProductionIncidentsForUser } from "@/actions/production-incidents";
import { PlatformProductionIncidentPanel } from "@/components/platform/production-incident-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { rollupFromCounts } from "@/lib/observability/status-types";
import {
  listProductionIncidentAssignees,
  loadProductionIncidentRollup,
} from "@/services/incidents/production-incident-rollup-service";
import { getPlatformObservabilityRollupCounts } from "@/services/observability/error-event-service";
import { getServerHealthSignals, loadExtendedHealthSnapshot } from "@/services/observability/health-check-service";

export default async function PlatformHealthPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:access");
  const [signals, counts, extended, incidentRollup, assignees, canManageIncidents] = await Promise.all([
    getServerHealthSignals(),
    getPlatformObservabilityRollupCounts(),
    loadExtendedHealthSnapshot(),
    loadProductionIncidentRollup(),
    listProductionIncidentAssignees(),
    canManageProductionIncidentsForUser({ id: ctx.userId, email: ctx.email }),
  ]);
  const rollup = rollupFromCounts(counts);
  const label =
    rollup === "HEALTHY" ? "Healthy" : rollup === "DEGRADED" ? "Needs attention" : "Critical path";

  return (
    <div className="space-y-8 text-zinc-100">
      <div>
        <h1 className="text-2xl font-semibold">Platform health</h1>
        <p className="mt-1 max-w-3xl text-sm text-zinc-400">
          Environment reachability and cross-tenant operational counters. This page intentionally avoids payload
          previews and secret material.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-zinc-500">Operational rollup</span>
        <Badge
          className={
            rollup === "HEALTHY"
              ? "border-emerald-700 bg-emerald-900/40 text-emerald-100"
              : rollup === "DEGRADED"
                ? "border-amber-700 bg-amber-900/40 text-amber-100"
                : "border-red-700 bg-red-900/40 text-red-100"
          }
        >
          {label}
        </Badge>
        <Button asChild variant="link" className="text-amber-200">
          <Link href="/platform/errors">Open error signals</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Signal title="Database" ok={signals.databaseReachable} okLabel="Reachable" badLabel="Unreachable" />
        <Signal title="Stripe billing" ok={signals.stripeBillingConfigured} okLabel="Configured" badLabel="Missing" />
        <Signal title="OpenAI (optional)" ok={signals.openAiConfigured} okLabel="Present" badLabel="Not set" />
        <Signal
          title="Uber Direct"
          ok={signals.uberDirectLiveReady}
          okLabel="Live-ready"
          badLabel={signals.uberDirectCredentialsPresent ? "Credentials present, placeholder mode" : "Not set"}
        />
        <Signal
          title="Email provider"
          ok={signals.resendOrEmailProviderConfigured}
          okLabel="Configured"
          badLabel="Not set"
        />
        <Signal
          title="Sentry (server SDK)"
          ok={extended.sentryServer === "live"}
          okLabel="Live — SDK initialized with SENTRY_DSN"
          badLabel={
            extended.sentryServer === "not_configured"
              ? "Not configured"
              : "DSN set but SDK not initialized — check instrumentation / build"
          }
        />
        <Signal
          title="Distributed rate limits"
          ok={extended.rateLimit.adapter === "upstash" || extended.rateLimit.adapter === "redis"}
          okLabel="Distributed adapter active"
          badLabel="Memory adapter (per instance)"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Mini title="Webhooks queued" value={counts.webhookQueued} href="/platform/webhooks" />
        <Mini title="Webhook errors (7d)" value={counts.webhookProcessingErrors7d} href="/platform/errors" />
        <Mini title="Open webhook job recoveries" value={counts.openWebhookJobRecoveries} href="/platform/errors" />
        <Mini title="Sync failed" value={counts.channelSyncFailed} href="/platform/integrations" />
        <Mini title="Notifications failed (7d)" value={counts.notificationFailures7d} href="/platform/errors" />
      </div>

      <PlatformProductionIncidentPanel
        title="Active production incident workflow"
        description={`Persistent production incident queue across startup readiness, critical cron execution, and webhook recovery. Critical: ${incidentRollup.summary.critical} / open: ${incidentRollup.summary.open}.`}
        incidents={incidentRollup.items}
        assignees={assignees}
        canManage={canManageIncidents}
        emptyLabel="No active production incidents are currently open."
        ctaHref="/platform/incidents"
        ctaLabel="Open platform incident hub"
        maxItems={3}
      />

      <Card className="border-zinc-800 bg-zinc-900/60">
        <CardHeader>
          <CardTitle className="text-base text-white">Honest limitations</CardTitle>
          <CardDescription className="text-zinc-500">
            Queue depth for every subsystem is not yet unified — use Jobs and Automations for execution tables.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 text-sm">
          <Button asChild variant="outline" className="border-zinc-700 text-zinc-100">
            <Link href="/platform/jobs">Jobs / queues</Link>
          </Button>
          <Button asChild variant="outline" className="border-zinc-700 text-zinc-100">
            <Link href="/platform/system-health">System health (ops)</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Signal({
  title,
  ok,
  okLabel,
  badLabel,
}: {
  title: string;
  ok: boolean;
  okLabel: string;
  badLabel: string;
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-zinc-300">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={ok ? "text-emerald-300" : "text-amber-200"}>{ok ? okLabel : badLabel}</p>
      </CardContent>
    </Card>
  );
}

function Mini({ title, value, href }: { title: string; value: number; href: string }) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-zinc-300">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2">
        <p className="text-2xl font-semibold tabular-nums text-white">{value}</p>
        <Button asChild variant="link" className="text-amber-200">
          <Link href={href}>Open</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
