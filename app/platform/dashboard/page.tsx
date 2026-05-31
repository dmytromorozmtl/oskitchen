import Link from "next/link";

import { canManageProductionIncidentsForUser } from "@/actions/production-incidents";
import { PlatformProductionIncidentPanel } from "@/components/platform/production-incident-panel";
import { PlatformProductionIncidentReportPanel } from "@/components/platform/production-incident-report-panel";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import {
  listProductionIncidentAssignees,
} from "@/services/incidents/production-incident-rollup-service";
import { loadProductionIncidentExecutiveSnapshot } from "@/services/incidents/production-incident-reporting-service";
import { getPlatformDashboardSnapshot } from "@/services/platform/platform-service";

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-600">{hint}</p> : null}
    </div>
  );
}

export default async function PlatformDashboardPage() {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:access");
  const [s, incidentSnapshot, assignees, canManageIncidents] = await Promise.all([
    getPlatformDashboardSnapshot(),
    loadProductionIncidentExecutiveSnapshot(),
    listProductionIncidentAssignees(),
    canManageProductionIncidentsForUser({ id: ctx.userId, email: ctx.email }),
  ]);
  const { rollup: incidentRollup, report: incidentReport } = incidentSnapshot;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-white">Command center</h1>
        <p className="mt-1 max-w-3xl text-sm text-zinc-400">
          Cross-tenant snapshot for OS Kitchen operators. Revenue and churn rollups wire to Stripe and
          warehouse exports when available — never guess paid state.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium text-zinc-300">Top KPIs</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <Stat label="Workspaces" value={s.workspaces} />
          <Stat label="Active workspaces" value={s.activeWorkspaces} />
          <Stat label="Trial workspaces (trial records)" value={s.trials} hint="User-level trials" />
          <Stat label="Paid (Stripe-linked)" value={s.paid} />
          <Stat label="MRR" value="—" hint="Stripe revenue pipeline" />
          <Stat label="ARR" value="—" hint="Stripe revenue pipeline" />
          <Stat label="Churn risk" value="—" hint="Health snapshots pending" />
          <Stat label="Open tickets" value={s.openTickets} />
          <Stat label="Critical (open)" value={s.criticalTickets} />
          <Stat label="Integration errors" value={s.integrationErrors} />
          <Stat label="Webhooks pending" value={s.webhookPending} />
          <Stat label="Failed automations" value={s.automationFailures} />
          <Stat
            label="Active incidents"
            value={s.activeIncidents}
            hint={`${s.criticalProductionIncidents} critical in persistent workflow`}
          />
          <Stat label="Onboarding projects" value={s.onboardingProjects ?? "—"} />
          <Stat label="Go-lives this week" value={s.goLivesThisWeek ?? "—"} />
          <Stat label="Beta applications" value={s.betaApplications ?? "—"} />
        </div>
      </section>

      <PlatformProductionIncidentPanel
        title="Production incident command queue"
        description={`Highest-priority production incidents surfaced directly in the command center. Critical: ${incidentRollup.summary.critical} / open: ${incidentRollup.summary.open}.`}
        incidents={incidentRollup.items}
        assignees={assignees}
        canManage={canManageIncidents}
        emptyLabel="No active production incidents are currently open."
        ctaHref="/platform/incidents"
        ctaLabel="Open full incident hub"
        maxItems={3}
      />

      <PlatformProductionIncidentReportPanel
        title="Incident response metrics"
        description="Executive response quality metrics for the persistent production incident workflow."
        report={incidentReport}
        maxAttention={4}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="text-sm font-semibold text-white">Platform health</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-400">
            <li>Integrations tracked: {s.integrations}</li>
            <li>Connections in error: {s.integrationErrors}</li>
            <li>Webhook backlog: {s.webhookPending}</li>
            <li>Automation failures (lifetime counter): {s.automationFailures}</li>
            <li>Open production incidents: {s.activeIncidents}</li>
          </ul>
          <Link href="/platform/health" className="mt-4 inline-block text-xs text-amber-200/90 hover:underline">
            Open health hub →
          </Link>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="text-sm font-semibold text-white">Support queue</h2>
          {s.openTickets === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">
              No tickets yet. Customer support requests across all workspaces will appear here.
            </p>
          ) : (
            <p className="mt-3 text-sm text-zinc-400">
              {s.openTickets} open-like tickets · {s.criticalTickets} critical while open.
            </p>
          )}
          <Link href="/platform/support" className="mt-4 inline-block text-xs text-amber-200/90 hover:underline">
            Support inbox →
          </Link>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="text-sm font-semibold text-white">Billing & trials</h2>
          <p className="mt-3 text-sm text-zinc-400">
            Paid seats (Stripe-linked active): {s.paid}. User profiles: {s.users}. Organizations:{" "}
            {s.organizations}.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <Link href="/platform/billing" className="text-amber-200/90 hover:underline">
              Billing
            </Link>
            <Link href="/platform/trials" className="text-amber-200/90 hover:underline">
              Trials
            </Link>
            <Link href="/platform/entitlements" className="text-amber-200/90 hover:underline">
              Entitlements
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="text-sm font-semibold text-white">Integration failures</h2>
          {s.integrationErrors === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">All integrations are healthy.</p>
          ) : (
            <p className="mt-3 text-sm text-amber-200/90">{s.integrationErrors} connections need attention.</p>
          )}
          <Link href="/platform/integrations" className="mt-4 inline-block text-xs text-amber-200/90 hover:underline">
            Troubleshoot →
          </Link>
        </section>
      </div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="text-sm font-semibold text-white">Recent platform audit</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="py-2 pr-4">When</th>
                <th className="py-2 pr-4">Action</th>
                <th className="py-2 pr-4">Entity</th>
                <th className="py-2">Workspace</th>
              </tr>
            </thead>
            <tbody>
              {s.recentPlatformAudit.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-zinc-500">
                    No platform-scoped audit rows yet.
                  </td>
                </tr>
              ) : (
                s.recentPlatformAudit.map((row) => (
                  <tr key={row.id} className="border-t border-zinc-800">
                    <td className="py-2 pr-4 font-mono text-xs text-zinc-500">
                      {row.createdAt.toISOString().slice(0, 19).replace("T", " ")}
                    </td>
                    <td className="py-2 pr-4">{row.action}</td>
                    <td className="py-2 pr-4">
                      {row.entityType ?? "—"} {row.entityLabel ? `· ${row.entityLabel}` : ""}
                    </td>
                    <td className="py-2 font-mono text-xs">{row.workspaceId ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Link href="/platform/audit" className="mt-4 inline-block text-xs text-amber-200/90 hover:underline">
          Full audit log →
        </Link>
      </section>
    </div>
  );
}
