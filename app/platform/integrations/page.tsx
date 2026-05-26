import Link from "next/link";

import { IntegrationActionButton } from "@/components/integrations/integration-action-button";
import { IntegrationHealthDocLink, IntegrationMaturityTable } from "@/components/integrations/integration-maturity-table";
import { WebhookHealthSummary } from "@/components/integrations/webhook-health-summary";
import { CapabilityMatrixPanel } from "@/components/capabilities/capability-matrix-panel";
import { PLATFORM_INTEGRATION_DIAGNOSTICS_VIEWED } from "@/lib/audit/platform-integration-audit-actions";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { hasPlatformPermission } from "@/lib/platform/platform-permissions";
import { auditLog } from "@/services/audit/audit-service";
import {
  loadPlatformIntegrationAggregates,
  loadPlatformWebhookHealth,
} from "@/services/platform/platform-integrations-service";
import { listCapabilities } from "@/services/capabilities/capability-service";

export default async function PlatformIntegrationsPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:integrations:read");
  const canReplay = hasPlatformPermission(ctx.permissions, "platform:integrations:repair");

  void auditLog({
    actor: { userId: ctx.userId, email: ctx.email, role: [...ctx.permissions].slice(0, 6).join(",") },
    action: PLATFORM_INTEGRATION_DIAGNOSTICS_VIEWED,
    category: "PLATFORM",
    source: "SYSTEM",
    entity: { type: "PlatformIntegrationDiagnostics", id: "aggregate", label: "Platform integrations" },
    metadata: { route: "/platform/integrations" },
  });

  const [{ rows, webhookPending, webhookFailedUnprocessed }, hookHealth] = await Promise.all([
    loadPlatformIntegrationAggregates(),
    loadPlatformWebhookHealth(),
  ]);
  const capabilities = listCapabilities();

  return (
    <div className="space-y-6 text-zinc-200">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-zinc-100 [&_.text-muted-foreground]:text-zinc-400">
        <CapabilityMatrixPanel rows={capabilities} title="Product capability matrix" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-white">Integrations</h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400">
          Honest maturity tiers match the workspace Integration health matrix — counts are aggregated across tenant
          owners. No credentials, tokens, or raw webhook bodies are shown.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          <IntegrationActionButton
            action="webhook_replay"
            context={{ isPlatform: true, hasReplayServerAction: canReplay }}
            variant="inline"
          />
          <IntegrationActionButton action="integration_retry" context={{ isPlatform: true }} variant="inline" />
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          <Link href="/platform/health" className="text-amber-200/90 hover:underline">
            Platform health
          </Link>
          <Link href="/platform/webhooks" className="text-amber-200/90 hover:underline">
            Webhook counters
          </Link>
          <IntegrationHealthDocLink className="text-amber-200/90 hover:underline" />
        </div>
      </div>

      <WebhookHealthSummary
        pendingUnprocessed={hookHealth.pendingUnprocessed}
        failedUnprocessed={hookHealth.failedUnprocessed}
        variant="platform"
      />

      <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950/40">
        <IntegrationMaturityTable rows={rows} variant="platform" />
      </div>

      <p className="text-xs text-zinc-500">
        Workspace owners manage live connections under{" "}
        <span className="font-mono text-zinc-400">/dashboard/integration-health</span>. Platform staff can open{" "}
        <span className="font-mono text-zinc-400">/platform/workspaces/[workspaceId]/integration-health</span> for
        read-only diagnostics (no impersonation). Pending webhooks (all tenants): {webhookPending}. Unprocessed with
        errors: {webhookFailedUnprocessed}.
      </p>
    </div>
  );
}
