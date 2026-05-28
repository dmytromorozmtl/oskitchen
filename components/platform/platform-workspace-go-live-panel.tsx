import Link from "next/link";

import { startPlatformSupportSessionAction } from "@/actions/platform-support-session";
import { PlatformImpersonationDeepLinkForm } from "@/components/platform/platform-impersonation-deep-link-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LAUNCH_STATUS_LABEL, RISK_LEVEL_LABEL } from "@/lib/go-live/launch-stages";
import type { PlatformGoLiveProjectRow } from "@/lib/go-live/platform-go-live-focus-era18";
import { PLATFORM_GO_LIVE_ROUTE } from "@/lib/go-live/platform-go-live-focus-era18-policy";
import {
  PLATFORM_WORKSPACE_GO_LIVE_SECTION_ID,
  platformWorkspaceGoLiveProjectAnchor,
} from "@/lib/go-live/platform-workspace-go-live-focus-era18-policy";
import {
  platformGoLiveProjectLabel,
  resolvePlatformWorkspaceGoLivePrimaryAction,
  summarizePlatformWorkspaceGoLiveProjects,
  type PlatformWorkspaceGoLiveContext,
} from "@/lib/go-live/platform-workspace-go-live-focus-era18";

function statusVariant(status: string): "default" | "destructive" | "secondary" | "outline" {
  if (status === "BLOCKED" || status === "ROLLBACK_MODE") return "destructive";
  if (status === "LIVE" || status === "COMPLETED") return "default";
  if (status === "READY" || status === "APPROVED") return "secondary";
  return "outline";
}

export function PlatformWorkspaceGoLivePanel(props: {
  workspaceId: string;
  projects: readonly PlatformGoLiveProjectRow[];
  context: PlatformWorkspaceGoLiveContext;
  impersonationMfaRequired: boolean;
  supportSessionActive: boolean;
}) {
  const summary = summarizePlatformWorkspaceGoLiveProjects(props.projects);

  return (
    <section
      id={PLATFORM_WORKSPACE_GO_LIVE_SECTION_ID}
      className="scroll-mt-24 rounded-xl border border-amber-800/40 bg-amber-950/20 p-4 md:col-span-2"
      data-testid="platform-workspace-go-live-panel"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-amber-100">Go-live launch projects</h2>
          <p className="mt-1 text-xs text-zinc-500">
            {props.supportSessionActive
              ? "Support session active — use Review tenant go-live to open the owner launch checklist (audited impersonation)."
              : "Start a read-only support session, then review tenant go-live validation. Platform view never bypasses tenant RBAC."}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="h-8 shrink-0 rounded-full border-zinc-700">
          <Link href={PLATFORM_GO_LIVE_ROUTE}>Cross-tenant queue</Link>
        </Button>
      </div>

      {props.projects.length > 0 ? (
        <dl className="mt-3 grid gap-2 text-xs text-zinc-400 sm:grid-cols-3">
          <div>
            <dt className="text-zinc-500">Active launches</dt>
            <dd className="font-mono text-zinc-200">{summary.activeCount}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Blocked</dt>
            <dd className="font-mono text-zinc-200">{summary.blockedCount}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Lowest readiness</dt>
            <dd className="font-mono text-zinc-200">
              {summary.lowestReadiness !== null ? `${summary.lowestReadiness}%` : "—"}
            </dd>
          </div>
        </dl>
      ) : null}

      <div className="mt-4 space-y-3">
        {props.projects.length === 0 ? (
          <p className="text-sm text-zinc-500">No go-live projects linked to this workspace yet.</p>
        ) : (
          props.projects.map((project) => {
            const action = resolvePlatformWorkspaceGoLivePrimaryAction(project, props.context);
            const label = platformGoLiveProjectLabel(project);

            return (
              <div
                key={project.id}
                id={`go-live-project-${project.id}`}
                className="scroll-mt-24 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3"
                data-testid={`platform-workspace-go-live-project-${project.id}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-zinc-100">{label}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant={statusVariant(project.status)} className="rounded-full text-[10px]">
                        {LAUNCH_STATUS_LABEL[project.status]}
                      </Badge>
                      <span className="text-xs text-zinc-500">{RISK_LEVEL_LABEL[project.riskLevel]} risk</span>
                      <span className="text-xs tabular-nums text-zinc-400">{project.readinessScore}% ready</span>
                      {project.openIncidentCount > 0 ? (
                        <span className="text-xs text-amber-300">
                          {project.openIncidentCount} open incident
                          {project.openIncidentCount === 1 ? "" : "s"}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      Launch {project.launchDate ? project.launchDate.toLocaleDateString() : "not scheduled"} ·{" "}
                      {project.ownerEmail}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                    {action.kind === "impersonate_tenant_go_live" ? (
                      <PlatformImpersonationDeepLinkForm
                        targetUserId={action.targetUserId}
                        redirectTo={action.redirectTo}
                        reason={action.reason}
                        label={action.label}
                        showMfaFields={props.impersonationMfaRequired}
                        testId={`platform-workspace-go-live-impersonate-${project.id}`}
                      />
                    ) : null}

                    {action.kind === "start_support_session" ? (
                      <form
                        action={startPlatformSupportSessionAction}
                        data-testid={`platform-workspace-go-live-support-${project.id}`}
                      >
                        <input type="hidden" name="workspaceId" value={props.workspaceId} />
                        <input type="hidden" name="mode" value="READ_ONLY" />
                        <input type="hidden" name="ttlHours" value="2" />
                        <input
                          type="hidden"
                          name="reason"
                          value={`Workspace go-live support: ${project.id}`}
                        />
                        <input type="hidden" name="redirectTo" value={action.redirectTo} />
                        <Button type="submit" size="sm" variant="secondary" className="h-8 rounded-full text-xs">
                          {action.label}
                        </Button>
                      </form>
                    ) : null}

                    {action.kind === "await_support_session" || action.kind === "read_only" ? (
                      <p className="max-w-xs text-right text-xs text-zinc-500">{action.detail}</p>
                    ) : null}

                    <Link
                      href={`${PLATFORM_GO_LIVE_ROUTE}${platformWorkspaceGoLiveProjectAnchor(project.id)}`}
                      className="text-xs text-amber-200/90 underline-offset-2 hover:underline"
                    >
                      View in launch queue
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
