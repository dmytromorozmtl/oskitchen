import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireDeveloperCenterAccess } from "@/lib/developer/developer-permissions";
import { getDeveloperCenterSnapshot } from "@/services/developer/developer-service";

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="border-border/80 bg-card/90 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      {hint ? (
        <CardContent className="pt-0 text-xs text-muted-foreground">{hint}</CardContent>
      ) : null}
    </Card>
  );
}

function SectionLink({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="block rounded-xl border border-border/70 bg-muted/20 p-4 transition hover:bg-muted/40">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <p className="mt-2 text-xs font-medium text-primary">Open →</p>
    </Link>
  );
}

export default async function DeveloperPage() {
  const ctx = await requireDeveloperCenterAccess();
  const snap = await getDeveloperCenterSnapshot({
    userId: ctx.userId,
    platformSuper: ctx.platformSuper,
  });

  const healthBadge =
    snap.platformHealth.overall === "operational"
      ? "operational"
      : snap.platformHealth.overall === "degraded"
        ? "degraded"
        : "attention";

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-full font-mono text-[10px] uppercase">
            {snap.envLabel}
          </Badge>
          <Badge variant="secondary" className="rounded-full font-mono text-[10px] uppercase">
            v{snap.version}
          </Badge>
          <Badge
            variant={healthBadge === "operational" ? "default" : "destructive"}
            className="rounded-full text-[10px] uppercase"
          >
            {healthBadge.replaceAll("_", " ")}
          </Badge>
          <Badge variant="outline" className="rounded-full text-[10px] uppercase">
            incidents: {snap.kpis.openIncidents}
          </Badge>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Developer Center</h1>
        <p className="max-w-3xl text-muted-foreground">
          Platform operations, integrations, observability, releases, API management, infrastructure health, and
          developer tooling. Environment checks are presence-only — secret values are never displayed.
        </p>
      </div>

      {snap.environment.productionGaps.length > 0 ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Production launch gaps</CardTitle>
            <CardDescription>{snap.environment.productionGaps.join(" · ")}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {snap.environment.suspicionMessages.length > 0 ? (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-base text-amber-800 dark:text-amber-200">Credential hygiene</CardTitle>
            <CardDescription>Pattern-based signals only — values are never shown.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {snap.environment.suspicionMessages.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Operations KPIs</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi
            label="Public API (metering)"
            value={snap.kpis.apiRequestsToday ?? "—"}
            hint={snap.kpis.apiRequestsToday == null ? "Wire usage metering to populate this tile." : undefined}
          />
          <Kpi label="Failed webhooks (24h)" value={snap.kpis.failedWebhooks24h} />
          <Kpi label="Active integrations" value={snap.kpis.activeIntegrations} />
          <Kpi label="Queued jobs" value={snap.kpis.queuedJobs} />
          <Kpi label="Failed jobs" value={snap.kpis.failedJobs} />
          <Kpi
            label="Deployment"
            value={snap.kpis.deploymentOk ? "OK" : "Check"}
            hint={snap.deployment.gitSha ? `Commit ${snap.deployment.gitSha}` : undefined}
          />
          <Kpi label="Environment" value={snap.kpis.environmentHealth} />
          <Kpi label="Open incidents" value={snap.kpis.openIncidents} />
          <Kpi label="Cron health" value={snap.kpis.cronHealth} hint="Connect scheduler telemetry for live status." />
          <Kpi label="Active API keys" value={snap.kpis.apiKeysActive} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <SectionLink
          title="Platform health"
          description="Database, Supabase, Stripe, Resend, and production readiness probes."
          href="/dashboard/developer/health"
        />
        <SectionLink
          title="Releases"
          description="Draft and publish changelog entries tied to semantic versions."
          href="/dashboard/developer/releases"
        />
        <SectionLink
          title="API management"
          description="Enterprise keys for /api/public/v1 — hashed storage, revoke and rotation."
          href="/dashboard/developer/api-keys"
        />
        <SectionLink
          title="Integration observability"
          description="Per-provider auth state, sync cadence, and webhook posture."
          href="/dashboard/developer/integrations"
        />
        <SectionLink
          title="Webhook monitor"
          description="Recent deliveries, failures, and signature validation (no raw secrets)."
          href="/dashboard/developer/webhooks"
        />
        <SectionLink
          title="Queues & jobs"
          description="Channel sync, imports, exports — operational backlog at a glance."
          href="/dashboard/developer/jobs"
        />
        <SectionLink
          title="Environment diagnostics"
          description="Grouped variables with ok / missing / insecure / deprecated signals."
          href="/dashboard/developer/health#env"
        />
        <SectionLink
          title="Incidents"
          description="Investigate, document mitigation, and resolve platform incidents."
          href="/dashboard/developer/incidents"
        />
        <SectionLink
          title="Logs & tracing"
          description="Developer-scoped audit trail entries (redacted metadata)."
          href="/dashboard/developer/logs"
        />
        <SectionLink
          title="Developer tools"
          description="Audited operational utilities — rate-limited and tenant-safe."
          href="/dashboard/developer/tools"
        />
        <SectionLink
          title="SDK & docs"
          description="Authentication, webhooks, imports, and deployment checklists."
          href="/dashboard/developer/docs"
        />
        <SectionLink
          title="Feature flags"
          description="Effective entitlements for this workspace (read-only view)."
          href="/dashboard/developer/flags"
        />
        <SectionLink
          title="Performance"
          description="Latency placeholders until APM is connected."
          href="/dashboard/developer/performance"
        />
      </div>

      {process.env.NODE_ENV !== "production" ? (
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Email previews</CardTitle>
            <CardDescription>Static HTML samples — local development only.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/developer/email-preview" className="text-primary hover:underline">
              Open email preview
            </Link>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
