import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MarketLeaderPositioningUiSlice } from "@/lib/commercial/market-leader-positioning-ui-era21";
import {
  formatMarketLeaderPositioningProgressLabel,
  MARKET_LEADER_POSITIONING_PLATFORM_ANCHOR,
} from "@/lib/commercial/market-leader-positioning-ui-era21";
import { cn } from "@/lib/utils";

type MarketLeaderPositioningPhasesPanelVariant = "dashboard" | "platform" | "compact";

export function MarketLeaderPositioningPhasesPanel(props: {
  slice: MarketLeaderPositioningUiSlice;
  variant?: MarketLeaderPositioningPhasesPanelVariant;
  title?: string;
}) {
  const {
    slice,
    variant = "dashboard",
    title = "Market leader positioning — category + moat + analyst kit",
  } = props;
  const isPlatform = variant === "platform";
  const isCompact = variant === "compact";

  const cardClass = isPlatform
    ? "border-zinc-800 bg-zinc-900/60"
    : "border-rose-200/80 bg-rose-50/20 dark:border-rose-900/50";

  return (
    <Card
      id={isPlatform ? MARKET_LEADER_POSITIONING_PLATFORM_ANCHOR.slice(1) : undefined}
      className={cn("scroll-mt-24 shadow-sm", cardClass)}
      data-testid="market-leader-positioning-phases-panel"
    >
      {!isCompact ? (
        <CardHeader className="pb-2">
          <CardTitle className={cn("text-lg", isPlatform && "text-white")}>{title}</CardTitle>
          <CardDescription className={isPlatform ? "text-zinc-400" : undefined}>
            {formatMarketLeaderPositioningProgressLabel(slice)} — never claim &quot;market leader&quot;
            without third-party validation or published case study approval.
          </CardDescription>
        </CardHeader>
      ) : null}
      <CardContent className={cn("space-y-3", isCompact && "pt-4")}>
        {!isCompact ? (
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="rounded-full font-mono text-[10px]">
              decision: {slice.goDecision}
            </Badge>
            <Badge variant="outline" className="rounded-full text-[10px]">
              Series A complete
            </Badge>
            {slice.customerName ? (
              <Badge variant="secondary" className="rounded-full text-[10px]">
                customer: {slice.customerName}
              </Badge>
            ) : null}
          </div>
        ) : (
          <p className="text-sm font-medium">{formatMarketLeaderPositioningProgressLabel(slice)}</p>
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
                        ? "border-rose-700/60 bg-rose-950/30"
                        : "border-rose-300/80 bg-rose-50/40 dark:border-rose-800/60"
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
                        <span className="ml-2 text-xs font-normal text-rose-700 dark:text-rose-300">
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
                            <Link href={route}>{route.replace(/^\/(platform|dashboard|solutions)\//, "")}</Link>
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
                <li>npm run smoke:pilot-case-study-draft</li>
                <li>npm run smoke:pilot-forbidden-claims-enforcement</li>
                <li>npm run test:ci:commercial-pilot-runbook:cert</li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={slice.platformOpsHref}>Platform pilot ops</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={slice.reportsHref}>Reports</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href={slice.implementationHref}>Implementation</Link>
              </Button>
            </div>
          </>
        ) : (
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.todayHref}>View market leader checklist</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
