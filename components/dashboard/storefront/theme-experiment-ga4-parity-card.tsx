import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Ga4ParityChecklist } from "@/lib/storefront/ga4-parity";
import type { Ga4ParityHistoryPoint } from "@/lib/storefront/ga4-parity-json";
import type { Ga4ParityScore } from "@/lib/storefront/ga4-parity-score";
import { ThemeExperimentGa4ParitySparkline } from "@/components/dashboard/storefront/theme-experiment-ga4-parity-sparkline";

const STATUS_VARIANT: Record<
  Ga4ParityScore["status"],
  "default" | "secondary" | "outline" | "destructive"
> = {
  ok: "default",
  drift: "destructive",
  unavailable: "outline",
  not_configured: "secondary",
};

export function ThemeExperimentGa4ParityCard({
  parity,
  score,
  history = [],
}: {
  parity: Ga4ParityChecklist;
  score: Ga4ParityScore;
  history?: Ga4ParityHistoryPoint[];
}) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">GA4 parity ({parity.days}d)</CardTitle>
        <CardDescription>
          Auto score from GA4 Data API vs first-party decision engine (target Δ ≤ 3 pp on lift).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={STATUS_VARIANT[score.status]}>{score.status}</Badge>
          {score.parityScorePp !== null ? (
            <span className="font-mono text-xs text-muted-foreground">Δ {score.parityScorePp} pp</span>
          ) : null}
          {score.dataSource ? (
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              source: {score.dataSource}
            </span>
          ) : null}
          {score.cachedAt ? (
            <span className="text-xs text-muted-foreground">GA4 fetched {score.cachedAt}</span>
          ) : null}
        </div>
        <p className="font-medium">{score.headline}</p>
        <p className="text-muted-foreground">{score.detail}</p>
        <ThemeExperimentGa4ParitySparkline history={history} days={30} />
        {score.ga4 ? (
          <p className="font-mono text-[11px] text-muted-foreground">
            GA4 checkout events — published {score.ga4.publishedCheckoutEvents} (
            {score.ga4.publishedCheckoutRatePercent}%) · draft {score.ga4.draftCheckoutEvents} (
            {score.ga4.draftCheckoutRatePercent}%) · lift {score.ga4LiftPp ?? "—"} pp vs KitchenOS{" "}
            {score.firstPartyLiftPp} pp
          </p>
        ) : null}
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          {parity.parityNotes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
        <div>
          <p className="font-medium">Manual checklist</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
            {parity.ga4Steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
