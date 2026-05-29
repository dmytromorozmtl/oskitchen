import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SustainedOperationalExcellenceUiSlice } from "@/lib/commercial/sustained-operational-excellence-ui-era21";
import {
  formatSustainedOperationalExcellenceProgressLabel,
  SUSTAINED_OPERATIONAL_EXCELLENCE_PLATFORM_ANCHOR,
} from "@/lib/commercial/sustained-operational-excellence-ui-era21";
import { cn } from "@/lib/utils";

type SustainedOperationalExcellencePhasesPanelVariant = "dashboard" | "platform" | "compact";

export function SustainedOperationalExcellencePhasesPanel(props: {
  slice: SustainedOperationalExcellenceUiSlice;
  variant?: SustainedOperationalExcellencePhasesPanelVariant;
  title?: string;
}) {
  const {
    slice,
    variant = "dashboard",
    title = "Sustained operational excellence — recurring ops cadence",
  } = props;
  const isPlatform = variant === "platform";
  const isCompact = variant === "compact";

  const cardClass = isPlatform
    ? "border-zinc-800 bg-zinc-900/60"
    : "border-teal-200/80 bg-teal-50/20 dark:border-teal-900/50";

  return (
    <Card
      id={isPlatform ? SUSTAINED_OPERATIONAL_EXCELLENCE_PLATFORM_ANCHOR.slice(1) : undefined}
      className={cn("scroll-mt-24 shadow-sm", cardClass)}
      data-testid="sustained-operational-excellence-phases-panel"
    >
      {!isCompact ? (
        <CardHeader className="pb-2">
          <CardTitle className={cn("text-lg", isPlatform && "text-white")}>{title}</CardTitle>
          <CardDescription className={isPlatform ? "text-zinc-400" : undefined}>
            {formatSustainedOperationalExcellenceProgressLabel(slice)} — final era21 ops cadence;
            after complete, only operational tiles remain on Today.
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
              {slice.sustainedOpsMilestone.replaceAll("_", " ")}
            </Badge>
            <Badge variant="outline" className="rounded-full text-[10px]">
              Market leader complete
            </Badge>
            {slice.customerName ? (
              <Badge variant="secondary" className="rounded-full text-[10px]">
                customer: {slice.customerName}
              </Badge>
            ) : null}
          </div>
        ) : (
          <p className="text-sm font-medium">
            {formatSustainedOperationalExcellenceProgressLabel(slice)}
          </p>
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
                        ? "border-teal-700/60 bg-teal-950/30"
                        : "border-teal-300/80 bg-teal-50/40 dark:border-teal-800/60"
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
                        <span className="ml-2 text-xs font-normal text-teal-700 dark:text-teal-300">
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
                <li>{slice.postMarketLeaderOrchestratorCommand}</li>
                <li>{slice.validateCommand}</li>
                <li>{slice.exportReadinessChecklistCommand}</li>
                <li>{slice.exportTemplateCommand}</li>
                <li>{slice.syncProgressReportCommand}</li>
                <li>{slice.validateMarketLeaderCommand}</li>
                <li>npm run smoke:woo-shopify-live</li>
                <li>npm run smoke:pilot-metrics-baseline</li>
                <li>npm run smoke:pilot-forbidden-claims-enforcement</li>
                <li>npm run test:ci:commercial-pilot-runbook:cert</li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={slice.orderHubHref}>Order Hub</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={slice.integrationHealthHref}>Integration Health</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={slice.productionCalendarHref}>Production calendar</Link>
              </Button>
            </div>
          </>
        ) : (
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.todayHref}>View sustained ops checklist</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
