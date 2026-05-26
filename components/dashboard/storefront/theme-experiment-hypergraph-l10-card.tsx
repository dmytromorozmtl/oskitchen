import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateHypergraphL10QuantumResilientAnchorGate,
  hypergraphL10ChainId,
  isHypergraphL10QuantumResilientAnchorEnabled,
  readHypergraphL10QuantumResilient,
} from "@/lib/compliance/hypergraph-l10-quantum-resilient-anchor";

export function ThemeExperimentHypergraphL10Card({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readHypergraphL10QuantumResilient(themeExperimentJson);
  const gate = evaluateHypergraphL10QuantumResilientAnchorGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Hypergraph L10 quantum-resilient anchor</CardTitle>
        <CardDescription>Surface-code QEC over AK3 L9 Byzantine BFT (AL3).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isHypergraphL10QuantumResilientAnchorEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isHypergraphL10QuantumResilientAnchorEnabled()
            ? "L10 quantum-resilient anchor enabled"
            : "Set THEME_EXPERIMENT_HYPERGRAPH_L10_QUANTUM_RESILIENT_ANCHOR=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.anchors.length} anchors · {hypergraphL10ChainId()}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/hypergraph-l10-quantum-resilient-anchor</p>
      </CardContent>
    </Card>
  );
}
