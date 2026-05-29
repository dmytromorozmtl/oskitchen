import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Tier2GoldenPathUiSlice } from "@/lib/commercial/tier2-staging-golden-path-ui-era21";
import { formatTier2GoldenPathProgressLabel } from "@/lib/commercial/tier2-staging-golden-path-ui-era21";
import { cn } from "@/lib/utils";

type Tier2GoldenPathPhasesPanelVariant = "dashboard" | "platform" | "compact";

export function Tier2GoldenPathPhasesPanel(props: {
  slice: Tier2GoldenPathUiSlice;
  variant?: Tier2GoldenPathPhasesPanelVariant;
  title?: string;
}) {
  const { slice, variant = "dashboard", title = "Tier 2 golden path — staging execution" } = props;
  const isPlatform = variant === "platform";
  const isCompact = variant === "compact";

  const cardClass = isPlatform
    ? "border-zinc-800 bg-zinc-900/60"
    : "border-blue-200/80 bg-blue-50/20 dark:border-blue-900/50";

  return (
    <Card
      className={cn("shadow-sm", cardClass)}
      data-testid="tier2-golden-path-phases-panel"
    >
      {!isCompact ? (
        <CardHeader className="pb-2">
          <CardTitle className={cn("text-lg", isPlatform && "text-white")}>{title}</CardTitle>
          <CardDescription className={isPlatform ? "text-zinc-400" : undefined}>
            {formatTier2GoldenPathProgressLabel(slice)} — SKIPPED WITH REASON until manual phases
            recorded.
          </CardDescription>
        </CardHeader>
      ) : null}
      <CardContent className={cn("space-y-3", isCompact && "pt-4")}>
        {!isCompact ? (
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="rounded-full font-mono text-[10px]"
            >
              {slice.tier2Milestone.replaceAll("_", " ")}
            </Badge>
            <Badge variant="outline" className="rounded-full font-mono text-[10px]">
              {slice.tier2ProofStatus}
            </Badge>
            {slice.overall ? (
              <Badge variant="secondary" className="rounded-full text-[10px]">
                aggregate: {slice.overall}
              </Badge>
            ) : null}
          </div>
        ) : (
          <p className="text-sm font-medium">{formatTier2GoldenPathProgressLabel(slice)}</p>
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
                        ? "border-blue-700/60 bg-blue-950/30"
                        : "border-blue-300/80 bg-blue-50/40 dark:border-blue-800/60"
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
                        <span className="ml-2 text-xs font-normal text-blue-700 dark:text-blue-300">
                          Next
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{phase.detail}</p>
                    {phase.routes.length > 0 ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Routes: {phase.routes.join(", ")}
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
                <li>{slice.postP0OrchestratorCommand}</li>
                <li>{slice.validateCommand}</li>
                <li>{slice.integrityValidateCommand}</li>
                <li>{slice.syncIntegrityBaselineCommand}</li>
                <li>{slice.validateP0GateCommand}</li>
                <li>{slice.exportTemplateCommand}</li>
                <li>{slice.exportReadinessChecklistCommand}</li>
                <li>{slice.syncProgressReportCommand}</li>
                <li>{slice.orchestratorCommand}</li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={slice.launchWizardHref}>Launch Wizard Tier 2</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={slice.integrationHealthHref}>Integration Health</Link>
              </Button>
            </div>
          </>
        ) : (
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.launchWizardHref}>View Tier 2 checklist</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
