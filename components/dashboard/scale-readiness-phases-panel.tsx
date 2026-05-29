import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScaleReadinessUiSlice } from "@/lib/commercial/scale-readiness-ui-era21";
import {
  formatScaleReadinessProgressLabel,
  SCALE_READINESS_PLATFORM_ANCHOR,
} from "@/lib/commercial/scale-readiness-ui-era21";
import { cn } from "@/lib/utils";

type ScaleReadinessPhasesPanelVariant = "dashboard" | "platform" | "compact";

export function ScaleReadinessPhasesPanel(props: {
  slice: ScaleReadinessUiSlice;
  variant?: ScaleReadinessPhasesPanelVariant;
  title?: string;
}) {
  const {
    slice,
    variant = "dashboard",
    title = "Scale readiness — enterprise expansion gates",
  } = props;
  const isPlatform = variant === "platform";
  const isCompact = variant === "compact";

  const cardClass = isPlatform
    ? "border-zinc-800 bg-zinc-900/60"
    : "border-indigo-200/80 bg-indigo-50/20 dark:border-indigo-900/50";

  return (
    <Card
      id={isPlatform ? SCALE_READINESS_PLATFORM_ANCHOR.slice(1) : undefined}
      className={cn("scroll-mt-24 shadow-sm", cardClass)}
      data-testid="scale-readiness-phases-panel"
    >
      {!isCompact ? (
        <CardHeader className="pb-2">
          <CardTitle className={cn("text-lg", isPlatform && "text-white")}>{title}</CardTitle>
          <CardDescription className={isPlatform ? "text-zinc-400" : undefined}>
            {formatScaleReadinessProgressLabel(slice)} — separate GO per customer; never claim SOC2
            until audit complete.
          </CardDescription>
        </CardHeader>
      ) : null}
      <CardContent className={cn("space-y-3", isCompact && "pt-4")}>
        {!isCompact ? (
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="rounded-full font-mono text-[10px]">
              decision: {slice.goDecision}
            </Badge>
            <Badge variant="outline" className="rounded-full font-mono text-[10px]">
              {slice.scaleMilestone.replaceAll("_", " ")}
            </Badge>
            <Badge variant="outline" className="rounded-full text-[10px]">
              Month 2 {slice.month2Complete ? "complete" : "blocked"}
            </Badge>
            {!slice.month2IntegrityPassed ? (
              <Badge variant="destructive" className="rounded-full text-[10px]">
                Month 2 integrity FAIL
              </Badge>
            ) : null}
            {!slice.scaleIntegrityPassed ? (
              <Badge variant="destructive" className="rounded-full text-[10px]">
                Scale integrity FAIL
              </Badge>
            ) : null}
            {slice.customerName ? (
              <Badge variant="secondary" className="rounded-full text-[10px]">
                customer: {slice.customerName}
              </Badge>
            ) : null}
          </div>
        ) : (
          <p className="text-sm font-medium">{formatScaleReadinessProgressLabel(slice)}</p>
        )}

        <ul className="space-y-2">
          {slice.phases.map((phase) => {
            const isNext = slice.nextPhase?.id === phase.id;
            return (
              <li
                key={phase.id}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm",
                  phase.complete
                    ? "border-emerald-200/60 bg-emerald-50/10"
                    : isNext
                      ? isPlatform
                        ? "border-indigo-700/60 bg-indigo-950/30"
                        : "border-indigo-300/80 bg-indigo-50/40 dark:border-indigo-800/60"
                      : isPlatform
                        ? "border-zinc-800 bg-zinc-950/40"
                        : "border-border/70 bg-muted/20",
                )}
              >
                <div className="flex items-start gap-2">
                  {phase.complete ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={cn("font-medium", isPlatform && "text-zinc-200")}>
                      {phase.label}
                      {phase.optional ? (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          Optional
                        </span>
                      ) : null}
                      {isNext ? (
                        <span className="ml-2 text-xs font-normal text-indigo-700 dark:text-indigo-300">
                          Next
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{phase.detail}</p>
                    {phase.routes.length > 0 && !phase.complete ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {phase.routes.map((route) => (
                          <Button
                            key={route}
                            asChild
                            size="sm"
                            variant="ghost"
                            className="h-7 rounded-full px-2 text-xs"
                          >
                            <Link href={route}>{route.replace(/^\/(platform|dashboard)\//, "")}</Link>
                          </Button>
                        ))}
                      </div>
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
                <li>{slice.scaleExpansionExecutionCommand}</li>
                <li>{slice.integrityValidateCommand}</li>
                <li>{slice.syncIntegrityBaselineCommand}</li>
                <li>{slice.validateMonth2IntegrityCommand}</li>
                <li>{slice.postMonth2OrchestratorCommand}</li>
                <li>{slice.validateCommand}</li>
                <li>{slice.exportReadinessChecklistCommand}</li>
                <li>{slice.exportTemplateCommand}</li>
                <li>{slice.syncProgressReportCommand}</li>
                <li>{slice.validateMonth2Command}</li>
                <li>npm run smoke:pilot-rollback-drill</li>
                <li>npm run smoke:commerce-webhook-drill</li>
                <li>npm run smoke:pilot-gono-go</li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={slice.platformOpsHref}>Platform pilot ops</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={slice.launchWizardHref}>Launch Wizard</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={slice.implementationHref}>Implementation</Link>
              </Button>
            </div>
          </>
        ) : (
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.todayHref}>View scale readiness checklist</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
