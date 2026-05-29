import Link from "next/link";
import { Scale, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatCommercialInflectionMilestoneLabel,
  formatCommercialInflectionScorecardLabel,
  type CommercialInflectionReadinessUiSlice,
} from "@/lib/commercial/commercial-inflection-readiness-ui-era28";

export function CommercialInflectionTodayStrip(props: {
  slice: CommercialInflectionReadinessUiSlice;
}) {
  const { slice } = props;

  return (
    <Card
      className="scroll-mt-24 border-violet-200/80 bg-violet-50/20 shadow-sm dark:border-violet-900/50"
      data-testid="commercial-inflection-today-strip"
      id="today-commercial-inflection"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-violet-950 dark:text-violet-100">
          <TrendingUp className="h-5 w-5 shrink-0" aria-hidden />
          Commercial inflection — market readiness
        </CardTitle>
        <CardDescription>
          Governance {slice.governanceScore}/100 is orchestration only — pilot executable score is
          honest market readiness.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-full font-mono text-[10px]">
            {formatCommercialInflectionMilestoneLabel(slice.milestone)}
          </Badge>
          <Badge variant="secondary" className="rounded-full text-[10px] tabular-nums">
            {formatCommercialInflectionScorecardLabel(slice)}
          </Badge>
          {slice.p0VaultMissingCount > 0 ? (
            <Badge variant="destructive" className="rounded-full text-[10px] tabular-nums">
              vault {slice.p0VaultMissingCount}/11 missing
            </Badge>
          ) : null}
          <Badge variant="outline" className="rounded-full text-[10px]">
            P0 proof: {slice.p0ProofStatus.replaceAll("_", " ")}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          <Scale className="mr-1 inline h-3.5 w-3.5" aria-hidden />
          Registry LIVE: integrations {slice.integrationRegistryLiveCount} · channels{" "}
          {slice.channelRegistryLiveCount}. Top blocker: <strong>{slice.topBlockerTitle}</strong> —{" "}
          {slice.topBlockerDetail}
        </p>
        {slice.stopRuleCount > 0 ? (
          <p className="text-xs text-amber-800 dark:text-amber-200">
            {slice.stopRuleCount} STOP rule(s) active — SKIPPED is not PASS in artifacts.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.platformOpsHref}>
              {slice.milestone === "p0_ops_vault_blocked" &&
              slice.platformOpsHref.includes("p0-staging-proof")
                ? "P0 staging proof ops"
                : "Inflection matrix"}
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.integrationHealthHref}>Integration health</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
