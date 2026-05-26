import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { EdgeSyncSloSnapshot } from "@/services/storefront/storefront-edge-sync-slo-service";

export function ThemeExperimentEdgeSloCard({ slo }: { slo: EdgeSyncSloSnapshot }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Edge sync SLO</CardTitle>
        <CardDescription>
          p95 job duration target &lt; {slo.sloTargetMs / 1000}s ({slo.windowDays}d succeeded jobs)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3 text-sm">
        <Badge variant={slo.sloMet ? "default" : "destructive"}>
          {slo.sloMet ? "SLO met" : "SLO breach"}
        </Badge>
        {slo.p95Ms !== null ? (
          <span className="font-mono text-xs text-muted-foreground">
            p95 {Math.round(slo.p95Ms / 1000)}s · n={slo.sampleCount}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">No succeeded jobs in window</span>
        )}
      </CardContent>
    </Card>
  );
}
