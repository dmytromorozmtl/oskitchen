import Link from "next/link";

import {
  ThemeExperimentApplyWinner,
  ThemeExperimentLifecycleActions,
} from "@/components/dashboard/storefront/theme-experiment-admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ga4ExperimentArmDimensionSteps,
  ga4ExperimentCompareHint,
  ga4ExploreExperimentArmUrl,
  ga4WebHomeUrl,
  normalizeGa4MeasurementId,
} from "@/lib/storefront/ga4-analytics-links";
import type { ExperimentProdDecision } from "@/lib/storefront/theme-experiment-decision";

const RECOMMENDATION_VARIANT: Record<
  ExperimentProdDecision["recommendation"],
  "default" | "secondary" | "outline" | "destructive"
> = {
  publish_draft: "default",
  keep_published: "secondary",
  insufficient_data: "outline",
  inconclusive: "outline",
};

export function ThemeExperimentDecisionCard({
  decision,
  days,
  googleAnalyticsId,
  experimentEnabled,
  csvExportHref,
  edgeSyncBlocking,
}: {
  decision: ExperimentProdDecision;
  days: number;
  googleAnalyticsId: string | null;
  experimentEnabled: boolean;
  csvExportHref: string;
  edgeSyncBlocking: boolean;
}) {
  const ga4Id = normalizeGa4MeasurementId(googleAnalyticsId);
  const canApplyWinner =
    experimentEnabled &&
    decision.recommendation === "publish_draft" &&
    !edgeSyncBlocking;
  const ga4Steps = ga4ExperimentArmDimensionSteps(ga4Id);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Production decision ({days}d)</CardTitle>
        <CardDescription>
          Rule of thumb: draft lift ≥ +2 pp, p &lt; 0.05, ≥100 checkouts/arm → publish draft theme (auto-ends
          experiment + clears Edge). Compare first-party CSV with GA4 using the same date range.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={RECOMMENDATION_VARIANT[decision.recommendation]}>
            {decision.recommendation.replace(/_/g, " ")}
          </Badge>
          {decision.significant ? (
            <Badge variant="default">Significant</Badge>
          ) : decision.sampleSizeOk ? (
            <Badge variant="secondary">Not significant</Badge>
          ) : null}
        </div>
        <div>
          <p className="font-medium">{decision.headline}</p>
          <p className="mt-1 text-sm text-muted-foreground">{decision.detail}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Published {decision.publishedRate}% · Draft {decision.draftRate}% checkout → submit (
          {decision.liftPp > 0 ? "+" : ""}
          {decision.liftPp} pp).
        </p>

        <div className="rounded-lg border border-dashed border-border/80 bg-muted/10 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">GA4 compare</p>
          <p className="mt-1">{ga4ExperimentCompareHint(ga4Id)}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-full h-8">
              <a href={csvExportHref}>Download CSV ({days}d)</a>
            </Button>
            {ga4Id ? (
              <>
                <Button asChild variant="outline" size="sm" className="rounded-full h-8">
                  <a href={ga4WebHomeUrl()} target="_blank" rel="noopener noreferrer">
                    Open GA4 ({ga4Id})
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm" className="rounded-full h-8">
                  <a href={ga4ExploreExperimentArmUrl(ga4Id)} target="_blank" rel="noopener noreferrer">
                    GA4 Explore (experimentArm)
                  </a>
                </Button>
              </>
            ) : (
              <Button asChild variant="outline" size="sm" className="rounded-full h-8">
                <Link href="/dashboard/storefront/seo">Add GA4 ID</Link>
              </Button>
            )}
          </div>
          <ol className="mt-3 list-decimal space-y-1 pl-4 text-[11px]">
            {ga4Steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="flex flex-wrap gap-2">
          <ThemeExperimentApplyWinner canApply={canApplyWinner} days={days} />
          {decision.recommendation === "publish_draft" && !canApplyWinner ? (
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link href="/dashboard/storefront/theme">Publish draft manually</Link>
            </Button>
          ) : null}
          <ThemeExperimentLifecycleActions decision={decision} experimentEnabled={experimentEnabled} />
        </div>
      </CardContent>
    </Card>
  );
}
