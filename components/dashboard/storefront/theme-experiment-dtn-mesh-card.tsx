import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DTN_NODES,
  dtnMaxLatencyMs,
  evaluateDtnMeshPublishGate,
  isDtnMeshEnabled,
  readDtnMesh,
} from "@/lib/storefront/theme-experiment-dtn-mesh";

export function ThemeExperimentDtnMeshCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const dtn = readDtnMesh(themeExperimentJson);
  const gate = evaluateDtnMeshPublishGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">DTN interplanetary mesh</CardTitle>
        <CardDescription>
          Delay-tolerant bundles ({DTN_NODES.join(" → ")}) merged into global CRDT mesh.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isDtnMeshEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isDtnMeshEnabled() ? "DTN mesh enabled" : "Set THEME_EXPERIMENT_DTN_MESH=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {dtn ? (
          <p className="font-mono text-xs">
            {dtn.bundles.length} bundles · delivery {Math.round(dtn.deliveryRate * 100)}% · max{" "}
            {dtn.maxLatencyMs}ms (threshold {dtnMaxLatencyMs()}ms)
          </p>
        ) : null}
        <p className="font-mono text-[10px]">
          Webhook: POST /api/webhooks/experiment-dtn-bundle · cron: dtn-mesh-sync
        </p>
      </CardContent>
    </Card>
  );
}
