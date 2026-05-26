import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExperimentSrmCheck } from "@/lib/storefront/theme-experiment-srm";

export function ThemeExperimentSrmCard({ srm, days }: { srm: ExperimentSrmCheck; days: number }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Traffic sanity ({days}d)</CardTitle>
        <CardDescription>
          Sample ratio check: draft exposure % vs configured traffic split (warn if &gt;5 pp drift, n≥500).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {srm.warn ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm">
            <p className="font-medium text-destructive">{srm.headline}</p>
            <p className="mt-1 text-muted-foreground">{srm.detail}</p>
          </div>
        ) : (
          <p className="text-sm">
            <span className="font-medium">{srm.headline}</span>
            <span className="mt-1 block text-muted-foreground">{srm.detail}</span>
          </p>
        )}
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">
          n={srm.totalExposures} · configured draft {srm.configuredDraftPercent}% · observed{" "}
          {srm.observedDraftPercent}% · Δ{srm.deltaPp > 0 ? "+" : ""}
          {srm.deltaPp} pp · χ²={srm.chiSquare}
        </p>
      </CardContent>
    </Card>
  );
}
