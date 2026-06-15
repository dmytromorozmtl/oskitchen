import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateIntergalacticMeshFederationGate,
  isIntergalacticMeshFederationEnabled,
  readIntergalacticMeshFederation,
} from "@/lib/storefront/theme-experiment-intergalactic-mesh-federation";

export function ThemeExperimentIntergalacticMeshCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const ig = readIntergalacticMeshFederation(themeExperimentJson);
  const gate = evaluateIntergalacticMeshFederationGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Intergalactic mesh federation</CardTitle>
        <CardDescription>
          Laniakea supercluster CRDT merge with wormhole latency SLO (Z5 + V5).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p
          className={
            isIntergalacticMeshFederationEnabled() ? "text-emerald-700" : "text-muted-foreground"
          }
        >
          {isIntergalacticMeshFederationEnabled()
            ? "Intergalactic mesh federation enabled"
            : "Set THEME_EXPERIMENT_INTERGALACTIC_MESH_FEDERATION=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {ig ? (
          <p className="font-mono text-xs">
            {ig.superclusterQuorum} clusters · wormhole max {ig.maxWormholeLatencyMs}ms · SLO{" "}
            {ig.wormholeSloMet ? "met" : "breach"}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">
          Cron: /api/cron/intergalactic-mesh-federation-sync · x-kos-intergalactic-mesh
        </p>
      </CardContent>
    </Card>
  );
}
