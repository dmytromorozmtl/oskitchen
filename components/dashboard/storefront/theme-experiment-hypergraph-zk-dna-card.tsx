import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateHypergraphZkDnaGate,
  isHypergraphZkDnaEnabled,
  readHypergraphZkDna,
} from "@/lib/compliance/hypergraph-zk-dna-rollup";

export function ThemeExperimentHypergraphZkDnaCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const hg = readHypergraphZkDna(themeExperimentJson);
  const gate = evaluateHypergraphZkDnaGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Hypergraph ZK DNA</CardTitle>
        <CardDescription>
          Merkle-DAG multi-trail proofs over AA1 recursive batches (AC1).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isHypergraphZkDnaEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isHypergraphZkDnaEnabled()
            ? "Hypergraph ZK DNA enabled"
            : "Set THEME_EXPERIMENT_HYPERGRAPH_ZK_DNA=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {hg ? (
          <p className="font-mono text-xs">
            {hg.proofs.length} proofs · {hg.nodes.length} DAG nodes
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/hypergraph-zk-dna-rollup</p>
      </CardContent>
    </Card>
  );
}
