import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateHypergraphL6HolographicAnchorGate,
  hypergraphL6ChainId,
  isHypergraphL6HolographicAnchorEnabled,
  readHypergraphL6Holographic,
} from "@/lib/compliance/hypergraph-l6-holographic-anchor";

export function ThemeExperimentHypergraphL6Card({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readHypergraphL6Holographic(themeExperimentJson);
  const gate = evaluateHypergraphL6HolographicAnchorGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Hypergraph L6 holographic anchor</CardTitle>
        <CardDescription>
          Holographic anchor over AG3 L5 compositional stack — Circom prod when enabled (AH3).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p
          className={
            isHypergraphL6HolographicAnchorEnabled() ? "text-emerald-700" : "text-muted-foreground"
          }
        >
          {isHypergraphL6HolographicAnchorEnabled()
            ? "Hypergraph L6 holographic anchor enabled"
            : "Set THEME_EXPERIMENT_HYPERGRAPH_L6_HOLOGRAPHIC_ANCHOR=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.anchors.length} anchors · chain {hypergraphL6ChainId()}
            {snap.circomProdPath ? " · Circom prod" : ""}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/hypergraph-l6-holographic-anchor</p>
      </CardContent>
    </Card>
  );
}
