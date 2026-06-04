import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { runIntegrationHealthCheckFormAction } from "@/actions/integration-health";
import { PageHeader } from "@/components/layout/page-header";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CapabilityBadge } from "@/components/capabilities/capability-badge";
import { BetaIntegrationEnvReadinessPanel } from "@/components/integrations/beta-integration-env-readiness-panel";
import { LiveIntegrationDodPanel } from "@/components/integrations/live-integration-dod-panel";
import { IntegrationForceSyncPanel } from "@/components/integrations/integration-force-sync-panel";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  getCachedIntegrationConnectionListWhere,
  getCachedWebhookEventListWhere,
} from "@/lib/scope/cached-workspace-resource-scope";
import { describeIntegrationConnectionHealth } from "@/lib/integrations/integration-connection-health";
import { prisma } from "@/lib/prisma";

export default async function IntegrationHealthPage() {
  await getTenantActor();

  const [connectionWhere, webhookWhere] = await Promise.all([
    getCachedIntegrationConnectionListWhere(),
    getCachedWebhookEventListWhere(),
  ]);
  const [connections, webhookFailCount] = await Promise.all([
    prisma.integrationConnection.findMany({
      where: connectionWhere,
      orderBy: { updatedAt: "desc" },
      include: {
        healthChecks: { orderBy: { checkedAt: "desc" }, take: 1 },
      },
    }),
    prisma.webhookEvent.count({
      where: { AND: [webhookWhere, { processed: false, signatureValid: false }] },
    }),
  ]);

  return (
    <PageShell narrow className="space-y-8">
      <PageHeader
        title="Integration health"
        description="Status reflects real capability maturity (BETA / roadmap) — not a fake green indicator. Run a manual check after credentials are saved."
        actions={
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/dashboard/sales-channels">← Channel operations center</Link>
          </Button>
        }
      />

      {webhookFailCount > 0 ? (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-base">Webhook attention</CardTitle>
            <CardDescription>
              {webhookFailCount} event(s) with invalid signature or still unprocessed — inspect the
              webhook log.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <IntegrationForceSyncPanel />

      <BetaIntegrationEnvReadinessPanel />

      <LiveIntegrationDodPanel />

      <PageSection
        title="Connections"
        description="Per-provider health checks reflect real credential and sync state."
      >
        <div className="grid gap-4">
          {connections.map((c) => {
          const last = c.healthChecks[0];
          const hasCredentials = Boolean(
            c.accessTokenEncrypted || c.consumerKeyEncrypted || c.consumerSecretEncrypted,
          );
          const truth = describeIntegrationConnectionHealth({
            provider: String(c.provider),
            connectionStatus: c.status,
            hasCredentials,
            lastHealthCheckOk: last?.status === "OK",
          });
          return (
            <Card key={c.id} className="border-border/80">
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                    {c.name}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      {c.provider}
                    </span>
                    {truth.capabilityStatus ? (
                      <CapabilityBadge status={truth.capabilityStatus} />
                    ) : null}
                  </CardTitle>
                  <CardDescription>
                    {truth.headline} · connection {c.status}
                    {c.lastSyncAt
                      ? ` · last sync ${formatDistanceToNow(c.lastSyncAt, { addSuffix: true })}`
                      : ""}
                  </CardDescription>
                  <p className="mt-1 text-xs text-muted-foreground">{truth.detail}</p>
                </div>
                <form action={runIntegrationHealthCheckFormAction}>
                  <input type="hidden" name="connectionId" value={c.id} />
                  <Button type="submit" size="sm" className="rounded-full" variant="outline">
                    Check health
                  </Button>
                </form>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {last ? (
                  <p>
                    Last check: {last.status} · {last.latencyMs}ms ·{" "}
                    {formatDistanceToNow(last.checkedAt, { addSuffix: true })}
                    {last.errorMessage ? ` — ${last.errorMessage}` : ""}
                  </p>
                ) : (
                  <p>No health checks yet — run a manual check.</p>
                )}
              </CardContent>
            </Card>
          );
        })}
          {!connections.length ? (
            <p className="text-sm text-muted-foreground">No connections yet.</p>
          ) : null}
        </div>
      </PageSection>
    </PageShell>
  );
}
