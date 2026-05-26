import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateHypergraphEvolutionGate,
  hypergraphL2ChainId,
  isHypergraphEvolutionEnabled,
  readHypergraphEvolution,
} from "@/lib/compliance/hypergraph-evolution";

export function ThemeExperimentHypergraphEvolutionCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const evo = readHypergraphEvolution(themeExperimentJson);
  const gate = evaluateHypergraphEvolutionGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Hypergraph evolution</CardTitle>
        <CardDescription>L2 anchoring of verified AC1 DAG proofs (AD3).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isHypergraphEvolutionEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isHypergraphEvolutionEnabled()
            ? "Hypergraph evolution enabled"
            : "Set THEME_EXPERIMENT_HYPERGRAPH_EVOLUTION=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {evo ? (
          <p className="font-mono text-xs">
            {evo.anchors.length} anchors · chain {hypergraphL2ChainId()}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/hypergraph-evolution-anchor</p>
      </CardContent>
    </Card>
  );
}
