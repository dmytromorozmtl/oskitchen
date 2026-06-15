import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateHypergraphL12CategoricalQuantumAnchorGate,
  hypergraphL12MorphismCount,
  isHypergraphL12CategoricalQuantumAnchorEnabled,
  readHypergraphL12CategoricalQuantum,
} from "@/lib/compliance/hypergraph-l12-categorical-quantum-anchor";

export function ThemeExperimentHypergraphL12Card({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readHypergraphL12CategoricalQuantum(themeExperimentJson);
  const gate = evaluateHypergraphL12CategoricalQuantumAnchorGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Hypergraph L12 categorical quantum</CardTitle>
        <CardDescription>Category-theoretic anchor over AM3 L11 topological FT (AN3).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isHypergraphL12CategoricalQuantumAnchorEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isHypergraphL12CategoricalQuantumAnchorEnabled()
            ? "L12 categorical quantum anchor enabled"
            : "Set THEME_EXPERIMENT_HYPERGRAPH_L12_CATEGORICAL_QUANTUM_ANCHOR=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.latestAnchorId ?? "—"} · {hypergraphL12MorphismCount()} morphisms
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/hypergraph-l12-categorical-quantum-anchor</p>
      </CardContent>
    </Card>
  );
}
