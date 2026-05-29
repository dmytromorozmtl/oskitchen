import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CommercialGoClosureUiSlice } from "@/lib/commercial/commercial-go-closure-ui-era21";
import { formatCommercialGoClosureProgressLabel } from "@/lib/commercial/commercial-go-closure-ui-era21";
import { cn } from "@/lib/utils";

type CommercialGoClosurePhasesPanelVariant = "dashboard" | "platform" | "compact";

export function CommercialGoClosurePhasesPanel(props: {
  slice: CommercialGoClosureUiSlice;
  variant?: CommercialGoClosurePhasesPanelVariant;
  title?: string;
}) {
  const { slice, variant = "dashboard", title = "Commercial GO closure — ICP + LOI + GO" } = props;
  const isPlatform = variant === "platform";
  const isCompact = variant === "compact";

  const cardClass = isPlatform
    ? "border-zinc-800 bg-zinc-900/60"
    : "border-violet-200/80 bg-violet-50/20 dark:border-violet-900/50";

  return (
    <Card
      className={cn("shadow-sm", cardClass)}
      data-testid="commercial-go-closure-phases-panel"
    >
      {!isCompact ? (
        <CardHeader className="pb-2">
          <CardTitle className={cn("text-lg", isPlatform && "text-white")}>{title}</CardTitle>
          <CardDescription className={isPlatform ? "text-zinc-400" : undefined}>
            {formatCommercialGoClosureProgressLabel(slice)} — NO-GO until real ICP + LOI + GO artifact.
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
              {slice.goClosureMilestone.replaceAll("_", " ")}
            </Badge>
            <Badge variant="outline" className="rounded-full font-mono text-[10px]">
              decision: {slice.decision ?? "unknown"}
            </Badge>
            {slice.customerExecutionStatus ? (
              <Badge variant="secondary" className="rounded-full text-[10px]">
                customer: {slice.customerExecutionStatus}
              </Badge>
            ) : null}
            {slice.goIntegrityFailed ? (
              <Badge variant="destructive" className="rounded-full text-[10px]">
                GO integrity FAIL
              </Badge>
            ) : null}
          </div>
        ) : (
          <p className="text-sm font-medium">{formatCommercialGoClosureProgressLabel(slice)}</p>
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
                        ? "border-violet-700/60 bg-violet-950/30"
                        : "border-violet-300/80 bg-violet-50/40 dark:border-violet-800/60"
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
                        <span className="ml-2 text-xs font-normal text-violet-700 dark:text-violet-300">
                          Next
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{phase.detail}</p>
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
                <li>{slice.postTier2OrchestratorCommand}</li>
                <li>{slice.validateCommand}</li>
                <li>{slice.validateTier2GateCommand}</li>
                <li>{slice.validateTier2IntegrityCommand}</li>
                <li>{slice.integrityValidateCommand}</li>
                <li>{slice.syncIntegrityBaselineCommand}</li>
                <li>{slice.exportTemplateCommand}</li>
                <li>{slice.exportReadinessChecklistCommand}</li>
                <li>{slice.syncProgressReportCommand}</li>
                <li>{slice.forbiddenClaimsCommand}</li>
                <li>{slice.orchestratorCommand}</li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={slice.implementationHref}>Implementation ICP</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={slice.launchWizardHref}>Launch Wizard blockers</Link>
              </Button>
            </div>
          </>
        ) : (
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.launchWizardHref}>View commercial GO checklist</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
