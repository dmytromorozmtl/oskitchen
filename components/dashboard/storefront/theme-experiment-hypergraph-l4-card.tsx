import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateHypergraphL4MetaAnchorGate,
  hypergraphL4ChainId,
  isHypergraphL4MetaAnchorEnabled,
  readHypergraphL4Meta,
} from "@/lib/compliance/hypergraph-l4-meta-anchor";

export function ThemeExperimentHypergraphL4Card({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readHypergraphL4Meta(themeExperimentJson);
  const gate = evaluateHypergraphL4MetaAnchorGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Hypergraph L4 meta anchor</CardTitle>
        <CardDescription>Meta-anchoring stack over AE3 L3 recursive anchors (AF3).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isHypergraphL4MetaAnchorEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isHypergraphL4MetaAnchorEnabled()
            ? "Hypergraph L4 meta anchor enabled"
            : "Set THEME_EXPERIMENT_HYPERGRAPH_L4_META_ANCHOR=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.anchors.length} L4 anchors · chain {hypergraphL4ChainId()}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/hypergraph-l4-meta-anchor</p>
      </CardContent>
    </Card>
  );
}
