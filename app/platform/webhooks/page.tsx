import Link from "next/link";

import { canManageProductionIncidentsForUser } from "@/actions/production-incidents";
import { SensitiveErrorPreview } from "@/components/integrations/sensitive-error-preview";
import { WebhookReplayRow } from "@/components/integrations/webhook-replay-row";
import { WebhookHealthSummary } from "@/components/integrations/webhook-health-summary";
import { CapabilityMatrixPanel } from "@/components/capabilities/capability-matrix-panel";
import { ProductionIncidentWorkflowForm } from "@/components/system/production-incident-workflow-form";
import { Button } from "@/components/ui/button";
import { PLATFORM_INTEGRATION_DIAGNOSTICS_VIEWED } from "@/lib/audit/platform-integration-audit-actions";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { hasPlatformPermission } from "@/lib/platform/platform-permissions";
import { toSafeErrorPreview } from "@/lib/security/sensitive-redaction";
import { auditLog } from "@/services/audit/audit-service";
import {
  listProductionIncidentAssignees,
  loadProductionIncidentRollup,
} from "@/services/incidents/production-incident-rollup-service";
import { loadPlatformWebhookHealth } from "@/services/platform/platform-integrations-service";
import {
  listPlatformRecentWebhookEvents,
  listPlatformWebhookDlqItems,
} from "@/services/platform/platform-webhook-diagnostics-service";
import { listCapabilities } from "@/services/capabilities/capability-service";
import { formatDistanceToNow } from "date-fns";

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-600">{hint}</p> : null}
    </div>
  );
}

export default async function PlatformWebhooksPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:integrations:read");
  const canReplay = hasPlatformPermission(ctx.permissions, "platform:integrations:repair");

  void auditLog({
    actor: { userId: ctx.userId, email: ctx.email, role: [...ctx.permissions].slice(0, 6).join(",") },
    action: PLATFORM_INTEGRATION_DIAGNOSTICS_VIEWED,
    category: "PLATFORM",
    source: "SYSTEM",
    entity: { type: "PlatformWebhookDiagnostics", id: "aggregate", label: "Platform webhooks" },
    metadata: { route: "/platform/webhooks" },
  });

  const [health, recent, dlqRows, incidentRollup, assignees, canManageIncidents] = await Promise.all([
    loadPlatformWebhookHealth(),
    listPlatformRecentWebhookEvents(25),
    listPlatformWebhookDlqItems(20),
    loadProductionIncidentRollup(),
    listProductionIncidentAssignees(),
    canManageProductionIncidentsForUser({ id: ctx.userId, email: ctx.email }),
  ]);
  const webhookIncident =
    incidentRollup.items.find((item) => item.source === "webhook_recovery") ?? null;

  const capabilities = listCapabilities();

  return (
    <div className="space-y-6 text-zinc-200">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-zinc-100">
        <CapabilityMatrixPanel rows={capabilities} title="Capability matrix (global)" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-white">Webhooks</h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400">
          Cross-tenant queue, replay, and dead-letter visibility. Replay requires{" "}
          <span className="font-mono">platform:integrations:repair</span>, always writes an audit row, and should
          only be used after the connector root cause is fixed. Async jobs drain on the webhook cron when{" "}
          <span className="font-mono">WEBHOOK_ASYNC_QUEUE=true</span>.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          <span className="text-zinc-500">
            This page is now the platform DLQ triage surface: terminal async failures first, then recent webhook events.
          </span>
          {!canReplay ? (
            <span className="text-zinc-600">
              Replay actions remain hidden until the operator has <span className="font-mono">platform:integrations:repair</span>.
            </span>
          ) : null}
        </div>
      </div>

      <WebhookHealthSummary
        pendingUnprocessed={health.pendingUnprocessed}
        failedUnprocessed={health.failedUnprocessed}
        variant="platform"
      />

      <section>
        <h2 className="mb-3 text-sm font-medium text-zinc-300">Queue state</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Queued jobs" value={health.queuedJobs} />
          <Stat label="Retrying jobs" value={health.retryingJobs} />
          <Stat label="Terminal job failures" value={health.terminalFailedJobs} hint="FAILED / UNSUPPORTED / SIGNATURE_FAILED" />
          <Stat label="Open recovery items" value={health.openRecoveryItems} hint="Current webhook DLQ workload" />
        </div>
      </section>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-white">Webhook recovery workflow</h2>
              {webhookIncident ? (
                <>
                  <span
                    className={
                      webhookIncident.severity === "critical"
                        ? "rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] uppercase text-rose-300"
                        : "rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] uppercase text-amber-200"
                    }
                  >
                    {webhookIncident.severity}
                  </span>
                  <span
                    className={
                      webhookIncident.workflowStatus === "OPEN"
                        ? "rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] uppercase text-rose-300"
                        : webhookIncident.workflowStatus === "ACKNOWLEDGED"
                          ? "rounded-full bg-zinc-100/10 px-2 py-0.5 text-[11px] uppercase text-zinc-200"
                          : "rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] uppercase text-zinc-300"
                    }
                  >
                    {webhookIncident.workflowStatus.toLowerCase()}
                  </span>
                </>
              ) : (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] uppercase text-emerald-300">
                  healthy
                </span>
              )}
            </div>
            <p className="max-w-3xl text-sm text-zinc-400">
              {webhookIncident
                ? webhookIncident.summary
                : "No active webhook recovery incident is currently open in the unified production incident lifecycle."}
            </p>
            {webhookIncident ? (
              <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                <span>
                  Owner {webhookIncident.assignedToName ?? webhookIncident.assignedToEmail ?? webhookIncident.ownerLabel}
                </span>
                <span>Last seen {new Date(webhookIncident.lastSeenAt).toISOString().slice(0, 19)}Z</span>
                {webhookIncident.badges.map((badge) => (
                  <span
                    key={`${webhookIncident.id}:${badge}`}
                    className="rounded-full border border-zinc-700 px-2 py-0.5"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            ) : null}
            {dlqRows.length > 0 ? (
              <div className="space-y-1 text-xs text-zinc-400">
                <p className="font-medium text-zinc-200">Top open recovery blockers</p>
                <ul className="space-y-1">
                  {dlqRows.slice(0, 5).map((row) => (
                    <li key={row.id} className="rounded border border-zinc-800 bg-zinc-950/60 px-3 py-2">
                      {row.provider ?? "Unknown provider"} · {row.eventType ?? "unknown event"}
                      {row.attempts != null
                        ? ` · attempts ${row.attempts}${row.maxAttempts != null ? `/${row.maxAttempts}` : ""}`
                        : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <Button asChild variant="ghost" size="sm" className="rounded-full text-amber-200 hover:text-amber-100">
              <Link href="/dashboard/system-health/incidents">Open incident queue</Link>
            </Button>
            {canManageIncidents && webhookIncident ? (
              <ProductionIncidentWorkflowForm
                incident={webhookIncident}
                assignees={assignees}
                className="grid w-full min-w-[320px] gap-2 rounded-lg border border-zinc-700 bg-zinc-950/70 p-3 text-xs md:w-[380px]"
                submitLabel="Save webhook workflow"
              />
            ) : null}
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-white">Terminal failures / DLQ</h2>
          <p className="mt-1 max-w-3xl text-sm text-zinc-400">
            Open recovery items created when async webhook jobs exhaust retries or hit a terminal failure. Use workspace
            links to inspect connector health, then replay the specific event only after the root cause is fixed.
          </p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-3 py-2">Updated</th>
                <th className="px-3 py-2">Workspace</th>
                <th className="px-3 py-2">Provider / event</th>
                <th className="px-3 py-2">Job state</th>
                <th className="px-3 py-2">Error (sanitized)</th>
                <th className="px-3 py-2">Suggested action</th>
                <th className="px-3 py-2">Replay</th>
              </tr>
            </thead>
            <tbody>
              {dlqRows.length === 0 ? (
                <tr className="border-t border-zinc-800">
                  <td colSpan={7} className="px-3 py-6 text-zinc-500">
                    No open webhook DLQ items. The async queue does not currently have terminal failures requiring operator action.
                  </td>
                </tr>
              ) : (
                dlqRows.map((row) => (
                  <tr key={row.id} className="border-t border-zinc-800">
                    <td className="px-3 py-2 text-xs text-zinc-500">
                      {formatDistanceToNow(row.updatedAt, { addSuffix: true })}
                    </td>
                    <td className="px-3 py-2 align-top text-xs">
                      <div className="space-y-1">
                        <p className="font-medium text-zinc-100">
                          {row.workspaceHref ? (
                            <Link href={row.workspaceHref} className="hover:underline">
                              {row.workspaceName ?? "Workspace"}
                            </Link>
                          ) : (
                            row.workspaceName ?? "Workspace unavailable"
                          )}
                        </p>
                        {row.integrationHealthHref ? (
                          <Link
                            href={row.integrationHealthHref}
                            className="text-amber-200/90 hover:underline"
                          >
                            Integration health
                          </Link>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top text-xs">
                      <p className="font-medium text-zinc-100">{row.provider ?? "Unknown provider"}</p>
                      <p className="font-mono text-zinc-400">{row.eventType ?? "unknown event"}</p>
                      {row.receivedAt ? (
                        <p className="mt-1 text-zinc-500">
                          event {formatDistanceToNow(row.receivedAt, { addSuffix: true })} · sig{" "}
                          {row.signatureValid == null ? "—" : row.signatureValid ? "valid" : "invalid"}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-zinc-400">
                      <p className="font-medium text-zinc-100">
                        {row.jobStatus?.toLowerCase().replace(/_/g, " ") ?? "unknown"}
                      </p>
                      {row.attempts != null ? (
                        <p>
                          attempts {row.attempts}
                          {row.maxAttempts != null ? `/${row.maxAttempts}` : ""}
                        </p>
                      ) : null}
                      {row.nextAttemptAt ? (
                        <p>next attempt {formatDistanceToNow(row.nextAttemptAt, { addSuffix: true })}</p>
                      ) : null}
                    </td>
                    <td className="max-w-[240px] px-3 py-2 align-top">
                      <SensitiveErrorPreview
                        text={row.lastErrorPreview}
                        redacted={row.lastErrorRedacted}
                        textClassName="text-xs text-zinc-400"
                      />
                    </td>
                    <td className="max-w-[260px] px-3 py-2 align-top text-xs text-zinc-400">
                      {row.suggestedAction ?? "Inspect connector health and only replay after fixing the root cause."}
                    </td>
                    <td className="min-w-[220px] px-3 py-2 align-top">
                      {row.webhookEventId && canReplay ? (
                        <WebhookReplayRow
                          webhookEventId={row.webhookEventId}
                          signatureValid={row.signatureValid !== false}
                          surface="platform"
                        />
                      ) : row.webhookEventId ? (
                        <span className="text-xs text-zinc-500">
                          Repair permission required for replay.
                        </span>
                      ) : row.safeRetryHref ? (
                        <Link href={row.safeRetryHref} className="text-xs text-amber-200/90 hover:underline">
                          Open safe retry path
                        </Link>
                      ) : (
                        <span className="text-xs text-zinc-500">Replay unavailable</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-white">Recent webhook events</h2>
          <p className="mt-1 max-w-3xl text-sm text-zinc-400">
            Cross-tenant event stream with sanitized error previews and direct links to the owning workspace. This table
            is for investigation; the DLQ panel above should drive terminal-failure triage.
          </p>
        </div>
      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Workspace</th>
              <th className="px-3 py-2">Provider</th>
              <th className="px-3 py-2">Topic</th>
              <th className="px-3 py-2">Processed</th>
              <th className="px-3 py-2">Signature</th>
              <th className="px-3 py-2">Error (sanitized)</th>
              <th className="px-3 py-2">Replay</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((e) => (
              <tr key={e.id} className="border-t border-zinc-800">
                <td className="px-3 py-2 text-xs text-zinc-500">
                  {formatDistanceToNow(e.receivedAt, { addSuffix: true })}
                </td>
                <td className="px-3 py-2 align-top text-xs">
                  <div className="space-y-1">
                    <p className="font-medium text-zinc-100">
                      {e.workspaceHref ? (
                        <Link href={e.workspaceHref} className="hover:underline">
                          {e.workspaceName ?? "Workspace"}
                        </Link>
                      ) : (
                        e.workspaceName ?? "Workspace unavailable"
                      )}
                    </p>
                    {e.integrationHealthHref ? (
                      <Link href={e.integrationHealthHref} className="text-amber-200/90 hover:underline">
                        Integration health
                      </Link>
                    ) : null}
                  </div>
                </td>
                <td className="px-3 py-2">{e.provider}</td>
                <td className="px-3 py-2 font-mono text-xs">{e.topic}</td>
                <td className="px-3 py-2">{e.processed ? "yes" : "no"}</td>
                <td className="px-3 py-2">{e.signatureValid ? "valid" : "invalid"}</td>
                <td className="max-w-[220px] px-3 py-2 text-xs text-zinc-500">
                  <SensitiveErrorPreview
                    text={e.processingErrorPreview}
                    redacted={e.processingErrorRedacted}
                    textClassName="text-xs text-zinc-400"
                  />
                </td>
                <td className="min-w-[220px] px-3 py-2 align-top">
                  {canReplay ? (
                    <WebhookReplayRow
                      webhookEventId={e.id}
                      signatureValid={e.signatureValid}
                      surface="platform"
                    />
                  ) : (
                    <span className="text-xs text-zinc-500">Repair permission required for replay.</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </section>

      <p className="text-xs text-zinc-500">
        Workspace owners still see tenant-scoped diagnostics under their own dashboard. Platform operators should start
        from the DLQ row, inspect the workspace integration health, then use audited replay only when the failure cause
        is understood and corrected.
      </p>
    </div>
  );
}
