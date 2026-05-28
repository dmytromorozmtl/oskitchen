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
            <Badge variant="outline" className="rounded-full text-[10px]">
              era24 maintenance mode
            </Badge>
            {slice.improvementLoopOverdue + slice.productEvolutionOverdue > 0 ? (
              <Badge variant="destructive" className="rounded-full text-[10px]">
                {slice.improvementLoopOverdue + slice.productEvolutionOverdue} upstream overdue
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
              {slice.engineeringPathTerminus.completedSteps}/{slice.engineeringPathTerminus.totalSteps}{" "}
              steps · gate chain{" "}
              {slice.engineeringPathTerminus.gateStepsComplete ? "complete" : "blocked"} · no era25
              gates without charter
            </p>
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
              <span>{slice.engineeringPathTerminus.validateCommand}</span>
              <span>{slice.engineeringPathTerminus.syncStatusReportCommand}</span>
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
              {slice.engineeringPathTerminus.postTerminusSteadyState.overdueCount > 0
                ? `${slice.engineeringPathTerminus.postTerminusSteadyState.overdueCount} track(s) need attention`
                : "Steady state active — no era25 gates without charter"}
            </p>
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
              <span>{slice.engineeringPathTerminus.postTerminusSteadyState.validateCommand}</span>
              <span>{slice.engineeringPathTerminus.postTerminusSteadyState.exportEraCharterChecklistCommand}</span>
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
              {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.pathEngineeringClosed
                ? `Linear engineering closed · ${slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.completedSteps}/${slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.totalSteps} steps`
                : "Complete steady state first"}
            </p>
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
                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.validateCommand}
              </span>
              <span>
                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.syncReportCommand}
              </span>
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
              {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                .linearPathPermanentlyClosed.linearPathPermanentlyClosed
                ? `${slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.docChainSteps}-step doc chain · Step 17+ forbidden`
                : "Complete absolute end first"}
            </p>
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
                    .linearPathPermanentlyClosed.validateCommand
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
              Step 17 FORBIDDEN · guard{" "}
              {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                .linearPathPermanentlyClosed.terminusGuardPassed
                ? "PASS"
                : "FAIL"}{" "}
              · max linear step 16
            </p>
          </div>
        ) : null}

        {!isCompact ? (
          <div className="rounded-lg border border-dashed px-3 py-2 text-xs">
            <p className="font-medium">Guardrails (never)</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 opacity-90">
              {slice.guardrails.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {!isCompact ? (
          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link href={slice.improvementLoopHref}>Improvement loop</Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="rounded-full">
              <Link href={slice.productEvolutionHref}>Product evolution</Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="rounded-full">
              <Link href={slice.orderHubHref}>Order Hub</Link>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
