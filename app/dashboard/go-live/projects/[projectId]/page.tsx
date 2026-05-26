import Link from "next/link";
import { notFound } from "next/navigation";

import { ApprovalButtons } from "@/components/dashboard/go-live/approval-buttons";
import { ChecklistRow } from "@/components/dashboard/go-live/checklist-row";
import { IncidentForm, IncidentRowActions } from "@/components/dashboard/go-live/incident-form";
import { GoLiveKpiGrid } from "@/components/dashboard/go-live/kpi-grid";
import { RollbackPlanForm } from "@/components/dashboard/go-live/rollback-form";
import { SimulationLauncher } from "@/components/dashboard/go-live/simulation-launcher";
import { StageStrip } from "@/components/dashboard/go-live/stage-strip";
import { StatusTransitionButtons } from "@/components/dashboard/go-live/status-transition";
import {
  BlockerSeverityBadge,
  ChecklistStatusBadge,
  IncidentSeverityBadge,
  IncidentStatusBadge,
  LaunchStatusBadge,
  RiskBadge,
  SimulationResultBadge,
} from "@/components/dashboard/go-live/status-badges";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserProfile } from "@/lib/auth";
import { getTenantActor } from "@/lib/scope/cached-tenant";

import { parseGoLiveAuditSnapshot } from "@/lib/go-live/audit-snapshot";
import { isSuperAdminEmail } from "@/lib/platform-owner";
import {
  LAUNCH_STAGES,
  LAUNCH_MODE_LABEL,
  STAGE_DESCRIPTION,
  STAGE_LABEL,
  stageRank,
} from "@/lib/go-live/launch-stages";
import {
  getProject,
  workbenchSnapshot,
} from "@/services/go-live/go-live-service";
import {
  SIMULATION_TYPE_LABEL,
} from "@/lib/go-live/simulation-engine";

type PageProps = { params: Promise<{ projectId: string }> };

export default async function GoLiveProjectPage({ params }: PageProps) {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const profile = await requireUserProfile();
  const isSuper = isSuperAdminEmail(profile.email);
  const { projectId } = await params;

  const project = await getProject(dataUserId, projectId);
  if (!project) notFound();

  const snapshot = await workbenchSnapshot(
    dataUserId,
    project.id,
    project.businessType ?? null,
    project.status,
  );
  const blockers = snapshot.validation.blockers;
  const criticalBlockers = blockers.filter((b) => b.severity === "CRITICAL").length;
  const launchEta = project.launchDate ? project.launchDate.toISOString().slice(0, 10) : "Not set";
  const externalTargetProviders = snapshot.inputs.externalTargetProviderCount ?? 0;
  const externalCertifiedProviders = snapshot.inputs.externalCertifiedProviderCount ?? 0;
  const externalMissingProviders = snapshot.inputs.externalMissingProviderCount ?? 0;
  const placeholderScopeCount = snapshot.inputs.placeholderIntegrationScopeCount ?? 0;
  const certificationValue =
    externalTargetProviders === 0
      ? "Not required"
      : `${externalCertifiedProviders}/${externalTargetProviders}`;
  const certificationHint =
    externalTargetProviders === 0
      ? "Storefront-only launch scope or no live-capable external providers selected."
      : externalMissingProviders === 0
        ? "Every live-capable external provider in scope has passed health plus sync/webhook evidence."
        : `${externalMissingProviders} provider(s) still missing certification.${placeholderScopeCount > 0 ? ` ${placeholderScopeCount} placeholder integration(s) remain in scope.` : ""}`;
  const certificationTone =
    externalTargetProviders === 0 || externalMissingProviders === 0 ? "success" : "danger";

  const itemsByStage = new Map<string, typeof project.checklistItems>();
  for (const it of project.checklistItems) {
    const arr = itemsByStage.get(it.stage) ?? [];
    arr.push(it);
    itemsByStage.set(it.stage, arr);
  }

  const stageProgress = LAUNCH_STAGES.map((stage) => {
    const items = itemsByStage.get(stage) ?? [];
    return {
      stage,
      total: items.length,
      satisfied: items.filter((i) => i.status === "DONE" || i.status === "WAIVED").length,
      required: items.filter((i) => i.required).length,
    };
  });

  const incidentOpen = project.incidents.filter((i) => i.status !== "RESOLVED" && i.status !== "CLOSED");
  const incidentResolved = project.incidents.filter((i) => i.status === "RESOLVED" || i.status === "CLOSED");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link href="/dashboard/go-live" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
            ← Command Center
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {project.brand?.name ?? "Workspace launch"}
            {project.location?.name ? ` · ${project.location.name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {project.businessType ? `${project.businessType} · ` : ""}
            {LAUNCH_MODE_LABEL[project.launchMode]} · Launch ETA {launchEta}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <LaunchStatusBadge status={project.status} />
            <RiskBadge level={project.riskLevel} />
          </div>
        </div>
        <StatusTransitionButtons
          projectId={project.id}
          canApprove={snapshot.validation.canApprove}
          canLaunch={snapshot.validation.canApprove && project.status === "APPROVED"}
          canRollback={project.status !== "ROLLBACK_MODE"}
          isSuper={isSuper}
        />
      </div>

      <GoLiveKpiGrid
        tiles={{
          readiness: snapshot.validation.readiness.score,
          criticalBlockers,
          riskLevel: snapshot.validation.riskLevel,
          integrationCertification: certificationValue,
          integrationCertificationHint: certificationHint,
          integrationCertificationTone: certificationTone,
          simulationStatus: project.simulations[0]?.result ?? "Not run",
          launchEta,
          unresolvedIncidents: incidentOpen.length,
          approvalsPending: Math.max(0, snapshot.inputs.approvalsRequired - snapshot.inputs.approvalsCount),
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Launch pipeline</CardTitle>
          <CardDescription>
            Current stage: <strong>{STAGE_LABEL[project.currentStage]}</strong> · {STAGE_DESCRIPTION[project.currentStage]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StageStrip current={project.currentStage} progress={stageProgress} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Validation report</CardTitle>
          <CardDescription>
            Recommended status: <strong>{snapshot.validation.recommendedStatus.replaceAll("_", " ")}</strong>
            {snapshot.validation.reasons.length > 0
              ? " · " + snapshot.validation.reasons.join(" · ")
              : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {blockers.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">No launch blockers detected</p>
              <p className="mt-1">Your workspace currently passes all critical operational checks.</p>
            </div>
          ) : (
            <ul className="space-y-2 text-sm">
              {blockers.map((b) => (
                <li key={b.key} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{b.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {STAGE_LABEL[b.stage]} · {b.impact}
                      </p>
                      <p className="text-xs">{b.resolution}</p>
                      {b.detail ? <p className="text-xs text-muted-foreground">{b.detail}</p> : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <BlockerSeverityBadge severity={b.severity} />
                      {b.actionRoute ? (
                        <Link href={b.actionRoute} className="text-xs font-medium text-primary underline-offset-4 hover:underline">
                          Open
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stage-aware checklist</CardTitle>
          <CardDescription>
            {project.checklistItems.length} item{project.checklistItems.length === 1 ? "" : "s"}.
            Required items must be DONE before approvals unlock.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {LAUNCH_STAGES.map((stage) => {
            const items = itemsByStage.get(stage) ?? [];
            if (items.length === 0) return null;
            return (
              <div key={stage} className="rounded-lg border">
                <div className="border-b bg-muted/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {stageRank(stage) + 1}. {STAGE_LABEL[stage]}
                </div>
                <ul className="divide-y">
                  {items.map((item) => (
                    <li key={item.id} className="space-y-2 px-3 py-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">
                            {item.title}
                            {item.required ? <span className="ml-2 text-[10px] uppercase text-rose-700">required</span> : null}
                          </p>
                          {item.description ? <p className="text-xs text-muted-foreground">{item.description}</p> : null}
                          {item.actionRoute ? (
                            <Link href={item.actionRoute} className="text-xs text-primary underline-offset-4 hover:underline">
                              Open module
                            </Link>
                          ) : null}
                        </div>
                        <ChecklistStatusBadge status={item.status} />
                      </div>
                      <ChecklistRow
                        projectId={project.id}
                        itemId={item.id}
                        initialStatus={item.status}
                        initialAssignedToId={item.assignedToId}
                        initialDueAt={item.dueAt ? item.dueAt.toISOString().slice(0, 10) : null}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Simulations</CardTitle>
          <CardDescription>
            Run deterministic launch simulations against the current workspace snapshot. No live data is
            touched.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SimulationLauncher projectId={project.id} />
          {project.simulations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No simulations yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {project.simulations.map((sim) => (
                <li key={sim.id} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{SIMULATION_TYPE_LABEL[sim.simulationType]}</p>
                      <p className="text-xs text-muted-foreground">
                        {sim.startedAt.toISOString().slice(0, 16).replace("T", " ")} · {sim.durationMs ?? 0}ms
                      </p>
                    </div>
                    <SimulationResultBadge result={sim.result} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Approvals</CardTitle>
          <CardDescription>
            Required: Operations, Kitchen, Finance, Integrations, Ownership. Support is optional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApprovalButtons
            projectId={project.id}
            existing={project.approvals.map((a) => ({
              approvalType: a.approvalType,
              approvedAt: a.approvedAt,
              approvedBy: { fullName: a.approvedBy.fullName, email: a.approvedBy.email },
            }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Incidents</CardTitle>
          <CardDescription>Open: {incidentOpen.length} · Resolved: {incidentResolved.length}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <IncidentForm projectId={project.id} />
          <div className="space-y-2">
            {project.incidents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No incidents logged.</p>
            ) : (
              <ul className="space-y-2">
                {project.incidents.map((inc) => (
                  <li key={inc.id} className="rounded-lg border p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">
                          [{inc.category}] {inc.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{inc.description}</p>
                        {inc.resolution ? <p className="text-xs">Resolution: {inc.resolution}</p> : null}
                        <p className="text-[11px] text-muted-foreground">
                          {inc.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <IncidentSeverityBadge severity={inc.severity} />
                        <IncidentStatusBadge status={inc.status} />
                      </div>
                    </div>
                    <div className="mt-2">
                      <IncidentRowActions
                        projectId={project.id}
                        incidentId={inc.id}
                        initialStatus={inc.status}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rollback plans</CardTitle>
          <CardDescription>Predefined plans seeded for this launch mode plus custom plans.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <RollbackPlanForm projectId={project.id} />
          {project.rollbackPlans.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rollback plans yet.</p>
          ) : (
            <ul className="space-y-2">
              {project.rollbackPlans.map((plan) => {
                const steps = (plan.rollbackStepsJson as Array<{ title: string; description: string }> | null) ?? [];
                return (
                  <li key={plan.id} className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">{plan.title}</p>
                    <p className="text-xs text-muted-foreground">Trigger: {plan.triggerCondition}</p>
                    <ol className="mt-2 list-decimal pl-5 text-xs text-muted-foreground">
                      {steps.map((s, idx) => (
                        <li key={idx}>{s.title || s.description}</li>
                      ))}
                    </ol>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project activity</CardTitle>
          <CardDescription>Audit log of every checklist update, approval, simulation, and incident.</CardDescription>
        </CardHeader>
        <CardContent>
          {project.events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {project.events.map((e) => (
                (() => {
                  const metadata =
                    e.metadataJson && typeof e.metadataJson === "object" && !Array.isArray(e.metadataJson)
                      ? (e.metadataJson as { auditSnapshot?: unknown; approvalType?: unknown; override?: unknown; toStatus?: unknown })
                      : null;
                  const auditSnapshot = parseGoLiveAuditSnapshot(
                    metadata && "auditSnapshot" in metadata
                      ? (metadata.auditSnapshot as Parameters<typeof parseGoLiveAuditSnapshot>[0])
                      : null,
                  );
                  const certificationSummary = auditSnapshot
                    ? auditSnapshot.externalCertification.required
                      ? `${auditSnapshot.externalCertification.certifiedProviders}/${auditSnapshot.externalCertification.targetProviders} certified`
                      : "certification not required"
                    : null;

                  return (
                    <li key={e.id} className="rounded-md border p-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">{e.eventType.replaceAll("_", " ")}</p>
                          <p className="text-xs text-muted-foreground">
                            {e.summary ?? ""} · {e.performedBy?.fullName ?? e.performedBy?.email ?? "system"}
                          </p>
                          {auditSnapshot ? (
                            <div className="mt-1 space-y-1 text-[11px] text-muted-foreground">
                              <p>
                                Readiness {auditSnapshot.readinessScore}% · Risk {auditSnapshot.riskLevel} · Recommended{" "}
                                {auditSnapshot.recommendedStatus.replaceAll("_", " ")}
                                {certificationSummary ? ` · ${certificationSummary}` : ""}
                              </p>
                              <p>
                                Approvals {auditSnapshot.approvals.captured}/{auditSnapshot.approvals.required}
                                {auditSnapshot.approvals.outstanding > 0
                                  ? ` · ${auditSnapshot.approvals.outstanding} outstanding`
                                  : " · complete"}
                                {typeof metadata?.approvalType === "string" ? ` · ${metadata.approvalType} sign-off` : ""}
                                {typeof metadata?.toStatus === "string" ? ` · target ${metadata.toStatus}` : ""}
                                {metadata?.override === true ? " · override used" : ""}
                              </p>
                              {auditSnapshot.externalCertification.missingLabels.length > 0 ? (
                                <p>Missing certification: {auditSnapshot.externalCertification.missingLabels.join(", ")}</p>
                              ) : null}
                              {auditSnapshot.requiredMissingKeys.length > 0 ? (
                                <p>Required gaps: {auditSnapshot.requiredMissingKeys.join(", ")}</p>
                              ) : null}
                              {auditSnapshot.criticalBlockerKeys.length > 0 ? (
                                <p>Critical blockers: {auditSnapshot.criticalBlockerKeys.join(", ")}</p>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {e.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                        </p>
                      </div>
                    </li>
                  );
                })()
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
