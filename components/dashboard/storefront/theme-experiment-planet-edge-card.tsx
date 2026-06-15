import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  isPlanetScaleEdgeEnabled,
  readCrdtSyncBus,
  resolvePlanetEdgeConfigIds,
} from "@/lib/storefront/theme-experiment-edge-planet";

export function ThemeExperimentPlanetEdgeCard({ themeExperimentJson }: { themeExperimentJson: unknown }) {
  const bus = readCrdtSyncBus(themeExperimentJson);
  const shards = resolvePlanetEdgeConfigIds();

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Planet-scale edge</CardTitle>
        <CardDescription>
          {isPlanetScaleEdgeEnabled()
            ? "5+ Edge shards · geo-DNS nearest replica · CRDT sync bus."
            : "Set THEME_EXPERIMENT_EDGE_PLANET=1 + EDGE_CONFIG_ID_REPLICA_*."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="text-muted-foreground">{shards.length} configured shard(s)</p>
        {bus ? (
          <p className="font-mono text-xs">
            CRDT bus ({bus.backend}) · read p99 {bus.readLatencyMsP99}ms · {bus.messages.length} msgs
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
