import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { P0OpsVaultUiSlice } from "@/lib/commercial/p0-ops-vault-ui-era21";
import { formatP0OpsVaultProgressLabel } from "@/lib/commercial/p0-ops-vault-ui-era21";
import { cn } from "@/lib/utils";

type P0OpsVaultPhasesPanelVariant = "dashboard" | "platform" | "compact";

export function P0OpsVaultPhasesPanel(props: {
  slice: P0OpsVaultUiSlice;
  variant?: P0OpsVaultPhasesPanelVariant;
  title?: string;
}) {
  const { slice, variant = "dashboard", title = "P0 ops vault — configure credentials" } = props;
  const isPlatform = variant === "platform";
  const isCompact = variant === "compact";

  const cardClass = isPlatform
    ? "border-zinc-800 bg-zinc-900/60"
    : "border-amber-200/80 bg-amber-50/20 dark:border-amber-900/50";

  const titleClass = isPlatform ? "text-white" : undefined;
  const descClass = isPlatform ? "text-zinc-400" : "text-amber-900/80 dark:text-amber-200/80";

  return (
    <Card className={cn("shadow-sm", cardClass)} data-testid="p0-ops-vault-phases-panel">
      {!isCompact ? (
        <CardHeader className="pb-2">
          <CardTitle className={cn("text-lg", titleClass)}>{title}</CardTitle>
          <CardDescription className={descClass}>
            {formatP0OpsVaultProgressLabel(slice)} — SKIPPED WITH REASON until vars are configured.
          </CardDescription>
        </CardHeader>
      ) : null}
      <CardContent className={cn("space-y-3", isCompact && "pt-4")}>
        {!isCompact ? (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full font-mono text-[10px]">
              {slice.p0ProofStatus}
            </Badge>
            <Badge
              variant={slice.day0PartialComplete ? "secondary" : "outline"}
              className="rounded-full font-mono text-[10px]"
            >
              {slice.day0Milestone}
            </Badge>
            {slice.overall ? (
              <Badge variant="secondary" className="rounded-full text-[10px]">
                aggregate: {slice.overall}
              </Badge>
            ) : null}
          </div>
        ) : (
          <p className="text-sm font-medium">{formatP0OpsVaultProgressLabel(slice)}</p>
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
                      ? "border-amber-700/60 bg-amber-950/30"
                      : "border-amber-300/80 bg-amber-50/40 dark:border-amber-800/60"
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
                      <span className="ml-2 text-xs font-normal text-amber-700 dark:text-amber-300">
                        Next
                      </span>
                    ) : null}
                  </p>
                  {phase.missingKeys.length > 0 ? (
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      Missing: {phase.missingKeys.join(", ")}
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
                <li>{slice.day0OrchestratorCommand}</li>
                <li>{slice.validateCommand}</li>
                <li>{slice.exportTemplateCommand}</li>
                <li>{slice.stagingHealthCheckCommand}</li>
                <li>{slice.githubSecretsChecklistCommand}</li>
                <li>{slice.syncProgressReportCommand}</li>
                <li>{slice.exportDay0ReadinessChecklistCommand}</li>
                <li>{slice.vaultReadinessCommand}</li>
                <li>{slice.orchestratorCommand}</li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={slice.launchWizardHref}>Launch Wizard</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={slice.integrationHealthHref}>Integration Health P0</Link>
              </Button>
            </div>
          </>
        ) : (
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.integrationHealthHref}>View ops vault checklist</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
