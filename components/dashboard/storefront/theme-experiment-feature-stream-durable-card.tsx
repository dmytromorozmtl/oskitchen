import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  isDurableFeatureStreamEnabled,
  readFeatureStreamDurableLog,
} from "@/lib/storefront/theme-experiment-feature-stream-durable";

export function ThemeExperimentFeatureStreamDurableCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const log = readFeatureStreamDurableLog(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Flink exactly-once stream</CardTitle>
        <CardDescription>
          {isDurableFeatureStreamEnabled()
            ? "Durable log + eventId dedupe (24h). SLO: ingest lag p99 < 2s."
            : "Set THEME_EXPERIMENT_FEATURE_STREAM_DURABLE=1."}
        </CardDescription>
      </CardHeader>
      {log ? (
        <CardContent className="space-y-2 text-sm">
          <p className={log.slo.sloMet ? "text-emerald-700" : "text-amber-700"}>
            Ingest lag p99: {log.slo.ingestLagMsP99}ms (target {log.slo.targetLagMsP99}ms)
          </p>
          <p className="text-muted-foreground">
            {log.entries.length} events · {log.slo.dedupeHits} dedupe hits · DLQ {log.slo.dlqCount}
          </p>
        </CardContent>
      ) : null}
    </Card>
  );
}
