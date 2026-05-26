import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateHypergraphL7EntanglementAnchorGate,
  hypergraphL7ChainId,
  isHypergraphL7EntanglementAnchorEnabled,
  readHypergraphL7Entanglement,
} from "@/lib/compliance/hypergraph-l7-entanglement-anchor";

export function ThemeExperimentHypergraphL7Card({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readHypergraphL7Entanglement(themeExperimentJson);
  const gate = evaluateHypergraphL7EntanglementAnchorGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Hypergraph L7 entanglement anchor</CardTitle>
        <CardDescription>
          QEC redundancy layer over AH3 L6 holographic stack — Circom L7 when enabled (AI3).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p
          className={
            isHypergraphL7EntanglementAnchorEnabled() ? "text-emerald-700" : "text-muted-foreground"
          }
        >
          {isHypergraphL7EntanglementAnchorEnabled()
            ? "Hypergraph L7 entanglement anchor enabled"
            : "Set THEME_EXPERIMENT_HYPERGRAPH_L7_ENTANGLEMENT_ANCHOR=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.anchors.length} anchors · chain {hypergraphL7ChainId()}
            {snap.qecRedundancyMet ? " · QEC met" : ""}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/hypergraph-l7-entanglement-anchor</p>
      </CardContent>
    </Card>
  );
}
