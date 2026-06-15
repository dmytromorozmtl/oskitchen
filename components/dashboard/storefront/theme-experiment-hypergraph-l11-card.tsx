import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateHypergraphL11TopologicalFaultTolerantAnchorGate,
  hypergraphL11ChainId,
  isHypergraphL11TopologicalFaultTolerantAnchorEnabled,
  readHypergraphL11TopologicalFaultTolerant,
} from "@/lib/compliance/hypergraph-l11-topological-fault-tolerant-anchor";

export function ThemeExperimentHypergraphL11Card({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readHypergraphL11TopologicalFaultTolerant(themeExperimentJson);
  const gate = evaluateHypergraphL11TopologicalFaultTolerantAnchorGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Hypergraph L11 topological FT anchor</CardTitle>
        <CardDescription>Topological fault tolerance over AL3 L10 QEC (AM3).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isHypergraphL11TopologicalFaultTolerantAnchorEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isHypergraphL11TopologicalFaultTolerantAnchorEnabled()
            ? "L11 topological FT anchor enabled"
            : "Set THEME_EXPERIMENT_HYPERGRAPH_L11_TOPOLOGICAL_FAULT_TOLERANT_ANCHOR=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.anchors.length} anchors · {hypergraphL11ChainId()}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/hypergraph-l11-topological-fault-tolerant-anchor</p>
      </CardContent>
    </Card>
  );
}
