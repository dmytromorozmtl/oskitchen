import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateHypergraphL9ByzantineAnchorGate,
  hypergraphL9ChainId,
  isHypergraphL9ByzantineAnchorEnabled,
  readHypergraphL9Byzantine,
} from "@/lib/compliance/hypergraph-l9-byzantine-anchor";

export function ThemeExperimentHypergraphL9Card({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readHypergraphL9Byzantine(themeExperimentJson);
  const gate = evaluateHypergraphL9ByzantineAnchorGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Hypergraph L9 Byzantine anchor</CardTitle>
        <CardDescription>BFT consensus over AJ3 L8 fault-tolerant stack (AK3).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isHypergraphL9ByzantineAnchorEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isHypergraphL9ByzantineAnchorEnabled()
            ? "L9 Byzantine anchor enabled"
            : "Set THEME_EXPERIMENT_HYPERGRAPH_L9_BYZANTINE_ANCHOR=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.anchors.length} anchors · {hypergraphL9ChainId()}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/hypergraph-l9-byzantine-anchor</p>
      </CardContent>
    </Card>
  );
}
