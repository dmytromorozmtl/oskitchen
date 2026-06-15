import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  experimentLiftPercentPoints,
  twoProportionSignificance,
} from "@/lib/storefront/theme-experiment-significance";
import type { ExperimentArmMetrics } from "@/services/storefront/theme-experiment-analytics-service";

export function ThemeExperimentLiftCard({ rows, days }: { rows: ExperimentArmMetrics[]; days: number }) {
  const published = rows.find((r) => r.arm === "published");
  const draft = rows.find((r) => r.arm === "draft");
  if (!published || !draft) return null;

  const lift = experimentLiftPercentPoints(
    published.conversionRatePercent,
    draft.conversionRatePercent,
  );
  const sig = twoProportionSignificance({
    published: { successes: published.conversions, trials: published.checkouts },
    draft: { successes: draft.conversions, trials: draft.checkouts },
    minPerArm: 100,
  });

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Draft lift ({days}d)</CardTitle>
        <CardDescription>
          Checkout submit rate: draft minus published (percentage points). Significance uses a
          two-proportion z-test when each arm has ≥100 checkouts started.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <p className="text-3xl font-semibold tabular-nums">
          {lift > 0 ? "+" : ""}
          {lift} pp
        </p>
        {sig.sampleSizeOk ? (
          sig.significant ? (
            <Badge variant="default">Significant (p &lt; 0.05)</Badge>
          ) : (
            <Badge variant="secondary">Not significant</Badge>
          )
        ) : (
          <Badge variant="outline">Need ≥100 checkouts / arm</Badge>
        )}
        <p className="w-full text-xs text-muted-foreground">
          Published {published.conversionRatePercent}% · Draft {draft.conversionRatePercent}% (checkout
          → submit).
        </p>
      </CardContent>
    </Card>
  );
}
