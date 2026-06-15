import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateHomomorphicDnaFederationGate,
  isHomomorphicDnaFederationEnabled,
  readHomomorphicDnaFederation,
} from "@/lib/compliance/homomorphic-dna-federation";

export function ThemeExperimentHomomorphicDnaCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const fed = readHomomorphicDnaFederation(themeExperimentJson);
  const gate = evaluateHomomorphicDnaFederationGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Homomorphic DNA federation</CardTitle>
        <CardDescription>
          FHE merge of PQC-sealed DNA blocks across stores (CKKS-sim over ML-DSA seals).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p
          className={
            isHomomorphicDnaFederationEnabled() ? "text-emerald-700" : "text-muted-foreground"
          }
        >
          {isHomomorphicDnaFederationEnabled()
            ? "Homomorphic DNA federation enabled"
            : "Set THEME_EXPERIMENT_HOMOMORPHIC_DNA_FEDERATION=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {fed ? (
          <p className="font-mono text-xs">
            {fed.participatingStores.length} stores · {fed.cells.length} FHE cells
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/homomorphic-dna-federation-sync</p>
      </CardContent>
    </Card>
  );
}
