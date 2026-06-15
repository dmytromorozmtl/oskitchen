import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  isFeatureStreamBusEnabled,
  readFeatureStreamBuffer,
  realtimeExplorationCapPercent,
  realtimeRegretCircuitBreakerPp,
} from "@/lib/storefront/theme-experiment-feature-stream-bus";

export function ThemeExperimentFeatureStreamCard({ themeExperimentJson }: { themeExperimentJson: unknown }) {
  const buf = readFeatureStreamBuffer(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Feature stream (LinUCB SLO)</CardTitle>
        <CardDescription>
          {isFeatureStreamBusEnabled()
            ? `experiment.feature.v1 · circuit breaker regret > ${realtimeRegretCircuitBreakerPp()}pp · cap ${realtimeExplorationCapPercent()}%`
            : "Set THEME_EXPERIMENT_FEATURE_STREAM_BUS=1."}
        </CardDescription>
      </CardHeader>
      {buf ? (
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            Buffer: {buf.events.length} events · regret {buf.regretPp}pp
            {buf.explorationCapped ? " · exploration CAPPED" : ""}
          </p>
          <p className="font-mono text-xs">Updated {new Date(buf.at).toLocaleString()}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}
