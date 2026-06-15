import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateHypergraphL8FaultTolerantAnchorGate,
  hypergraphL8ChainId,
  isHypergraphL8FaultTolerantAnchorEnabled,
  readHypergraphL8FaultTolerant,
} from "@/lib/compliance/hypergraph-l8-fault-tolerant-anchor";

export function ThemeExperimentHypergraphL8Card({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readHypergraphL8FaultTolerant(themeExperimentJson);
  const gate = evaluateHypergraphL8FaultTolerantAnchorGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Hypergraph L8 fault-tolerant anchor</CardTitle>
        <CardDescription>Erasure redundancy over AI3 L7 entanglement (AJ3).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p
          className={
            isHypergraphL8FaultTolerantAnchorEnabled() ? "text-emerald-700" : "text-muted-foreground"
          }
        >
          {isHypergraphL8FaultTolerantAnchorEnabled()
            ? "Hypergraph L8 fault-tolerant anchor enabled"
            : "Set THEME_EXPERIMENT_HYPERGRAPH_L8_FAULT_TOLERANT_ANCHOR=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.anchors.length} anchors · {hypergraphL8ChainId()}
            {snap.erasureRedundancyMet ? " · erasure met" : ""}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/hypergraph-l8-fault-tolerant-anchor</p>
      </CardContent>
    </Card>
  );
}
