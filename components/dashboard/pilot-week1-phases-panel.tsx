import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PilotWeek1ExecutionUiSlice } from "@/lib/commercial/pilot-week1-execution-ui-era21";
import { formatPilotWeek1ExecutionProgressLabel } from "@/lib/commercial/pilot-week1-execution-ui-era21";
import { cn } from "@/lib/utils";

type PilotWeek1PhasesPanelVariant = "dashboard" | "platform" | "compact";

export function PilotWeek1PhasesPanel(props: {
  slice: PilotWeek1ExecutionUiSlice;
  variant?: PilotWeek1PhasesPanelVariant;
  title?: string;
}) {
  const { slice, variant = "dashboard", title = "Pilot Week 1 — TTV through metrics baseline" } =
    props;
  const isPlatform = variant === "platform";
  const isCompact = variant === "compact";

  const cardClass = isPlatform
    ? "border-zinc-800 bg-zinc-900/60"
    : "border-emerald-200/80 bg-emerald-50/20 dark:border-emerald-900/50";

  return (
    <Card className={cn("shadow-sm", cardClass)} data-testid="pilot-week1-phases-panel">
      {!isCompact ? (
        <CardHeader className="pb-2">
          <CardTitle className={cn("text-lg", isPlatform && "text-white")}>{title}</CardTitle>
          <CardDescription className={isPlatform ? "text-zinc-400" : undefined}>
            {formatPilotWeek1ExecutionProgressLabel(slice)} — record real milestones; never fake
            artifacts.
          </CardDescription>
        </CardHeader>
      ) : null}
      <CardContent className={cn("space-y-3", isCompact && "pt-4")}>
        {!isCompact ? (
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="rounded-full font-mono text-[10px]">
              decision: {slice.goDecision}
            </Badge>
            {slice.customerName ? (
              <Badge variant="secondary" className="rounded-full text-[10px]">
                customer: {slice.customerName}
              </Badge>
            ) : null}
          </div>
        ) : (
          <p className="text-sm font-medium">{formatPilotWeek1ExecutionProgressLabel(slice)}</p>
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
                        ? "border-emerald-700/60 bg-emerald-950/30"
                        : "border-emerald-300/80 bg-emerald-50/40 dark:border-emerald-800/60"
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
                      {isNext ? (
                        <span className="ml-2 text-xs font-normal text-emerald-700 dark:text-emerald-300">
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
                            <Link href={route}>{route.replace("/dashboard/", "")}</Link>
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
                <li>{slice.validateCommand}</li>
                <li>{slice.exportTemplateCommand}</li>
                <li>{slice.syncProgressReportCommand}</li>
                <li>npm run smoke:pilot-metrics-baseline</li>
                <li>npm run smoke:pilot-case-study-draft</li>
                <li>npm run smoke:pilot-gono-go</li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={slice.launchWizardHref}>Launch Wizard</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={slice.integrationHealthHref}>Integration Health</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={slice.reportsHref}>Reports</Link>
              </Button>
            </div>
          </>
        ) : (
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.todayHref}>View Week 1 checklist</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
