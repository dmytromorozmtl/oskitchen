import Link from "next/link";

import { PaidPilotGoConvergenceEra25Strip } from "@/components/dashboard/launch-wizard/paid-pilot-go-convergence-era25-strip";
import { PilotWeek1ExecutionConvergenceEra25Strip } from "@/components/dashboard/launch-wizard/pilot-week1-execution-convergence-era25-strip";
import { Month2MarketReadinessConvergenceEra25Strip } from "@/components/dashboard/launch-wizard/month2-market-readiness-convergence-era25-strip";
import { ScaleReadinessConvergenceEra25Strip } from "@/components/dashboard/launch-wizard/scale-readiness-convergence-era25-strip";
import { SeriesAPartnerExpansionConvergenceEra25Strip } from "@/components/dashboard/launch-wizard/series-a-partner-expansion-convergence-era25-strip";
import { MarketLeaderPositioningConvergenceEra25Strip } from "@/components/dashboard/launch-wizard/market-leader-positioning-convergence-era25-strip";
import { SustainedOperationalExcellenceConvergenceEra25Strip } from "@/components/dashboard/launch-wizard/sustained-operational-excellence-convergence-era25-strip";
import { PureOperationalModeTerminusEra25Strip } from "@/components/dashboard/launch-wizard/pure-operational-mode-terminus-era25-strip";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatOwnerDailyBriefingBreakthroughEra25Label,
  type OwnerDailyBriefingBreakthroughEra25UiSlice,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-ui-era25";
import { cn } from "@/lib/utils";

function tileToneClass(tone: OwnerDailyBriefingBreakthroughEra25UiSlice["briefingTiles"][number]["tone"]) {
  if (tone === "attention") {
    return "border-amber-200/70 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/15";
  }
  if (tone === "success") {
    return "border-emerald-200/60 bg-emerald-50/20 dark:border-emerald-900/30 dark:bg-emerald-950/10";
  }
  return "border-border/70 bg-background/80";
}

export function OwnerDailyBriefingBreakthroughEra25Panel(props: {
  slice: OwnerDailyBriefingBreakthroughEra25UiSlice;
}) {
  const { slice } = props;
  const pureOperationalModeTerminus =
    slice.paidPilotGoConvergence?.pilotWeek1ExecutionConvergence?.month2MarketReadinessConvergence
      ?.scaleReadinessConvergence?.seriesAPartnerExpansionConvergence?.marketLeaderPositioningConvergence
      ?.sustainedOperationalExcellenceConvergence?.pureOperationalModeTerminus ?? null;
  const pureOperationalModeEra25Active =
    pureOperationalModeTerminus?.pureOperationalModeEra25Active ?? false;

  return (
    <Card
      id="era25-owner-daily-briefing-breakthrough"
      className="scroll-mt-24 border-fuchsia-200/60 shadow-sm dark:border-fuchsia-900/40"
      data-testid="owner-daily-briefing-breakthrough-era25-panel"
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-lg">Owner Daily Briefing Breakthrough</CardTitle>
          <Badge variant="outline" className="rounded-full font-mono text-[10px]">
            era25 · B0–B4
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "rounded-full text-[10px]",
              slice.sliceBlocked ? "text-amber-700" : "text-emerald-700",
            )}
          >
            {slice.sliceBlocked ? "BLOCKED" : "READY"}
          </Badge>
        </div>
        <CardDescription>{formatOwnerDailyBriefingBreakthroughEra25Label(slice)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {slice.briefingTiles.map((tile) => (
            <Link
              key={tile.schemeId}
              href={tile.href}
              className={cn(
                "block rounded-lg border p-3 transition-colors hover:bg-muted/40",
                tileToneClass(tile.tone),
              )}
              data-testid={`breakthrough-era25-tile-${tile.schemeId}`}
            >
              <p className="font-mono text-[10px] uppercase text-muted-foreground">{tile.schemeId}</p>
              <p className="mt-1 text-sm font-medium">{tile.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{tile.headline}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {tile.wired ? "wired" : "gap"} · {tile.detail}
              </p>
            </Link>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          P0 proof: <span className="font-mono">{slice.p0ProofStatus}</span> · Blueprint:{" "}
          <span className="font-mono">
            {slice.era25FirstProductSliceBlueprintMilestone.replaceAll("_", " ")}
          </span>
        </p>
        {pureOperationalModeEra25Active && pureOperationalModeTerminus ? (
          <PureOperationalModeTerminusEra25Strip slice={pureOperationalModeTerminus} />
        ) : null}
        {!pureOperationalModeEra25Active && slice.paidPilotGoConvergence ? (
          <PaidPilotGoConvergenceEra25Strip slice={slice.paidPilotGoConvergence} />
        ) : null}
        {!pureOperationalModeEra25Active && slice.paidPilotGoConvergence?.pilotWeek1ExecutionConvergence ? (
          <PilotWeek1ExecutionConvergenceEra25Strip
            slice={slice.paidPilotGoConvergence.pilotWeek1ExecutionConvergence}
          />
        ) : null}
        {!pureOperationalModeEra25Active &&
        slice.paidPilotGoConvergence?.pilotWeek1ExecutionConvergence
          ?.month2MarketReadinessConvergence ? (
          <Month2MarketReadinessConvergenceEra25Strip
            slice={
              slice.paidPilotGoConvergence.pilotWeek1ExecutionConvergence
                .month2MarketReadinessConvergence
            }
          />
        ) : null}
        {!pureOperationalModeEra25Active &&
        slice.paidPilotGoConvergence?.pilotWeek1ExecutionConvergence
          ?.month2MarketReadinessConvergence?.scaleReadinessConvergence ? (
          <ScaleReadinessConvergenceEra25Strip
            slice={
              slice.paidPilotGoConvergence.pilotWeek1ExecutionConvergence
                .month2MarketReadinessConvergence.scaleReadinessConvergence
            }
          />
        ) : null}
        {!pureOperationalModeEra25Active &&
        slice.paidPilotGoConvergence?.pilotWeek1ExecutionConvergence
          ?.month2MarketReadinessConvergence?.scaleReadinessConvergence
          ?.seriesAPartnerExpansionConvergence ? (
          <SeriesAPartnerExpansionConvergenceEra25Strip
            slice={
              slice.paidPilotGoConvergence.pilotWeek1ExecutionConvergence
                .month2MarketReadinessConvergence.scaleReadinessConvergence
                .seriesAPartnerExpansionConvergence
            }
          />
        ) : null}
        {!pureOperationalModeEra25Active &&
        slice.paidPilotGoConvergence?.pilotWeek1ExecutionConvergence
          ?.month2MarketReadinessConvergence?.scaleReadinessConvergence
          ?.seriesAPartnerExpansionConvergence?.marketLeaderPositioningConvergence ? (
          <MarketLeaderPositioningConvergenceEra25Strip
            slice={
              slice.paidPilotGoConvergence.pilotWeek1ExecutionConvergence
                .month2MarketReadinessConvergence.scaleReadinessConvergence
                .seriesAPartnerExpansionConvergence.marketLeaderPositioningConvergence
            }
          />
        ) : null}
        {!pureOperationalModeEra25Active &&
        slice.paidPilotGoConvergence?.pilotWeek1ExecutionConvergence
          ?.month2MarketReadinessConvergence?.scaleReadinessConvergence
          ?.seriesAPartnerExpansionConvergence?.marketLeaderPositioningConvergence
          ?.sustainedOperationalExcellenceConvergence ? (
          <SustainedOperationalExcellenceConvergenceEra25Strip
            slice={
              slice.paidPilotGoConvergence.pilotWeek1ExecutionConvergence
                .month2MarketReadinessConvergence.scaleReadinessConvergence
                .seriesAPartnerExpansionConvergence.marketLeaderPositioningConvergence
                .sustainedOperationalExcellenceConvergence
            }
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
