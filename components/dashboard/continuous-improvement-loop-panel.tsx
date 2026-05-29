import Link from "next/link";
import { AlertCircle, CheckCircle2, Circle, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContinuousImprovementLoopUiSlice } from "@/lib/commercial/continuous-improvement-loop-ui-era22";
import {
  CONTINUOUS_IMPROVEMENT_LOOP_PLATFORM_ANCHOR,
  formatContinuousImprovementLoopProgressLabel,
} from "@/lib/commercial/continuous-improvement-loop-ui-era22";
import type { ContinuousImprovementLoopTrackStatusKind } from "@/lib/commercial/continuous-improvement-loop-phases-era22";
import { cn } from "@/lib/utils";

type ContinuousImprovementLoopPanelVariant = "dashboard" | "platform" | "compact";

function statusIcon(status: ContinuousImprovementLoopTrackStatusKind) {
  if (status === "healthy") return CheckCircle2;
  if (status === "overdue") return AlertCircle;
  if (status === "due_soon") return Circle;
  return Info;
}

function statusBadgeVariant(
  status: ContinuousImprovementLoopTrackStatusKind,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "healthy") return "default";
  if (status === "overdue") return "destructive";
  if (status === "due_soon") return "secondary";
  return "outline";
}

export function ContinuousImprovementLoopPanel(props: {
  slice: ContinuousImprovementLoopUiSlice;
  variant?: ContinuousImprovementLoopPanelVariant;
  title?: string;
}) {
  const {
    slice,
    variant = "dashboard",
    title = "Continuous improvement loop — pure operational mode",
  } = props;
  const isPlatform = variant === "platform";
  const isCompact = variant === "compact";

  const cardClass = isPlatform
    ? "border-emerald-900/60 bg-emerald-950/20"
    : "border-emerald-200/80 bg-emerald-50/15 dark:border-emerald-900/50";

  return (
    <Card
      id={isPlatform ? CONTINUOUS_IMPROVEMENT_LOOP_PLATFORM_ANCHOR.slice(1) : undefined}
      className={cn("scroll-mt-24 shadow-sm", cardClass)}
      data-testid="continuous-improvement-loop-panel"
    >
      {!isCompact ? (
        <CardHeader className="pb-2">
          <CardTitle className={cn("text-lg", isPlatform && "text-emerald-100")}>{title}</CardTitle>
          <CardDescription className={isPlatform ? "text-emerald-200/70" : undefined}>
            {formatContinuousImprovementLoopProgressLabel(slice)} — informational recurring cadence;
            no era21 gate panels or env attestation keys.
          </CardDescription>
        </CardHeader>
      ) : null}
      <CardContent className={cn("space-y-3", isCompact && "pt-4")}>
        {!isCompact ? (
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="rounded-full font-mono text-[10px]">
              pure operational mode
            </Badge>
            <Badge variant="outline" className="rounded-full font-mono text-[10px]">
              {slice.improvementLoopMilestone.replaceAll("_", " ")}
            </Badge>
            <Badge variant="outline" className="rounded-full text-[10px]">
              decision: {slice.goDecision}
            </Badge>
            {slice.customerName ? (
              <Badge variant="secondary" className="rounded-full text-[10px]">
                customer: {slice.customerName}
              </Badge>
            ) : null}
            {!slice.sustainedOpsIntegrityPassed ? (
              <Badge variant="destructive" className="rounded-full text-[10px]">
                Sustained ops integrity FAIL
              </Badge>
            ) : null}
            {!slice.improvementLoopIntegrityPassed ? (
              <Badge variant="destructive" className="rounded-full text-[10px]">
                Improvement loop integrity FAIL
              </Badge>
            ) : null}
            {slice.overdueCount > 0 ? (
              <Badge variant="destructive" className="rounded-full text-[10px]">
                {slice.overdueCount} overdue
              </Badge>
            ) : null}
          </div>
        ) : (
          <p className="text-sm font-medium">{formatContinuousImprovementLoopProgressLabel(slice)}</p>
        )}

        {slice.nextAttentionTrack ? (
          <div
            className={cn(
              "rounded-lg border px-3 py-2 text-sm",
              isPlatform
                ? "border-amber-800/60 bg-amber-950/20 text-amber-100"
                : "border-amber-200/70 bg-amber-50/20",
            )}
          >
            <p className="font-medium">Next attention</p>
            <p className="mt-1 text-xs opacity-90">{slice.nextAttentionDetail}</p>
          </div>
        ) : null}

        <ul className="space-y-2">
          {slice.tracks.map((track) => {
            const Icon = statusIcon(track.status);
            const isAttention = track.status === "overdue" || track.status === "due_soon";
            return (
              <li
                key={track.id}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm",
                  track.status === "healthy"
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
                      track.status === "healthy"
                        ? "text-emerald-600"
                        : track.status === "overdue"
                          ? "text-rose-500"
                          : track.status === "due_soon"
                            ? "text-amber-600"
                            : "text-muted-foreground",
                    )}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{track.label}</span>
                      <Badge
                        variant={statusBadgeVariant(track.status)}
                        className="rounded-full text-[10px] capitalize"
                      >
                        {track.status.replaceAll("_", " ")}
                      </Badge>
                      <Badge variant="outline" className="rounded-full text-[10px] capitalize">
                        {track.frequency.replaceAll("_", " ")}
                      </Badge>
                    </div>
                    <p
                      className={cn(
                        "mt-1 text-xs",
                        isPlatform ? "text-zinc-400" : "text-muted-foreground",
                      )}
                    >
                      {track.detail}
                    </p>
                    {track.lastRunAt ? (
                      <p className={cn("mt-1 text-[10px]", isPlatform ? "text-zinc-500" : "text-muted-foreground/80")}>
                        Last evidence: {new Date(track.lastRunAt).toLocaleString()}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {!isCompact ? (
          <>
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
                <li>{slice.integrityValidateCommand}</li>
                <li>{slice.syncIntegrityBaselineCommand}</li>
                <li>{slice.validateSustainedOpsIntegrityCommand}</li>
                <li>{slice.ciLoopExecutionCommand}</li>
                <li>{slice.productEvolutionExecutionCommand}</li>
                <li>{slice.postSustainedOpsOrchestratorCommand}</li>
                <li>{slice.validateCommand}</li>
                <li>{slice.syncProgressReportCommand}</li>
                <li>{slice.exportReleaseChecklistCommand}</li>
                <li>{slice.validateSustainedOpsCommand}</li>
                <li>npm run smoke:woo-shopify-live</li>
                <li>npm run test:ci:commercial-pilot-runbook:cert</li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={slice.platformOpsHref}>Platform ops loop</Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="rounded-full">
                <Link href={slice.integrationHealthHref}>Integration Health</Link>
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
