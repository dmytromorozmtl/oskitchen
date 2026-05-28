import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { startOfDay } from "date-fns";

import { PlatformWorkspaceGoLivePanel } from "@/components/platform/platform-workspace-go-live-panel";
import { getSessionUser } from "@/lib/auth";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { isImpersonationMfaConfigured } from "@/lib/platform/impersonation-mfa";
import { hasPlatformPermission } from "@/lib/platform/platform-permissions";
import { isSuperAdminUser } from "@/lib/platform-super-bypass";
import { SUPPORT_SESSION_COOKIE } from "@/lib/platform/support-session-types";
import { prisma } from "@/lib/prisma";
import { loadPlatformWorkspaceGoLiveProjects } from "@/services/platform/platform-go-live-service";
import { getActiveSupportSessionForActor } from "@/services/platform/platform-support-session-service";
import { platformGetWorkspace } from "@/services/platform/platform-workspace-service";
import { resolveAllChannels } from "@/lib/channels/channel-runtime";
import { maturityTierFromResolvedChannel } from "@/lib/integrations/integration-maturity-matrix";
import { StartSupportSessionPanel } from "@/components/platform/start-support-session-panel";
import { Badge } from "@/components/ui/badge";

export default async function PlatformWorkspaceDetailPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:workspaces:read");
  const ws = await platformGetWorkspace(workspaceId);
  if (!ws) notFound();

  const sub = ws.owner.subscription;
  const trial = ws.owner.trialState;
  const today = startOfDay(new Date());
  const ownerProfileId = ws.ownerUserId;
  const [posOrdersToday, posOrdersMissingTxn, openShifts, ownerConnections, ownerKitchen] = await Promise.all([
    prisma.order.count({
      where: { userId: ownerProfileId, creationSource: "POS", createdAt: { gte: today } },
    }),
    prisma.order.count({
      where: { userId: ownerProfileId, creationSource: "POS", posTransactions: { none: {} } },
    }),
    prisma.pOSShift.count({
      where: { userId: ownerProfileId, status: "OPEN" },
    }),
    prisma.integrationConnection.findMany({
      where: { userId: ownerProfileId },
    }),
    prisma.kitchenSettings.findUnique({
      where: { userId: ownerProfileId },
      select: { demoMode: true },
    }),
  ]);

  const resolvedChannels = resolveAllChannels(ownerConnections, ownerKitchen?.demoMode ?? false);

  const me = await getSessionUser();
  const canImpersonate = me ? await isSuperAdminUser(me.id, me.email) : false;
  const canStartSupportSession = hasPlatformPermission(ctx.permissions, "platform:support-session:start");

  const jar = await cookies();
  const supportSessionId = jar.get(SUPPORT_SESSION_COOKIE)?.value;
  const supportSession = supportSessionId
    ? await getActiveSupportSessionForActor(ctx.userId, supportSessionId)
    : null;
  const activeSupportWorkspaceId =
    supportSession?.workspace.id === workspaceId ? supportSession.workspace.id : null;
  const supportSessionActive = activeSupportWorkspaceId === workspaceId;

  const goLiveProjects = await loadPlatformWorkspaceGoLiveProjects(workspaceId);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/platform/workspaces" className="text-xs text-amber-200/90 hover:underline">
          ← Workspaces
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-white">{ws.name}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {ws.active ? "Active" : "Inactive"} · {ws._count.members} members · {ws._count.supportTickets} support
          tickets
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <h2 className="text-sm font-semibold text-zinc-200">Owner</h2>
          <dl className="mt-2 space-y-1 text-sm text-zinc-400">
            <div className="flex justify-between gap-2">
              <dt className="text-zinc-500">Name</dt>
              <dd>{ws.owner.fullName}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-zinc-500">Email</dt>
              <dd className="font-mono text-xs">{ws.owner.email}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-zinc-500">Workspace role</dt>
              <dd>{ws.owner.role}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <h2 className="text-sm font-semibold text-zinc-200">Billing (owner subscription)</h2>
          <dl className="mt-2 space-y-1 text-sm text-zinc-400">
            <div className="flex justify-between gap-2">
              <dt className="text-zinc-500">Plan</dt>
              <dd>{sub?.plan ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-zinc-500">Status</dt>
              <dd>{sub?.status ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-zinc-500">Billing mode</dt>
              <dd>{sub?.billingMode ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-zinc-500">Stripe sub</dt>
              <dd>{sub?.stripeSubscriptionId ? "linked" : "—"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-zinc-500">User trial</dt>
              <dd>{trial ? `${trial.status} · ends ${trial.trialEndsAt.toISOString().slice(0, 10)}` : "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 md:col-span-2">
          <h2 className="text-sm font-semibold text-zinc-200">POS diagnostics (sanitized)</h2>
          <dl className="mt-2 grid gap-2 text-sm text-zinc-400 sm:grid-cols-3">
            <div>
              <dt className="text-zinc-500">POS orders today</dt>
              <dd className="font-mono text-zinc-200">{posOrdersToday}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">POS orders missing txn</dt>
              <dd className="font-mono text-zinc-200">{posOrdersMissingTxn}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Open POS shifts</dt>
              <dd className="font-mono text-zinc-200">{openShifts}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-zinc-600">
            Card data is never stored here. Use Order / POS transaction IDs in support tickets for correlation.
          </p>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 md:col-span-2">
          <h2 className="text-sm font-semibold text-zinc-200">Integration maturity (owner)</h2>
          <p className="mt-2 text-xs text-zinc-500">
            Same tier mapping as workspace Integration health — no secrets. Owners review live state signed in at{" "}
            <span className="font-mono text-zinc-400">/dashboard/integration-health</span>.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {resolvedChannels.slice(0, 8).map((ch) => {
              const tier = maturityTierFromResolvedChannel(ch);
              return (
                <div key={ch.providerKey} className="rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-300">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-zinc-100">{ch.label}</span>
                    <Badge variant="outline" className="rounded-full text-[10px] font-normal text-zinc-100">
                      {tier.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500">{ch.nextAction}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-zinc-600">
            Demo mode: {ownerKitchen?.demoMode ? "on" : "off"} · Connections loaded: {ownerConnections.length}
          </p>
          <div className="mt-3">
            <Link
              href={`/platform/workspaces/${workspaceId}/integration-health`}
              className="inline-flex rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-100 hover:bg-amber-500/20"
            >
              Open read-only integration health
            </Link>
          </div>
        </section>

        {canStartSupportSession ? (
          <section className="rounded-xl border border-sky-800/50 bg-sky-950/25 p-4 md:col-span-2">
            <h2 className="text-sm font-semibold text-sky-100">Audited support session</h2>
            <p className="mt-1 text-xs text-zinc-500">
              READ_ONLY foundation — provide a ticket-scoped reason and choose session length. Workspace members see a
              dashboard notice while active. Assisted edit stays disabled in this release.
            </p>
            <div className="mt-3 max-w-lg">
              <StartSupportSessionPanel
                workspaceId={workspaceId}
                redirectTo={`/platform/workspaces/${workspaceId}#platform-workspace-go-live`}
              />
            </div>
          </section>
        ) : null}

        <PlatformWorkspaceGoLivePanel
          workspaceId={workspaceId}
          projects={goLiveProjects}
          supportSessionActive={supportSessionActive}
          impersonationMfaRequired={isImpersonationMfaConfigured()}
          context={{
            workspaceId,
            activeSupportWorkspaceId,
            canImpersonate,
            canStartSupportSession,
          }}
        />

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 md:col-span-2">
          <h2 className="text-sm font-semibold text-zinc-200">Organization</h2>
          {ws.organization ? (
            <p className="mt-2 text-sm text-zinc-400">
              <Link href="/platform/organizations" className="text-amber-200/90 hover:underline">
                {ws.organization.name}
              </Link>{" "}
              <span className="font-mono text-xs text-zinc-600">({ws.organization.slug})</span>
            </p>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">No organization linked.</p>
          )}
          <p className="mt-4 text-xs text-zinc-600">
            Module entitlements, webhooks, and workspace-level controls continue to expand here — each change is
            permission-gated and audited on the platform trail.
          </p>
        </section>
      </div>
    </div>
  );
}
