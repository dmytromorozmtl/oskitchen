import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateHypergraphL3RecursiveAnchorGate,
  hypergraphL3ChainId,
  isHypergraphL3RecursiveAnchorEnabled,
  readHypergraphL3Recursive,
} from "@/lib/compliance/hypergraph-l3-recursive-anchor";

export function ThemeExperimentHypergraphL3Card({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const l3 = readHypergraphL3Recursive(themeExperimentJson);
  const gate = evaluateHypergraphL3RecursiveAnchorGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Hypergraph L3 recursive anchor</CardTitle>
        <CardDescription>L3 stack over AD3 L2 evolution anchors (AE3).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p
          className={
            isHypergraphL3RecursiveAnchorEnabled() ? "text-emerald-700" : "text-muted-foreground"
          }
        >
          {isHypergraphL3RecursiveAnchorEnabled()
            ? "Hypergraph L3 enabled"
            : "Set THEME_EXPERIMENT_HYPERGRAPH_L3_RECURSIVE_ANCHOR=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {l3 ? (
          <p className="font-mono text-xs">
            {l3.anchors.length} L3 anchors · chain {hypergraphL3ChainId()}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/hypergraph-l3-recursive-anchor</p>
      </CardContent>
    </Card>
  );
}
