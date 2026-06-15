import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateHypergraphL5CompositionalAnchorGate,
  hypergraphL5ChainId,
  isHypergraphL5CompositionalAnchorEnabled,
  isHypergraphL5CircomPathEnabled,
  readHypergraphL5Compositional,
} from "@/lib/compliance/hypergraph-l5-compositional-anchor";

export function ThemeExperimentHypergraphL5Card({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readHypergraphL5Compositional(themeExperimentJson);
  const gate = evaluateHypergraphL5CompositionalAnchorGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Hypergraph L5 compositional anchor</CardTitle>
        <CardDescription>Meta-meta anchor over AF3 L4 stack · optional Circom proof (AG3).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isHypergraphL5CompositionalAnchorEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isHypergraphL5CompositionalAnchorEnabled()
            ? "Hypergraph L5 compositional enabled"
            : "Set THEME_EXPERIMENT_HYPERGRAPH_L5_COMPOSITIONAL_ANCHOR=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.anchors.length} L5 anchors · chain {hypergraphL5ChainId()}
            {isHypergraphL5CircomPathEnabled() ? " · Circom" : ""}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/hypergraph-l5-compositional-anchor</p>
      </CardContent>
    </Card>
  );
}
