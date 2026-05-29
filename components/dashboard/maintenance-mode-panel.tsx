import Link from "next/link";
import { AlertCircle, CheckCircle2, Circle, Info, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MaintenanceModeRhythmStatusKind } from "@/lib/commercial/maintenance-mode-phases-era24";
import type { MaintenanceModeUiSlice } from "@/lib/commercial/maintenance-mode-ui-era24";
import {
  formatMaintenanceModeProgressLabel,
  MAINTENANCE_MODE_PLATFORM_ANCHOR,
} from "@/lib/commercial/maintenance-mode-ui-era24";
import { formatEngineeringPathTerminusProgressLabel } from "@/lib/commercial/engineering-path-terminus-ui-era24";
import { formatCommercialPilotPathAbsoluteEndLabel } from "@/lib/commercial/commercial-pilot-path-absolute-end-ui-era24";
import { formatLinearPathPermanentlyClosedLabel } from "@/lib/commercial/linear-path-permanently-closed-ui-era24";
import { formatLinearChainTerminusGuardLabel } from "@/lib/commercial/linear-chain-terminus-guard-ui-era24";
import { formatEra25CharterExitLabel } from "@/lib/commercial/era25-charter-exit-ui-era24";
import { formatEra25FirstCharterSliceReadinessLabel } from "@/lib/commercial/era25-first-charter-slice-readiness-ui-era24";
import { formatEra25EngineeringGatesLabel } from "@/lib/commercial/era25-engineering-gates-ui-era24";
import { formatEra25FirstProductSliceBlueprintLabel } from "@/lib/commercial/era25-first-product-slice-blueprint-ui-era24";
import { formatOwnerDailyBriefingBreakthroughEra25Label } from "@/lib/commercial/owner-daily-briefing-breakthrough-ui-era25";
import { formatPaidPilotGoConvergenceEra25Label } from "@/lib/commercial/paid-pilot-go-convergence-ui-era25";
import { formatPilotWeek1ExecutionConvergenceEra25Label } from "@/lib/commercial/pilot-week1-execution-convergence-ui-era25";
import { formatMonth2MarketReadinessConvergenceEra25Label } from "@/lib/commercial/month2-market-readiness-convergence-ui-era25";
import { formatScaleReadinessConvergenceEra25Label } from "@/lib/commercial/scale-readiness-convergence-ui-era25";
import { formatSeriesAPartnerExpansionConvergenceEra25Label } from "@/lib/commercial/series-a-partner-expansion-convergence-ui-era25";
import { formatMarketLeaderPositioningConvergenceEra25Label } from "@/lib/commercial/market-leader-positioning-convergence-ui-era25";
import { formatSustainedOperationalExcellenceConvergenceEra25Label } from "@/lib/commercial/sustained-operational-excellence-convergence-ui-era25";
import { formatPureOperationalModeTerminusEra25Label } from "@/lib/commercial/pure-operational-mode-terminus-ui-era25";
import { formatPostTerminusSteadyStateProgressLabel } from "@/lib/commercial/post-terminus-steady-state-ui-era24";
import { cn } from "@/lib/utils";

type MaintenanceModePanelVariant = "dashboard" | "platform" | "compact";

function statusIcon(status: MaintenanceModeRhythmStatusKind) {
  if (status === "healthy") return CheckCircle2;
  if (status === "overdue") return AlertCircle;
  if (status === "due_soon") return Circle;
  return Info;
}

function statusBadgeVariant(
  status: MaintenanceModeRhythmStatusKind,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "healthy") return "default";
  if (status === "overdue") return "destructive";
  if (status === "due_soon") return "secondary";
  return "outline";
}

export function MaintenanceModePanel(props: {
  slice: MaintenanceModeUiSlice;
  variant?: MaintenanceModePanelVariant;
  title?: string;
}) {
  const {
    slice,
    variant = "dashboard",
    title = "Maintenance mode — commercial pilot path complete",
  } = props;
  const isPlatform = variant === "platform";
  const isCompact = variant === "compact";

  const cardClass = isPlatform
    ? "border-slate-700/80 bg-slate-950/30"
    : "border-slate-200/80 bg-slate-50/20 dark:border-slate-800/60";

  return (
    <Card
      id={isPlatform ? MAINTENANCE_MODE_PLATFORM_ANCHOR.slice(1) : undefined}
      className={cn("scroll-mt-24 shadow-sm", cardClass)}
      data-testid="maintenance-mode-panel"
    >
      {!isCompact ? (
        <CardHeader className="pb-2">
          <CardTitle className={cn("flex items-center gap-2 text-lg", isPlatform && "text-slate-100")}>
            <ShieldCheck className="h-5 w-5 opacity-70" aria-hidden />
            {title}
          </CardTitle>
          <CardDescription className={isPlatform ? "text-slate-400" : undefined}>
            {formatMaintenanceModeProgressLabel(slice)} — era21→era24 path complete; repeat rhythms
            forever, no Step 13 gates.
          </CardDescription>
        </CardHeader>
      ) : null}
      <CardContent className={cn("space-y-3", isCompact && "pt-4")}>
        {!isCompact ? (
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="rounded-full font-mono text-[10px]">
              path complete
            </Badge>
            <Badge variant="outline" className="rounded-full font-mono text-[10px]">
              {slice.maintenanceModeMilestone.replaceAll("_", " ")}
            </Badge>
            <Badge variant="outline" className="rounded-full text-[10px]">
              era24 maintenance mode
            </Badge>
            {slice.pureOperationalModeEra25Active ? (
              <Badge variant="default" className="rounded-full font-mono text-[10px]">
                era25 pure ops
              </Badge>
            ) : slice.sustainedOpsConvergenceReady ? (
              <Badge variant="secondary" className="rounded-full font-mono text-[10px]">
                era25 sustained ops
              </Badge>
            ) : null}
            {slice.improvementLoopOverdue + slice.productEvolutionOverdue > 0 ? (
              <Badge variant="destructive" className="rounded-full text-[10px]">
                {slice.improvementLoopOverdue + slice.productEvolutionOverdue} upstream overdue
              </Badge>
            ) : null}
            {!slice.maintenanceModeIntegrityPassed ? (
              <Badge variant="destructive" className="rounded-full text-[10px]">
                Maintenance mode blocked
              </Badge>
            ) : null}
            {!slice.productEvolutionIntegrityPassed ? (
              <Badge variant="destructive" className="rounded-full text-[10px]">
                Product evolution integrity FAIL
              </Badge>
            ) : null}
          </div>
        ) : (
          <p className="text-sm font-medium">{formatMaintenanceModeProgressLabel(slice)}</p>
        )}

        {slice.nextAttentionRhythm ? (
          <div
            className={cn(
              "rounded-lg border px-3 py-2 text-sm",
              isPlatform
                ? "border-amber-800/60 bg-amber-950/20 text-amber-100"
                : "border-amber-200/70 bg-amber-50/20",
            )}
          >
            <p className="font-medium">Next rhythm attention</p>
            <p className="mt-1 text-xs opacity-90">{slice.nextAttentionDetail}</p>
          </div>
        ) : null}

        <ul className="space-y-2">
          {slice.rhythms.map((rhythm) => {
            const Icon = statusIcon(rhythm.status);
            const isAttention = rhythm.status === "overdue" || rhythm.status === "due_soon";
            return (
              <li
                key={rhythm.id}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm",
                  rhythm.status === "healthy"
                    ? "border-emerald-200/60 bg-emerald-50/10"
                    : isAttention
                      ? isPlatform
                        ? "border-amber-800/50 bg-amber-950/10"
                        : "border-amber-200/60 bg-amber-50/10"
                      : isPlatform
                        ? "border-zinc-800 bg-zinc-900/40"
                        : "border-border/70 bg-background/60",
                )}
              >
                <div className="flex items-start gap-2">
                  <Icon
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      rhythm.status === "healthy"
                        ? "text-emerald-600"
                        : rhythm.status === "overdue"
                          ? "text-rose-500"
                          : rhythm.status === "due_soon"
                            ? "text-amber-600"
                            : "text-muted-foreground",
                    )}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{rhythm.label}</span>
                      <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                        {rhythm.ownerRole}
                      </Badge>
                      <Badge
                        variant={statusBadgeVariant(rhythm.status)}
                        className="rounded-full text-[10px] capitalize"
                      >
                        {rhythm.status.replaceAll("_", " ")}
                      </Badge>
                    </div>
                    <p
                      className={cn(
                        "mt-1 text-xs",
                        isPlatform ? "text-zinc-400" : "text-muted-foreground",
                      )}
                    >
                      {rhythm.detail}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {!isCompact && slice.engineeringPathTerminus && isPlatform ? (
          <div
            id="engineering-path-terminus"
            className="scroll-mt-24 rounded-lg border border-dashed border-slate-600/60 px-3 py-3 text-xs"
            data-testid="engineering-path-terminus-panel"
          >
            <p className="font-medium text-slate-100">
              Engineering path terminus — master orchestration (Step 13)
            </p>
            <p className="mt-1 text-slate-400">
              {formatEngineeringPathTerminusProgressLabel(slice.engineeringPathTerminus)} · no era25
              gates without charter
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full font-mono text-[10px] text-slate-200">
                {slice.engineeringPathTerminus.engineeringPathTerminusMilestone.replaceAll("_", " ")}
              </Badge>
              {slice.engineeringPathTerminus.pureOperationalModeEra25Active ? (
                <Badge variant="default" className="rounded-full font-mono text-[10px]">
                  era25 pure ops
                </Badge>
              ) : slice.engineeringPathTerminus.sustainedOpsConvergenceReady ? (
                <Badge variant="secondary" className="rounded-full font-mono text-[10px]">
                  era25 sustained ops
                </Badge>
              ) : null}
              <Badge variant="outline" className="rounded-full text-[10px] text-slate-300">
                gate chain {slice.engineeringPathTerminus.gateStepsComplete ? "complete" : "blocked"}
              </Badge>
            </div>
            <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto">
              {slice.engineeringPathTerminus.steps.map((step) => (
                <li
                  key={step.id}
                  className={cn(
                    "rounded px-2 py-1",
                    step.complete ? "text-emerald-300/90" : "text-amber-200/90",
                  )}
                >
                  <span className="font-mono text-[10px]">
                    {step.complete ? "✓" : "○"} S{step.step}
                  </span>{" "}
                  {step.label}{" "}
                  <span className="opacity-70">({step.kind})</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
              <span>{slice.engineeringPathTerminus.postMaintenanceModeOrchestratorCommand}</span>
              <span>{slice.engineeringPathTerminus.validateCommand}</span>
              <span>{slice.engineeringPathTerminus.syncStatusReportCommand}</span>
              <span>{slice.engineeringPathTerminus.validateMaintenanceModeCommand}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="ghost" className="rounded-full">
                <Link href={slice.engineeringPathTerminus.pureOperationalModeTerminusHref}>
                  era25 terminus
                </Link>
              </Button>
            </div>
          </div>
        ) : null}

        {!isCompact && slice.engineeringPathTerminus?.postTerminusSteadyState && isPlatform ? (
          <div
            id="post-terminus-steady-state"
            className="scroll-mt-24 rounded-lg border border-dashed border-indigo-600/50 px-3 py-3 text-xs"
            data-testid="post-terminus-steady-state-panel"
          >
            <p className="font-medium text-indigo-100">
              Post-terminus steady state — repeat forever (Step 14)
            </p>
            <p className="mt-1 text-indigo-300/80">
              {formatPostTerminusSteadyStateProgressLabel(
                slice.engineeringPathTerminus.postTerminusSteadyState,
              )}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full font-mono text-[10px] text-indigo-200">
                {slice.engineeringPathTerminus.postTerminusSteadyState.steadyStateMilestone.replaceAll(
                  "_",
                  " ",
                )}
              </Badge>
              <Badge variant="outline" className="rounded-full font-mono text-[10px] text-indigo-300/90">
                {slice.engineeringPathTerminus.postTerminusSteadyState.engineeringPathTerminusMilestone.replaceAll(
                  "_",
                  " ",
                )}
              </Badge>
              {slice.engineeringPathTerminus.postTerminusSteadyState.pureOperationalModeEra25Active ? (
                <Badge variant="default" className="rounded-full font-mono text-[10px]">
                  era25 pure ops
                </Badge>
              ) : slice.engineeringPathTerminus.postTerminusSteadyState.sustainedOpsConvergenceReady ? (
                <Badge variant="secondary" className="rounded-full font-mono text-[10px]">
                  era25 sustained ops
                </Badge>
              ) : null}
              {slice.engineeringPathTerminus.postTerminusSteadyState.overdueCount > 0 ? (
                <Badge variant="destructive" className="rounded-full text-[10px]">
                  {slice.engineeringPathTerminus.postTerminusSteadyState.overdueCount} overdue
                </Badge>
              ) : null}
            </div>
            <ul className="mt-3 space-y-1">
              {slice.engineeringPathTerminus.postTerminusSteadyState.tracks.map((track) => (
                <li
                  key={track.id}
                  className={cn(
                    "rounded px-2 py-1",
                    track.status === "overdue"
                      ? "text-amber-200/90"
                      : track.status === "healthy"
                        ? "text-emerald-300/90"
                        : "text-slate-400",
                  )}
                >
                  [{track.status}] {track.label}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
              <span>
                {slice.engineeringPathTerminus.postTerminusSteadyState.postEngineeringTerminusOrchestratorCommand}
              </span>
              <span>{slice.engineeringPathTerminus.postTerminusSteadyState.validateCommand}</span>
              <span>{slice.engineeringPathTerminus.postTerminusSteadyState.syncReportCommand}</span>
              <span>
                {slice.engineeringPathTerminus.postTerminusSteadyState.validateEngineeringPathTerminusCommand}
              </span>
              <span>
                {slice.engineeringPathTerminus.postTerminusSteadyState.exportEraCharterChecklistCommand}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="ghost" className="rounded-full">
                <Link
                  href={
                    slice.engineeringPathTerminus.postTerminusSteadyState.pureOperationalModeTerminusHref
                  }
                >
                  era25 terminus
                </Link>
              </Button>
            </div>
          </div>
        ) : null}

        {!isCompact &&
        slice.engineeringPathTerminus?.postTerminusSteadyState?.absolutePathEnd &&
        isPlatform ? (
          <div
            id="commercial-pilot-path-absolute-end"
            className="scroll-mt-24 rounded-lg border border-dashed border-emerald-700/50 px-3 py-3 text-xs"
            data-testid="commercial-pilot-path-absolute-end-panel"
          >
            <p className="font-medium text-emerald-100">
              Commercial pilot path absolute end (Step 15)
            </p>
            <p className="mt-1 text-emerald-300/80">
              {formatCommercialPilotPathAbsoluteEndLabel(
                slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd,
              )}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full font-mono text-[10px] text-emerald-200">
                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.absoluteEndMilestone.replaceAll(
                  "_",
                  " ",
                )}
              </Badge>
              <Badge variant="outline" className="rounded-full font-mono text-[10px] text-emerald-300/90">
                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.steadyStateMilestone.replaceAll(
                  "_",
                  " ",
                )}
              </Badge>
              {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                .pureOperationalModeEra25Active ? (
                <Badge variant="default" className="rounded-full font-mono text-[10px]">
                  era25 pure ops
                </Badge>
              ) : slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                  .sustainedOpsConvergenceReady ? (
                <Badge variant="secondary" className="rounded-full font-mono text-[10px]">
                  era25 sustained ops
                </Badge>
              ) : null}
              <Badge variant="outline" className="rounded-full text-[10px] text-emerald-300">
                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.completedSteps}/
                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.totalSteps} steps
              </Badge>
            </div>
            <ul className="mt-3 space-y-1">
              {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.pathLayers.map(
                (layer) => (
                  <li key={layer.step} className="text-emerald-200/90">
                    Step {layer.step} — {layer.label} ({layer.role})
                  </li>
                ),
              )}
            </ul>
            <ul className="mt-3 space-y-1 text-slate-400">
              {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.productSurfaces.map(
                (surface) => (
                  <li key={surface.id}>
                    {surface.label} → {surface.route} · {surface.rhythm}
                  </li>
                ),
              )}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
              <span>
                {
                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                    .postSteadyStateOrchestratorCommand
                }
              </span>
              <span>
                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.validateCommand}
              </span>
              <span>
                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.syncReportCommand}
              </span>
              <span>
                {
                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                    .validateSteadyStateCommand
                }
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="ghost" className="rounded-full">
                <Link
                  href={
                    slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                      .pureOperationalModeTerminusHref
                  }
                >
                  era25 terminus
                </Link>
              </Button>
            </div>
          </div>
        ) : null}

        {!isCompact &&
        slice.engineeringPathTerminus?.postTerminusSteadyState?.absolutePathEnd
          ?.linearPathPermanentlyClosed &&
        isPlatform ? (
          <div
            id="linear-path-permanently-closed"
            className="scroll-mt-24 rounded-lg border border-dashed border-rose-800/50 px-3 py-3 text-xs"
            data-testid="linear-path-permanently-closed-panel"
          >
            <p className="font-medium text-rose-100">
              Linear path permanently closed — doc chain terminus (Step 16)
            </p>
            <p className="mt-1 text-rose-200/80">
              {formatLinearPathPermanentlyClosedLabel(
                slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                  .linearPathPermanentlyClosed,
              )}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full font-mono text-[10px] text-rose-200">
                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.linearPathPermanentlyClosedMilestone.replaceAll(
                  "_",
                  " ",
                )}
              </Badge>
              <Badge variant="outline" className="rounded-full text-[10px] text-rose-300">
                {
                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                    .linearPathPermanentlyClosed.docChainSteps
                }
                -step doc chain
              </Badge>
              <Badge variant="outline" className="rounded-full text-[10px] text-rose-300">
                guard{" "}
                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                  .linearPathPermanentlyClosed.terminusGuardPassed
                  ? "PASS"
                  : "FAIL"}
              </Badge>
            </div>
            <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-400">
              {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.forbiddenActions.map(
                (rule) => (
                  <li key={rule}>{rule}</li>
                ),
              )}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
              <span>
                {
                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                    .linearPathPermanentlyClosed.postAbsoluteEndOrchestratorCommand
                }
              </span>
              <span>
                {
                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                    .linearPathPermanentlyClosed.validateCommand
                }
              </span>
              <span>
                {
                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                    .linearPathPermanentlyClosed.syncReportCommand
                }
              </span>
              <span>
                {
                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                    .linearPathPermanentlyClosed.terminusGuardValidateCommand
                }
              </span>
            </div>
            <p className="mt-2 text-rose-300/70">
              Step 17 FORBIDDEN · max linear step 16 · missing docs{" "}
              {
                slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                  .linearPathPermanentlyClosed.missingDocChainDocCount
              }
            </p>

            {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
              .linearPathPermanentlyClosed.step17Forbidden ? (
              <div
                id="linear-chain-step17-forbidden"
                className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-zinc-700/60 px-3 py-3"
                data-testid="linear-chain-step17-forbidden-panel"
              >
                <p className="font-medium text-zinc-200">
                  Step 17 FORBIDDEN — linear chain terminus guard
                </p>
                <p className="mt-1 text-zinc-400">
                  {formatLinearChainTerminusGuardLabel(
                    slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                      .linearPathPermanentlyClosed.step17Forbidden,
                  )}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-full font-mono text-[10px] text-zinc-300"
                  >
                    {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.linearChainTerminusGuardMilestone.replaceAll(
                      "_",
                      " ",
                    )}
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-[10px] text-zinc-400">
                    catalog{" "}
                    {
                      slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                        .linearPathPermanentlyClosed.step17Forbidden.catalogStepCount
                    }
                    / max{" "}
                    {
                      slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                        .linearPathPermanentlyClosed.step17Forbidden.maxLinearStep
                    }
                  </Badge>
                </div>
                <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                  {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.forbiddenProposals.map(
                    (proposal) => (
                      <li key={proposal}>{proposal}</li>
                    ),
                  )}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                  <span>
                    {
                      slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                        .linearPathPermanentlyClosed.step17Forbidden
                        .postLinearPathClosedOrchestratorCommand
                    }
                  </span>
                  <span>
                    {
                      slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                        .linearPathPermanentlyClosed.step17Forbidden.validateCommand
                    }
                  </span>
                  <span>
                    {
                      slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                        .linearPathPermanentlyClosed.step17Forbidden.syncReportCommand
                    }
                  </span>
                  <span>
                    {
                      slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                        .linearPathPermanentlyClosed.step17Forbidden.exportEraCharterChecklistCommand
                    }
                  </span>
                </div>

                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                  .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit ? (
                  <div
                    id="era25-charter-exit-outside-linear-path"
                    className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-violet-800/50 px-3 py-3"
                    data-testid="era25-charter-exit-outside-linear-path-panel"
                  >
                    <p className="font-medium text-violet-100">
                      era25+ charter exit — outside linear catalog
                    </p>
                    <p className="mt-1 text-violet-200/80">
                      {formatEra25CharterExitLabel(
                        slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                          .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit,
                      )}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="rounded-full font-mono text-[10px] text-violet-200"
                      >
                        {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.era25CharterExitMilestone.replaceAll(
                          "_",
                          " ",
                        )}
                      </Badge>
                      <Badge variant="outline" className="rounded-full text-[10px] text-violet-300">
                        checklist{" "}
                        {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                          .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                          .charterChecklistPresent
                          ? "yes"
                          : "no"}
                      </Badge>
                      <Badge variant="outline" className="rounded-full text-[10px] text-violet-300">
                        signed charter{" "}
                        {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                          .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                          .signedCharterPresent
                          ? "yes"
                          : "no"}
                      </Badge>
                    </div>
                    <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                      {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.humanSteps.map(
                        (step) => (
                          <li key={step}>{step}</li>
                        ),
                      )}
                    </ul>
                    <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                      <span>
                        {
                          slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                            .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                            .postTerminusGuardOrchestratorCommand
                        }
                      </span>
                      <span>
                        {
                          slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                            .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.validateCommand
                        }
                      </span>
                      <span>
                        {
                          slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                            .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.syncReportCommand
                        }
                      </span>
                      <span>
                        {
                          slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                            .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                            .exportCharterChecklistCommand
                        }
                      </span>
                    </div>
                    <p className="mt-2 text-violet-300/70">
                      NOT Step 18 · charter template{" "}
                      {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                        .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.charterDocGlobHint}
                    </p>

                    {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                      .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                      .firstCharterSliceReadiness ? (
                      <div
                        id="era25-first-charter-slice-readiness"
                        className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-indigo-800/50 px-3 py-3"
                        data-testid="era25-first-charter-slice-readiness-panel"
                      >
                        <p className="font-medium text-indigo-100">
                          era25 first charter slice — section readiness
                        </p>
                        <p className="mt-1 text-indigo-200/80">
                          {formatEra25FirstCharterSliceReadinessLabel(
                            slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                              .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                              .firstCharterSliceReadiness,
                          )}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className="rounded-full font-mono text-[10px] text-indigo-200"
                          >
                            {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.era25FirstCharterSliceReadinessMilestone.replaceAll(
                              "_",
                              " ",
                            )}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="rounded-full text-[10px] text-indigo-300"
                          >
                            sections{" "}
                            {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                              .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                              .firstCharterSliceReadiness.sectionsValid
                              ? "valid"
                              : "incomplete"}
                          </Badge>
                        </div>
                        <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                          {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.guardrails.map(
                            (rule) => (
                              <li key={rule}>{rule}</li>
                            ),
                          )}
                        </ul>
                        <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                          <span>
                            {
                              slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                .firstCharterSliceReadiness.postCharterExitOrchestratorCommand
                            }
                          </span>
                          <span>
                            {
                              slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                .firstCharterSliceReadiness.validateCommand
                            }
                          </span>
                          <span>
                            {
                              slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                .firstCharterSliceReadiness.syncReportCommand
                            }
                          </span>
                        </div>
                        <p className="mt-2 text-indigo-300/70">
                          No era25 engineering until{" "}
                          <span className="font-mono">era25_first_charter_slice_ready</span>
                        </p>

                        {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                          .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                          .firstCharterSliceReadiness?.engineeringGates ? (
                          <div
                            id="era25-engineering-gates-require-signed-charter"
                            className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-violet-800/50 px-3 py-3"
                            data-testid="era25-engineering-gates-require-signed-charter-panel"
                          >
                            <p className="font-medium text-violet-100">
                              era25 engineering gates — require signed charter
                            </p>
                            <p className="mt-1 text-violet-200/80">
                              {formatEra25EngineeringGatesLabel(
                                slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                  .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                  .firstCharterSliceReadiness.engineeringGates,
                              )}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge
                                variant="outline"
                                className="rounded-full font-mono text-[10px] text-violet-200"
                              >
                                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.era25EngineeringGatesMilestone.replaceAll(
                                  "_",
                                  " ",
                                )}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="rounded-full text-[10px] text-violet-300"
                              >
                                gates{" "}
                                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                  .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                  .firstCharterSliceReadiness.engineeringGates.gatesBlocked
                                  ? "blocked"
                                  : "open"}
                              </Badge>
                            </div>
                            <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                              {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.guardrails.map(
                                (rule) => (
                                  <li key={rule}>{rule}</li>
                                ),
                              )}
                            </ul>
                            <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                              <span>
                                {
                                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                    .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                    .firstCharterSliceReadiness.engineeringGates
                                    .postReadinessOrchestratorCommand
                                }
                              </span>
                              <span>
                                {
                                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                    .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                    .firstCharterSliceReadiness.engineeringGates.validateCommand
                                }
                              </span>
                              <span>
                                {
                                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                    .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                    .firstCharterSliceReadiness.engineeringGates.syncReportCommand
                                }
                              </span>
                            </div>
                            <p className="mt-2 text-violet-300/70">
                              First era25 product slice only when{" "}
                              <span className="font-mono">era25_engineering_gates_open</span>
                            </p>

                            {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                              .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                              .firstCharterSliceReadiness.engineeringGates
                              .firstProductSliceBlueprint ? (
                              <div
                                id="era25-first-product-slice-blueprint"
                                className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-fuchsia-800/50 px-3 py-3"
                                data-testid="era25-first-product-slice-blueprint-panel"
                              >
                                <p className="font-medium text-fuchsia-100">
                                  era25 first product slice — blueprint orchestration
                                </p>
                                <p className="mt-1 text-fuchsia-200/80">
                                  {formatEra25FirstProductSliceBlueprintLabel(
                                    slice.engineeringPathTerminus.postTerminusSteadyState
                                      .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                      .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                      .firstProductSliceBlueprint,
                                  )}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <Badge
                                    variant="outline"
                                    className="rounded-full font-mono text-[10px] text-fuchsia-200"
                                  >
                                    {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.era25FirstProductSliceBlueprintMilestone.replaceAll(
                                      "_",
                                      " ",
                                    )}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="rounded-full text-[10px] text-fuchsia-300"
                                  >
                                    {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                      .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                      .firstCharterSliceReadiness.engineeringGates
                                      .firstProductSliceBlueprint.canonicalSliceName}
                                  </Badge>
                                </div>
                                <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                                  {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.guardrails.map(
                                    (rule) => (
                                      <li key={rule}>{rule}</li>
                                    ),
                                  )}
                                </ul>
                                <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                  <span>
                                    {
                                      slice.engineeringPathTerminus.postTerminusSteadyState
                                        .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                        .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                        .firstProductSliceBlueprint.postGatesOrchestratorCommand
                                    }
                                  </span>
                                  <span>
                                    {
                                      slice.engineeringPathTerminus.postTerminusSteadyState
                                        .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                        .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                        .firstProductSliceBlueprint.validateCommand
                                    }
                                  </span>
                                  <span>
                                    {
                                      slice.engineeringPathTerminus.postTerminusSteadyState
                                        .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                        .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                        .firstProductSliceBlueprint.syncReportCommand
                                    }
                                  </span>
                                </div>
                                <p className="mt-2 text-fuchsia-300/70">
                                  era25 product code only when{" "}
                                  <span className="font-mono">
                                    era25_first_product_slice_blueprint_ready
                                  </span>
                                </p>

                                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                  .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                  .firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint
                                  ?.ownerDailyBriefingBreakthrough ? (
                                  <div
                                    id="era25-owner-daily-briefing-breakthrough"
                                    className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-pink-800/50 px-3 py-3"
                                    data-testid="era25-owner-daily-briefing-breakthrough-panel"
                                  >
                                    <p className="font-medium text-pink-100">
                                      era25 owner daily briefing breakthrough — product slice
                                    </p>
                                    <p className="mt-1 text-pink-200/80">
                                      {formatOwnerDailyBriefingBreakthroughEra25Label(
                                        slice.engineeringPathTerminus.postTerminusSteadyState
                                          .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                          .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                          .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough,
                                      )}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      <Badge
                                        variant="outline"
                                        className="rounded-full font-mono text-[10px] text-pink-200"
                                      >
                                        {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.ownerDailyBriefingBreakthroughEra25Milestone.replaceAll(
                                          "_",
                                          " ",
                                        )}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className="rounded-full text-[10px] text-pink-300"
                                      >
                                        B{" "}
                                        {slice.engineeringPathTerminus.postTerminusSteadyState
                                          .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                          .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                          .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                          .wiredBriefingTileCount}
                                        /
                                        {
                                          slice.engineeringPathTerminus.postTerminusSteadyState
                                            .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                            .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                            .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                            .briefingSchemeCount
                                        }
                                      </Badge>
                                    </div>
                                    <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                                      {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.guardrails.map(
                                        (rule) => (
                                          <li key={rule}>{rule}</li>
                                        ),
                                      )}
                                    </ul>
                                    <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                      <span>
                                        {
                                          slice.engineeringPathTerminus.postTerminusSteadyState
                                            .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                            .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                            .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                            .postGatesOrchestratorCommand
                                        }
                                      </span>
                                      <span>
                                        {
                                          slice.engineeringPathTerminus.postTerminusSteadyState
                                            .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                            .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                            .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                            .validateCommand
                                        }
                                      </span>
                                    </div>
                                    <p className="mt-2 text-pink-300/70">
                                      WOW pillar ready when{" "}
                                      <span className="font-mono">
                                        owner_daily_briefing_breakthrough_era25_ready
                                      </span>
                                    </p>

                                    {slice.engineeringPathTerminus.postTerminusSteadyState
                                      .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                      .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                      .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                      ?.paidPilotGoConvergence ? (
                                      <div
                                        id="era25-paid-pilot-go-convergence"
                                        className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-rose-800/50 px-3 py-3"
                                        data-testid="era25-paid-pilot-go-convergence-panel"
                                      >
                                        <p className="font-medium text-rose-100">
                                          era25 paid pilot GO convergence — B3 tile
                                        </p>
                                        <p className="mt-1 text-rose-200/80">
                                          {formatPaidPilotGoConvergenceEra25Label(
                                            slice.engineeringPathTerminus.postTerminusSteadyState
                                              .absolutePathEnd.linearPathPermanentlyClosed
                                              .step17Forbidden.era25CharterExit
                                              .firstCharterSliceReadiness.engineeringGates
                                              .firstProductSliceBlueprint
                                              .ownerDailyBriefingBreakthrough.paidPilotGoConvergence,
                                          )}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                          <Badge
                                            variant="outline"
                                            className="rounded-full font-mono text-[10px] text-rose-200"
                                          >
                                            {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.paidPilotGoConvergenceEra25Milestone.replaceAll(
                                              "_",
                                              " ",
                                            )}
                                          </Badge>
                                          <Badge
                                            variant="outline"
                                            className="rounded-full text-[10px] text-rose-300"
                                          >
                                            GO:{" "}
                                            {slice.engineeringPathTerminus.postTerminusSteadyState
                                              .absolutePathEnd.linearPathPermanentlyClosed
                                              .step17Forbidden.era25CharterExit
                                              .firstCharterSliceReadiness.engineeringGates
                                              .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                              .paidPilotGoConvergence.goDecision ?? "NO ARTIFACT"}
                                          </Badge>
                                        </div>
                                        <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                                          {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.guardrails.map(
                                            (rule) => (
                                              <li key={rule}>{rule}</li>
                                            ),
                                          )}
                                        </ul>
                                        <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                          <span>
                                            {
                                              slice.engineeringPathTerminus.postTerminusSteadyState
                                                .absolutePathEnd.linearPathPermanentlyClosed
                                                .step17Forbidden.era25CharterExit
                                                .firstCharterSliceReadiness.engineeringGates
                                                .firstProductSliceBlueprint
                                                .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                .postBreakthroughOrchestratorCommand
                                            }
                                          </span>
                                          <span>
                                            {
                                              slice.engineeringPathTerminus.postTerminusSteadyState
                                                .absolutePathEnd.linearPathPermanentlyClosed
                                                .step17Forbidden.era25CharterExit
                                                .firstCharterSliceReadiness.engineeringGates
                                                .firstProductSliceBlueprint
                                                .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                .validateCommand
                                            }
                                          </span>
                                        </div>
                                        <p className="mt-2 text-rose-300/70">
                                          Convergence ready when{" "}
                                          <span className="font-mono">
                                            paid_pilot_go_convergence_era25_ready
                                          </span>
                                        </p>

                                        {slice.engineeringPathTerminus.postTerminusSteadyState
                                          .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                          .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                          .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                          ?.paidPilotGoConvergence?.pilotWeek1ExecutionConvergence ? (
                                          <div
                                            id="era25-pilot-week1-execution-convergence"
                                            className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-violet-800/50 px-3 py-3"
                                            data-testid="era25-pilot-week1-execution-convergence-panel"
                                          >
                                            <p className="font-medium text-violet-100">
                                              era25 pilot week 1 execution convergence
                                            </p>
                                            <p className="mt-1 text-violet-200/80">
                                              {formatPilotWeek1ExecutionConvergenceEra25Label(
                                                slice.engineeringPathTerminus.postTerminusSteadyState
                                                  .absolutePathEnd.linearPathPermanentlyClosed
                                                  .step17Forbidden.era25CharterExit
                                                  .firstCharterSliceReadiness.engineeringGates
                                                  .firstProductSliceBlueprint
                                                  .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                  .pilotWeek1ExecutionConvergence,
                                              )}
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                              <Badge
                                                variant="outline"
                                                className="rounded-full font-mono text-[10px] text-violet-200"
                                              >
                                                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.pilotWeek1ExecutionConvergenceEra25Milestone.replaceAll(
                                                  "_",
                                                  " ",
                                                )}
                                              </Badge>
                                              <Badge
                                                variant="outline"
                                                className="rounded-full text-[10px] text-violet-300"
                                              >
                                                {slice.engineeringPathTerminus.postTerminusSteadyState
                                                  .absolutePathEnd.linearPathPermanentlyClosed
                                                  .step17Forbidden.era25CharterExit
                                                  .firstCharterSliceReadiness.engineeringGates
                                                  .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                                  .paidPilotGoConvergence.pilotWeek1ExecutionConvergence
                                                  .completedPhaseCount}
                                                /
                                                {
                                                  slice.engineeringPathTerminus.postTerminusSteadyState
                                                    .absolutePathEnd.linearPathPermanentlyClosed
                                                    .step17Forbidden.era25CharterExit
                                                    .firstCharterSliceReadiness.engineeringGates
                                                    .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                                    .paidPilotGoConvergence.pilotWeek1ExecutionConvergence
                                                    .totalPhaseCount
                                                }{" "}
                                                days
                                              </Badge>
                                            </div>
                                            <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                                              {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.guardrails.map(
                                                (rule) => (
                                                  <li key={rule}>{rule}</li>
                                                ),
                                              )}
                                            </ul>
                                            <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                              <span>
                                                {
                                                  slice.engineeringPathTerminus.postTerminusSteadyState
                                                    .absolutePathEnd.linearPathPermanentlyClosed
                                                    .step17Forbidden.era25CharterExit
                                                    .firstCharterSliceReadiness.engineeringGates
                                                    .firstProductSliceBlueprint
                                                    .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                    .pilotWeek1ExecutionConvergence
                                                    .postGoConvergenceOrchestratorCommand
                                                }
                                              </span>
                                              <span>
                                                {
                                                  slice.engineeringPathTerminus.postTerminusSteadyState
                                                    .absolutePathEnd.linearPathPermanentlyClosed
                                                    .step17Forbidden.era25CharterExit
                                                    .firstCharterSliceReadiness.engineeringGates
                                                    .firstProductSliceBlueprint
                                                    .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                    .pilotWeek1ExecutionConvergence.validateCommand
                                                }
                                              </span>
                                            </div>
                                            <p className="mt-2 text-violet-300/70">
                                              Convergence ready when{" "}
                                              <span className="font-mono">
                                                pilot_week1_execution_convergence_era25_ready
                                              </span>
                                            </p>

                                            {slice.engineeringPathTerminus.postTerminusSteadyState
                                              .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                              .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                              .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                              .paidPilotGoConvergence?.pilotWeek1ExecutionConvergence
                                              ?.month2MarketReadinessConvergence ? (
                                              <div
                                                id="era25-month2-market-readiness-convergence"
                                                className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-indigo-800/50 px-3 py-3"
                                                data-testid="era25-month2-market-readiness-convergence-panel"
                                              >
                                                <p className="font-medium text-indigo-100">
                                                  era25 month 2 market readiness convergence
                                                </p>
                                                <p className="mt-1 text-indigo-200/80">
                                                  {formatMonth2MarketReadinessConvergenceEra25Label(
                                                    slice.engineeringPathTerminus.postTerminusSteadyState
                                                      .absolutePathEnd.linearPathPermanentlyClosed
                                                      .step17Forbidden.era25CharterExit
                                                      .firstCharterSliceReadiness.engineeringGates
                                                      .firstProductSliceBlueprint
                                                      .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                      .pilotWeek1ExecutionConvergence
                                                      .month2MarketReadinessConvergence,
                                                  )}
                                                </p>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                  <Badge
                                                    variant="outline"
                                                    className="rounded-full font-mono text-[10px] text-indigo-200"
                                                  >
                                                    {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.month2MarketReadinessConvergenceEra25Milestone.replaceAll(
                                                      "_",
                                                      " ",
                                                    )}
                                                  </Badge>
                                                  <Badge
                                                    variant="outline"
                                                    className="rounded-full text-[10px] text-indigo-300"
                                                  >
                                                    {slice.engineeringPathTerminus.postTerminusSteadyState
                                                      .absolutePathEnd.linearPathPermanentlyClosed
                                                      .step17Forbidden.era25CharterExit
                                                      .firstCharterSliceReadiness.engineeringGates
                                                      .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                                      .paidPilotGoConvergence.pilotWeek1ExecutionConvergence
                                                      .month2MarketReadinessConvergence
                                                      .completedBlockingCount}
                                                    /
                                                    {
                                                      slice.engineeringPathTerminus.postTerminusSteadyState
                                                        .absolutePathEnd.linearPathPermanentlyClosed
                                                        .step17Forbidden.era25CharterExit
                                                        .firstCharterSliceReadiness.engineeringGates
                                                        .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                                        .paidPilotGoConvergence.pilotWeek1ExecutionConvergence
                                                        .month2MarketReadinessConvergence
                                                        .totalBlockingCount
                                                    }{" "}
                                                    workstreams
                                                  </Badge>
                                                </div>
                                                <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                                                  {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.guardrails.map(
                                                    (rule) => (
                                                      <li key={rule}>{rule}</li>
                                                    ),
                                                  )}
                                                </ul>
                                                <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                                  <span>
                                                    {
                                                      slice.engineeringPathTerminus.postTerminusSteadyState
                                                        .absolutePathEnd.linearPathPermanentlyClosed
                                                        .step17Forbidden.era25CharterExit
                                                        .firstCharterSliceReadiness.engineeringGates
                                                        .firstProductSliceBlueprint
                                                        .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                        .pilotWeek1ExecutionConvergence
                                                        .month2MarketReadinessConvergence
                                                        .postWeek1ConvergenceOrchestratorCommand
                                                    }
                                                  </span>
                                                  <span>
                                                    {
                                                      slice.engineeringPathTerminus.postTerminusSteadyState
                                                        .absolutePathEnd.linearPathPermanentlyClosed
                                                        .step17Forbidden.era25CharterExit
                                                        .firstCharterSliceReadiness.engineeringGates
                                                        .firstProductSliceBlueprint
                                                        .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                        .pilotWeek1ExecutionConvergence
                                                        .month2MarketReadinessConvergence.validateCommand
                                                    }
                                                  </span>
                                                </div>
                                                <p className="mt-2 text-indigo-300/70">
                                                  Convergence ready when{" "}
                                                  <span className="font-mono">
                                                    month2_market_readiness_convergence_era25_ready
                                                  </span>
                                                </p>

                                                {slice.engineeringPathTerminus.postTerminusSteadyState
                                                  .absolutePathEnd.linearPathPermanentlyClosed
                                                  .step17Forbidden.era25CharterExit
                                                  .firstCharterSliceReadiness.engineeringGates
                                                  .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                                  .paidPilotGoConvergence?.pilotWeek1ExecutionConvergence
                                                  ?.month2MarketReadinessConvergence
                                                  ?.scaleReadinessConvergence ? (
                                                  <div
                                                    id="era25-scale-readiness-convergence"
                                                    className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-emerald-800/50 px-3 py-3"
                                                    data-testid="era25-scale-readiness-convergence-panel"
                                                  >
                                                    <p className="font-medium text-emerald-100">
                                                      era25 scale readiness convergence
                                                    </p>
                                                    <p className="mt-1 text-emerald-200/80">
                                                      {formatScaleReadinessConvergenceEra25Label(
                                                        slice.engineeringPathTerminus
                                                          .postTerminusSteadyState.absolutePathEnd
                                                          .linearPathPermanentlyClosed.step17Forbidden
                                                          .era25CharterExit.firstCharterSliceReadiness
                                                          .engineeringGates.firstProductSliceBlueprint
                                                          .ownerDailyBriefingBreakthrough
                                                          .paidPilotGoConvergence
                                                          .pilotWeek1ExecutionConvergence
                                                          .month2MarketReadinessConvergence
                                                          .scaleReadinessConvergence,
                                                      )}
                                                    </p>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                      <Badge
                                                        variant="outline"
                                                        className="rounded-full font-mono text-[10px] text-emerald-200"
                                                      >
                                                        {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.scaleReadinessConvergence.scaleReadinessConvergenceEra25Milestone.replaceAll(
                                                          "_",
                                                          " ",
                                                        )}
                                                      </Badge>
                                                      <Badge
                                                        variant="outline"
                                                        className="rounded-full text-[10px] text-emerald-300"
                                                      >
                                                        {
                                                          slice.engineeringPathTerminus
                                                            .postTerminusSteadyState.absolutePathEnd
                                                            .linearPathPermanentlyClosed
                                                            .step17Forbidden.era25CharterExit
                                                            .firstCharterSliceReadiness.engineeringGates
                                                            .firstProductSliceBlueprint
                                                            .ownerDailyBriefingBreakthrough
                                                            .paidPilotGoConvergence
                                                            .pilotWeek1ExecutionConvergence
                                                            .month2MarketReadinessConvergence
                                                            .scaleReadinessConvergence
                                                            .completedBlockingCount
                                                        }
                                                        /
                                                        {
                                                          slice.engineeringPathTerminus
                                                            .postTerminusSteadyState.absolutePathEnd
                                                            .linearPathPermanentlyClosed
                                                            .step17Forbidden.era25CharterExit
                                                            .firstCharterSliceReadiness.engineeringGates
                                                            .firstProductSliceBlueprint
                                                            .ownerDailyBriefingBreakthrough
                                                            .paidPilotGoConvergence
                                                            .pilotWeek1ExecutionConvergence
                                                            .month2MarketReadinessConvergence
                                                            .scaleReadinessConvergence
                                                            .totalBlockingCount
                                                        }{" "}
                                                        gates
                                                      </Badge>
                                                    </div>
                                                    <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                                                      {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.scaleReadinessConvergence.guardrails.map(
                                                        (rule) => (
                                                          <li key={rule}>{rule}</li>
                                                        ),
                                                      )}
                                                    </ul>
                                                    <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                                      <span>
                                                        {
                                                          slice.engineeringPathTerminus
                                                            .postTerminusSteadyState.absolutePathEnd
                                                            .linearPathPermanentlyClosed
                                                            .step17Forbidden.era25CharterExit
                                                            .firstCharterSliceReadiness.engineeringGates
                                                            .firstProductSliceBlueprint
                                                            .ownerDailyBriefingBreakthrough
                                                            .paidPilotGoConvergence
                                                            .pilotWeek1ExecutionConvergence
                                                            .month2MarketReadinessConvergence
                                                            .scaleReadinessConvergence
                                                            .postMonth2ConvergenceOrchestratorCommand
                                                        }
                                                      </span>
                                                      <span>
                                                        {
                                                          slice.engineeringPathTerminus
                                                            .postTerminusSteadyState.absolutePathEnd
                                                            .linearPathPermanentlyClosed
                                                            .step17Forbidden.era25CharterExit
                                                            .firstCharterSliceReadiness.engineeringGates
                                                            .firstProductSliceBlueprint
                                                            .ownerDailyBriefingBreakthrough
                                                            .paidPilotGoConvergence
                                                            .pilotWeek1ExecutionConvergence
                                                            .month2MarketReadinessConvergence
                                                            .scaleReadinessConvergence.validateCommand
                                                        }
                                                      </span>
                                                    </div>
                                                    <p className="mt-2 text-emerald-300/70">
                                                      Convergence ready when{" "}
                                                      <span className="font-mono">
                                                        scale_readiness_convergence_era25_ready
                                                      </span>
                                                    </p>

                                                    {slice.engineeringPathTerminus.postTerminusSteadyState
                                                      .absolutePathEnd.linearPathPermanentlyClosed
                                                      .step17Forbidden.era25CharterExit
                                                      .firstCharterSliceReadiness.engineeringGates
                                                      .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                                      .paidPilotGoConvergence?.pilotWeek1ExecutionConvergence
                                                      ?.month2MarketReadinessConvergence
                                                      ?.scaleReadinessConvergence
                                                      ?.seriesAPartnerExpansionConvergence ? (
                                                      <div
                                                        id="era25-series-a-partner-expansion-convergence"
                                                        className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-amber-800/50 px-3 py-3"
                                                        data-testid="era25-series-a-partner-expansion-convergence-panel"
                                                      >
                                                        <p className="font-medium text-amber-100">
                                                          era25 series a partner expansion convergence
                                                        </p>
                                                        <p className="mt-1 text-amber-200/80">
                                                          {formatSeriesAPartnerExpansionConvergenceEra25Label(
                                                            slice.engineeringPathTerminus
                                                              .postTerminusSteadyState.absolutePathEnd
                                                              .linearPathPermanentlyClosed.step17Forbidden
                                                              .era25CharterExit.firstCharterSliceReadiness
                                                              .engineeringGates.firstProductSliceBlueprint
                                                              .ownerDailyBriefingBreakthrough
                                                              .paidPilotGoConvergence
                                                              .pilotWeek1ExecutionConvergence
                                                              .month2MarketReadinessConvergence
                                                              .scaleReadinessConvergence
                                                              .seriesAPartnerExpansionConvergence,
                                                          )}
                                                        </p>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                          <Badge
                                                            variant="outline"
                                                            className="rounded-full font-mono text-[10px] text-amber-200"
                                                          >
                                                            {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.scaleReadinessConvergence.seriesAPartnerExpansionConvergence.seriesAPartnerExpansionConvergenceEra25Milestone.replaceAll(
                                                              "_",
                                                              " ",
                                                            )}
                                                          </Badge>
                                                          <Badge
                                                            variant="outline"
                                                            className="rounded-full text-[10px] text-amber-300"
                                                          >
                                                            {
                                                              slice.engineeringPathTerminus
                                                                .postTerminusSteadyState.absolutePathEnd
                                                                .linearPathPermanentlyClosed
                                                                .step17Forbidden.era25CharterExit
                                                                .firstCharterSliceReadiness.engineeringGates
                                                                .firstProductSliceBlueprint
                                                                .ownerDailyBriefingBreakthrough
                                                                .paidPilotGoConvergence
                                                                .pilotWeek1ExecutionConvergence
                                                                .month2MarketReadinessConvergence
                                                                .scaleReadinessConvergence
                                                                .seriesAPartnerExpansionConvergence
                                                                .completedBlockingCount
                                                            }
                                                            /
                                                            {
                                                              slice.engineeringPathTerminus
                                                                .postTerminusSteadyState.absolutePathEnd
                                                                .linearPathPermanentlyClosed
                                                                .step17Forbidden.era25CharterExit
                                                                .firstCharterSliceReadiness.engineeringGates
                                                                .firstProductSliceBlueprint
                                                                .ownerDailyBriefingBreakthrough
                                                                .paidPilotGoConvergence
                                                                .pilotWeek1ExecutionConvergence
                                                                .month2MarketReadinessConvergence
                                                                .scaleReadinessConvergence
                                                                .seriesAPartnerExpansionConvergence
                                                                .totalBlockingCount
                                                            }{" "}
                                                            tracks
                                                          </Badge>
                                                        </div>
                                                        <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                                                          {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.scaleReadinessConvergence.seriesAPartnerExpansionConvergence.guardrails.map(
                                                            (rule) => (
                                                              <li key={rule}>{rule}</li>
                                                            ),
                                                          )}
                                                        </ul>
                                                        <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                                          <span>
                                                            {
                                                              slice.engineeringPathTerminus
                                                                .postTerminusSteadyState.absolutePathEnd
                                                                .linearPathPermanentlyClosed
                                                                .step17Forbidden.era25CharterExit
                                                                .firstCharterSliceReadiness.engineeringGates
                                                                .firstProductSliceBlueprint
                                                                .ownerDailyBriefingBreakthrough
                                                                .paidPilotGoConvergence
                                                                .pilotWeek1ExecutionConvergence
                                                                .month2MarketReadinessConvergence
                                                                .scaleReadinessConvergence
                                                                .seriesAPartnerExpansionConvergence
                                                                .postScaleConvergenceOrchestratorCommand
                                                            }
                                                          </span>
                                                          <span>
                                                            {
                                                              slice.engineeringPathTerminus
                                                                .postTerminusSteadyState.absolutePathEnd
                                                                .linearPathPermanentlyClosed
                                                                .step17Forbidden.era25CharterExit
                                                                .firstCharterSliceReadiness.engineeringGates
                                                                .firstProductSliceBlueprint
                                                                .ownerDailyBriefingBreakthrough
                                                                .paidPilotGoConvergence
                                                                .pilotWeek1ExecutionConvergence
                                                                .month2MarketReadinessConvergence
                                                                .scaleReadinessConvergence
                                                                .seriesAPartnerExpansionConvergence
                                                                .validateCommand
                                                            }
                                                          </span>
                                                        </div>
                                                        <p className="mt-2 text-amber-300/70">
                                                          Convergence ready when{" "}
                                                          <span className="font-mono">
                                                            series_a_partner_expansion_convergence_era25_ready
                                                          </span>
                                                        </p>
                                                        {slice.engineeringPathTerminus
                                                          .postTerminusSteadyState.absolutePathEnd
                                                          .linearPathPermanentlyClosed
                                                          .step17Forbidden.era25CharterExit
                                                          .firstCharterSliceReadiness.engineeringGates
                                                          .firstProductSliceBlueprint
                                                          .ownerDailyBriefingBreakthrough
                                                          .paidPilotGoConvergence
                                                          ?.pilotWeek1ExecutionConvergence
                                                          ?.month2MarketReadinessConvergence
                                                          ?.scaleReadinessConvergence
                                                          ?.seriesAPartnerExpansionConvergence
                                                          ?.marketLeaderPositioningConvergence ? (
                                                          <div
                                                            id="era25-market-leader-positioning-convergence"
                                                            className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-violet-800/50 px-3 py-3"
                                                            data-testid="era25-market-leader-positioning-convergence-panel"
                                                          >
                                                            <p className="font-medium text-violet-100">
                                                              era25 market leader positioning convergence
                                                            </p>
                                                            <p className="mt-1 text-violet-200/80">
                                                              {formatMarketLeaderPositioningConvergenceEra25Label(
                                                                slice.engineeringPathTerminus
                                                                  .postTerminusSteadyState
                                                                  .absolutePathEnd
                                                                  .linearPathPermanentlyClosed
                                                                  .step17Forbidden.era25CharterExit
                                                                  .firstCharterSliceReadiness
                                                                  .engineeringGates
                                                                  .firstProductSliceBlueprint
                                                                  .ownerDailyBriefingBreakthrough
                                                                  .paidPilotGoConvergence
                                                                  .pilotWeek1ExecutionConvergence
                                                                  .month2MarketReadinessConvergence
                                                                  .scaleReadinessConvergence
                                                                  .seriesAPartnerExpansionConvergence
                                                                  .marketLeaderPositioningConvergence,
                                                              )}
                                                            </p>
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                              <Badge
                                                                variant="outline"
                                                                className="rounded-full font-mono text-[10px] text-violet-200"
                                                              >
                                                                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.scaleReadinessConvergence.seriesAPartnerExpansionConvergence.marketLeaderPositioningConvergence.marketLeaderPositioningConvergenceEra25Milestone.replaceAll(
                                                                  "_",
                                                                  " ",
                                                                )}
                                                              </Badge>
                                                              <Badge
                                                                variant="outline"
                                                                className="rounded-full text-[10px] text-violet-300"
                                                              >
                                                                {
                                                                  slice.engineeringPathTerminus
                                                                    .postTerminusSteadyState
                                                                    .absolutePathEnd
                                                                    .linearPathPermanentlyClosed
                                                                    .step17Forbidden.era25CharterExit
                                                                    .firstCharterSliceReadiness
                                                                    .engineeringGates
                                                                    .firstProductSliceBlueprint
                                                                    .ownerDailyBriefingBreakthrough
                                                                    .paidPilotGoConvergence
                                                                    .pilotWeek1ExecutionConvergence
                                                                    .month2MarketReadinessConvergence
                                                                    .scaleReadinessConvergence
                                                                    .seriesAPartnerExpansionConvergence
                                                                    .marketLeaderPositioningConvergence
                                                                    .completedBlockingCount
                                                                }
                                                                /
                                                                {
                                                                  slice.engineeringPathTerminus
                                                                    .postTerminusSteadyState
                                                                    .absolutePathEnd
                                                                    .linearPathPermanentlyClosed
                                                                    .step17Forbidden.era25CharterExit
                                                                    .firstCharterSliceReadiness
                                                                    .engineeringGates
                                                                    .firstProductSliceBlueprint
                                                                    .ownerDailyBriefingBreakthrough
                                                                    .paidPilotGoConvergence
                                                                    .pilotWeek1ExecutionConvergence
                                                                    .month2MarketReadinessConvergence
                                                                    .scaleReadinessConvergence
                                                                    .seriesAPartnerExpansionConvergence
                                                                    .marketLeaderPositioningConvergence
                                                                    .totalBlockingCount
                                                                }{" "}
                                                                pillars
                                                              </Badge>
                                                            </div>
                                                            <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                                                              {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.scaleReadinessConvergence.seriesAPartnerExpansionConvergence.marketLeaderPositioningConvergence.guardrails.map(
                                                                (rule) => (
                                                                  <li key={rule}>{rule}</li>
                                                                ),
                                                              )}
                                                            </ul>
                                                            <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                                              <span>
                                                                {
                                                                  slice.engineeringPathTerminus
                                                                    .postTerminusSteadyState
                                                                    .absolutePathEnd
                                                                    .linearPathPermanentlyClosed
                                                                    .step17Forbidden.era25CharterExit
                                                                    .firstCharterSliceReadiness
                                                                    .engineeringGates
                                                                    .firstProductSliceBlueprint
                                                                    .ownerDailyBriefingBreakthrough
                                                                    .paidPilotGoConvergence
                                                                    .pilotWeek1ExecutionConvergence
                                                                    .month2MarketReadinessConvergence
                                                                    .scaleReadinessConvergence
                                                                    .seriesAPartnerExpansionConvergence
                                                                    .marketLeaderPositioningConvergence
                                                                    .postSeriesAConvergenceOrchestratorCommand
                                                                }
                                                              </span>
                                                              <span>
                                                                {
                                                                  slice.engineeringPathTerminus
                                                                    .postTerminusSteadyState
                                                                    .absolutePathEnd
                                                                    .linearPathPermanentlyClosed
                                                                    .step17Forbidden.era25CharterExit
                                                                    .firstCharterSliceReadiness
                                                                    .engineeringGates
                                                                    .firstProductSliceBlueprint
                                                                    .ownerDailyBriefingBreakthrough
                                                                    .paidPilotGoConvergence
                                                                    .pilotWeek1ExecutionConvergence
                                                                    .month2MarketReadinessConvergence
                                                                    .scaleReadinessConvergence
                                                                    .seriesAPartnerExpansionConvergence
                                                                    .marketLeaderPositioningConvergence
                                                                    .validateCommand
                                                                }
                                                              </span>
                                                            </div>
                                                            <p className="mt-2 text-violet-300/70">
                                                              Convergence ready when{" "}
                                                              <span className="font-mono">
                                                                market_leader_positioning_convergence_era25_ready
                                                              </span>
                                                            </p>
                                                            {slice.engineeringPathTerminus
                                                              .postTerminusSteadyState.absolutePathEnd
                                                              .linearPathPermanentlyClosed
                                                              .step17Forbidden.era25CharterExit
                                                              .firstCharterSliceReadiness.engineeringGates
                                                              .firstProductSliceBlueprint
                                                              .ownerDailyBriefingBreakthrough
                                                              .paidPilotGoConvergence
                                                              ?.pilotWeek1ExecutionConvergence
                                                              ?.month2MarketReadinessConvergence
                                                              ?.scaleReadinessConvergence
                                                              ?.seriesAPartnerExpansionConvergence
                                                              ?.marketLeaderPositioningConvergence
                                                              ?.sustainedOperationalExcellenceConvergence ? (
                                                              <div
                                                                id="era25-sustained-operational-excellence-convergence"
                                                                className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-emerald-800/50 px-3 py-3"
                                                                data-testid="era25-sustained-operational-excellence-convergence-panel"
                                                              >
                                                                <p className="font-medium text-emerald-100">
                                                                  era25 sustained operational excellence convergence
                                                                </p>
                                                                <p className="mt-1 text-emerald-200/80">
                                                                  {formatSustainedOperationalExcellenceConvergenceEra25Label(
                                                                    slice.engineeringPathTerminus
                                                                      .postTerminusSteadyState
                                                                      .absolutePathEnd
                                                                      .linearPathPermanentlyClosed
                                                                      .step17Forbidden.era25CharterExit
                                                                      .firstCharterSliceReadiness
                                                                      .engineeringGates
                                                                      .firstProductSliceBlueprint
                                                                      .ownerDailyBriefingBreakthrough
                                                                      .paidPilotGoConvergence
                                                                      .pilotWeek1ExecutionConvergence
                                                                      .month2MarketReadinessConvergence
                                                                      .scaleReadinessConvergence
                                                                      .seriesAPartnerExpansionConvergence
                                                                      .marketLeaderPositioningConvergence
                                                                      .sustainedOperationalExcellenceConvergence,
                                                                  )}
                                                                </p>
                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                  <Badge
                                                                    variant="outline"
                                                                    className="rounded-full font-mono text-[10px] text-emerald-200"
                                                                  >
                                                                    {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.scaleReadinessConvergence.seriesAPartnerExpansionConvergence.marketLeaderPositioningConvergence.sustainedOperationalExcellenceConvergence.sustainedOperationalExcellenceConvergenceEra25Milestone.replaceAll(
                                                                      "_",
                                                                      " ",
                                                                    )}
                                                                  </Badge>
                                                                  <Badge
                                                                    variant="outline"
                                                                    className="rounded-full text-[10px] text-emerald-300"
                                                                  >
                                                                    {
                                                                      slice.engineeringPathTerminus
                                                                        .postTerminusSteadyState
                                                                        .absolutePathEnd
                                                                        .linearPathPermanentlyClosed
                                                                        .step17Forbidden.era25CharterExit
                                                                        .firstCharterSliceReadiness
                                                                        .engineeringGates
                                                                        .firstProductSliceBlueprint
                                                                        .ownerDailyBriefingBreakthrough
                                                                        .paidPilotGoConvergence
                                                                        .pilotWeek1ExecutionConvergence
                                                                        .month2MarketReadinessConvergence
                                                                        .scaleReadinessConvergence
                                                                        .seriesAPartnerExpansionConvergence
                                                                        .marketLeaderPositioningConvergence
                                                                        .sustainedOperationalExcellenceConvergence
                                                                        .completedBlockingCount
                                                                    }
                                                                    /
                                                                    {
                                                                      slice.engineeringPathTerminus
                                                                        .postTerminusSteadyState
                                                                        .absolutePathEnd
                                                                        .linearPathPermanentlyClosed
                                                                        .step17Forbidden.era25CharterExit
                                                                        .firstCharterSliceReadiness
                                                                        .engineeringGates
                                                                        .firstProductSliceBlueprint
                                                                        .ownerDailyBriefingBreakthrough
                                                                        .paidPilotGoConvergence
                                                                        .pilotWeek1ExecutionConvergence
                                                                        .month2MarketReadinessConvergence
                                                                        .scaleReadinessConvergence
                                                                        .seriesAPartnerExpansionConvergence
                                                                        .marketLeaderPositioningConvergence
                                                                        .sustainedOperationalExcellenceConvergence
                                                                        .totalBlockingCount
                                                                    }{" "}
                                                                    cadences
                                                                  </Badge>
                                                                </div>
                                                                <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                                                                  {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.scaleReadinessConvergence.seriesAPartnerExpansionConvergence.marketLeaderPositioningConvergence.sustainedOperationalExcellenceConvergence.guardrails.map(
                                                                    (rule) => (
                                                                      <li key={rule}>{rule}</li>
                                                                    ),
                                                                  )}
                                                                </ul>
                                                                <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                                                  <span>
                                                                    {
                                                                      slice.engineeringPathTerminus
                                                                        .postTerminusSteadyState
                                                                        .absolutePathEnd
                                                                        .linearPathPermanentlyClosed
                                                                        .step17Forbidden.era25CharterExit
                                                                        .firstCharterSliceReadiness
                                                                        .engineeringGates
                                                                        .firstProductSliceBlueprint
                                                                        .ownerDailyBriefingBreakthrough
                                                                        .paidPilotGoConvergence
                                                                        .pilotWeek1ExecutionConvergence
                                                                        .month2MarketReadinessConvergence
                                                                        .scaleReadinessConvergence
                                                                        .seriesAPartnerExpansionConvergence
                                                                        .marketLeaderPositioningConvergence
                                                                        .sustainedOperationalExcellenceConvergence
                                                                        .postMarketLeaderConvergenceOrchestratorCommand
                                                                    }
                                                                  </span>
                                                                  <span>
                                                                    {
                                                                      slice.engineeringPathTerminus
                                                                        .postTerminusSteadyState
                                                                        .absolutePathEnd
                                                                        .linearPathPermanentlyClosed
                                                                        .step17Forbidden.era25CharterExit
                                                                        .firstCharterSliceReadiness
                                                                        .engineeringGates
                                                                        .firstProductSliceBlueprint
                                                                        .ownerDailyBriefingBreakthrough
                                                                        .paidPilotGoConvergence
                                                                        .pilotWeek1ExecutionConvergence
                                                                        .month2MarketReadinessConvergence
                                                                        .scaleReadinessConvergence
                                                                        .seriesAPartnerExpansionConvergence
                                                                        .marketLeaderPositioningConvergence
                                                                        .sustainedOperationalExcellenceConvergence
                                                                        .validateCommand
                                                                    }
                                                                  </span>
                                                                </div>
                                                                <p className="mt-2 text-emerald-300/70">
                                                                  Convergence ready when{" "}
                                                                  <span className="font-mono">
                                                                    sustained_operational_excellence_convergence_era25_ready
                                                                  </span>
                                                                </p>
                                                                {slice.engineeringPathTerminus
                                                                  .postTerminusSteadyState
                                                                  .absolutePathEnd
                                                                  .linearPathPermanentlyClosed
                                                                  .step17Forbidden.era25CharterExit
                                                                  .firstCharterSliceReadiness
                                                                  .engineeringGates
                                                                  .firstProductSliceBlueprint
                                                                  .ownerDailyBriefingBreakthrough
                                                                  .paidPilotGoConvergence
                                                                  .pilotWeek1ExecutionConvergence
                                                                  .month2MarketReadinessConvergence
                                                                  .scaleReadinessConvergence
                                                                  .seriesAPartnerExpansionConvergence
                                                                  .marketLeaderPositioningConvergence
                                                                  .sustainedOperationalExcellenceConvergence
                                                                  ?.pureOperationalModeTerminus ? (
                                                                  <div
                                                                    id="era25-pure-operational-mode-terminus"
                                                                    className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-slate-700/60 px-3 py-3"
                                                                    data-testid="era25-pure-operational-mode-terminus-panel"
                                                                  >
                                                                    <p className="font-medium text-slate-200">
                                                                      era25 pure operational mode terminus
                                                                    </p>
                                                                    <p className="mt-1 text-slate-300/80">
                                                                      {formatPureOperationalModeTerminusEra25Label(
                                                                        slice.engineeringPathTerminus
                                                                          .postTerminusSteadyState
                                                                          .absolutePathEnd
                                                                          .linearPathPermanentlyClosed
                                                                          .step17Forbidden
                                                                          .era25CharterExit
                                                                          .firstCharterSliceReadiness
                                                                          .engineeringGates
                                                                          .firstProductSliceBlueprint
                                                                          .ownerDailyBriefingBreakthrough
                                                                          .paidPilotGoConvergence
                                                                          .pilotWeek1ExecutionConvergence
                                                                          .month2MarketReadinessConvergence
                                                                          .scaleReadinessConvergence
                                                                          .seriesAPartnerExpansionConvergence
                                                                          .marketLeaderPositioningConvergence
                                                                          .sustainedOperationalExcellenceConvergence
                                                                          .pureOperationalModeTerminus,
                                                                      )}
                                                                    </p>
                                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                                      <Badge
                                                                        variant="outline"
                                                                        className="rounded-full font-mono text-[10px] text-slate-200"
                                                                      >
                                                                        {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.scaleReadinessConvergence.seriesAPartnerExpansionConvergence.marketLeaderPositioningConvergence.sustainedOperationalExcellenceConvergence.pureOperationalModeTerminus.pureOperationalModeTerminusEra25Milestone.replaceAll(
                                                                          "_",
                                                                          " ",
                                                                        )}
                                                                      </Badge>
                                                                      <Badge
                                                                        variant="outline"
                                                                        className="rounded-full text-[10px] text-slate-300"
                                                                      >
                                                                        {
                                                                          slice.engineeringPathTerminus
                                                                            .postTerminusSteadyState
                                                                            .absolutePathEnd
                                                                            .linearPathPermanentlyClosed
                                                                            .step17Forbidden
                                                                            .era25CharterExit
                                                                            .firstCharterSliceReadiness
                                                                            .engineeringGates
                                                                            .firstProductSliceBlueprint
                                                                            .ownerDailyBriefingBreakthrough
                                                                            .paidPilotGoConvergence
                                                                            .pilotWeek1ExecutionConvergence
                                                                            .month2MarketReadinessConvergence
                                                                            .scaleReadinessConvergence
                                                                            .seriesAPartnerExpansionConvergence
                                                                            .marketLeaderPositioningConvergence
                                                                            .sustainedOperationalExcellenceConvergence
                                                                            .pureOperationalModeTerminus
                                                                            .healthyCount
                                                                        }
                                                                        /
                                                                        {
                                                                          slice.engineeringPathTerminus
                                                                            .postTerminusSteadyState
                                                                            .absolutePathEnd
                                                                            .linearPathPermanentlyClosed
                                                                            .step17Forbidden
                                                                            .era25CharterExit
                                                                            .firstCharterSliceReadiness
                                                                            .engineeringGates
                                                                            .firstProductSliceBlueprint
                                                                            .ownerDailyBriefingBreakthrough
                                                                            .paidPilotGoConvergence
                                                                            .pilotWeek1ExecutionConvergence
                                                                            .month2MarketReadinessConvergence
                                                                            .scaleReadinessConvergence
                                                                            .seriesAPartnerExpansionConvergence
                                                                            .marketLeaderPositioningConvergence
                                                                            .sustainedOperationalExcellenceConvergence
                                                                            .pureOperationalModeTerminus.tracks
                                                                            .length
                                                                        }{" "}
                                                                        tracks fresh
                                                                      </Badge>
                                                                    </div>
                                                                    <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                                                                      {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.scaleReadinessConvergence.seriesAPartnerExpansionConvergence.marketLeaderPositioningConvergence.sustainedOperationalExcellenceConvergence.pureOperationalModeTerminus.guardrails.map(
                                                                        (rule) => (
                                                                          <li key={rule}>{rule}</li>
                                                                        ),
                                                                      )}
                                                                    </ul>
                                                                    <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                                                      <span>
                                                                        {
                                                                          slice.engineeringPathTerminus
                                                                            .postTerminusSteadyState
                                                                            .absolutePathEnd
                                                                            .linearPathPermanentlyClosed
                                                                            .step17Forbidden
                                                                            .era25CharterExit
                                                                            .firstCharterSliceReadiness
                                                                            .engineeringGates
                                                                            .firstProductSliceBlueprint
                                                                            .ownerDailyBriefingBreakthrough
                                                                            .paidPilotGoConvergence
                                                                            .pilotWeek1ExecutionConvergence
                                                                            .month2MarketReadinessConvergence
                                                                            .scaleReadinessConvergence
                                                                            .seriesAPartnerExpansionConvergence
                                                                            .marketLeaderPositioningConvergence
                                                                            .sustainedOperationalExcellenceConvergence
                                                                            .pureOperationalModeTerminus
                                                                            .postSustainedOpsConvergenceOrchestratorCommand
                                                                        }
                                                                      </span>
                                                                      <span>
                                                                        {
                                                                          slice.engineeringPathTerminus
                                                                            .postTerminusSteadyState
                                                                            .absolutePathEnd
                                                                            .linearPathPermanentlyClosed
                                                                            .step17Forbidden
                                                                            .era25CharterExit
                                                                            .firstCharterSliceReadiness
                                                                            .engineeringGates
                                                                            .firstProductSliceBlueprint
                                                                            .ownerDailyBriefingBreakthrough
                                                                            .paidPilotGoConvergence
                                                                            .pilotWeek1ExecutionConvergence
                                                                            .month2MarketReadinessConvergence
                                                                            .scaleReadinessConvergence
                                                                            .seriesAPartnerExpansionConvergence
                                                                            .marketLeaderPositioningConvergence
                                                                            .sustainedOperationalExcellenceConvergence
                                                                            .pureOperationalModeTerminus
                                                                            .validateCommand
                                                                        }
                                                                      </span>
                                                                    </div>
                                                                    <p className="mt-2 text-slate-400/70">
                                                                      Terminus active when{" "}
                                                                      <span className="font-mono">
                                                                        pure_operational_mode_era25_active
                                                                      </span>
                                                                    </p>
                                                                  </div>
                                                                ) : null}
                                                              </div>
                                                            ) : null}
                                                          </div>
                                                        ) : null}
                                                      </div>
                                                    ) : null}
                                                  </div>
                                                ) : null}
                                              </div>
                                            ) : null}
                                          </div>
                                        ) : null}
                                      </div>
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {!isCompact ? (
          <>
            <div className="rounded-lg border border-dashed px-3 py-2 text-xs">
              <p className="font-medium">Guardrails (never)</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 opacity-90">
                {slice.guardrails.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
            <div
              className={cn(
                "rounded-lg border px-3 py-2 text-xs text-muted-foreground",
                isPlatform ? "border-zinc-800" : "border-border/60 bg-muted/20",
              )}
            >
              <p className={cn("font-medium", isPlatform ? "text-zinc-300" : "text-foreground")}>
                Ops commands
              </p>
              <ul className="mt-1 list-inside list-disc font-mono">
                <li>{slice.postProductEvolutionOrchestratorCommand}</li>
                <li>{slice.validateCommand}</li>
                <li>{slice.syncPlaybookReportCommand}</li>
                <li>{slice.exportRhythmCalendarCommand}</li>
                <li>{slice.validateProductEvolutionCommand}</li>
                <li>{slice.validateProductEvolutionIntegrityCommand}</li>
                <li>{slice.integrityValidateCommand}</li>
                <li>{slice.syncIntegrityBaselineCommand}</li>
                <li>npm run smoke:woo-shopify-live</li>
                <li>npm run smoke:commerce-webhook-drill</li>
                <li>npm run test:ci:commercial-pilot-runbook:cert</li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={slice.improvementLoopHref}>Improvement loop</Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="rounded-full">
                <Link href={slice.productEvolutionHref}>Product evolution</Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="rounded-full">
                <Link href={slice.pureOperationalModeTerminusHref}>era25 terminus</Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="rounded-full">
                <Link href={slice.orderHubHref}>Order Hub</Link>
              </Button>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
