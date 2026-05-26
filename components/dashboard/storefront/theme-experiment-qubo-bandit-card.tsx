import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateQuboBanditGate,
  isQuboBanditEnabled,
  quboMinFactorialCells,
} from "@/lib/storefront/theme-experiment-qubo-bandit";
import { factorialCellCount, readCompositionalExperiment } from "@/lib/storefront/theme-experiment-compositional-ui";

export function ThemeExperimentQuboBanditCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const comp = readCompositionalExperiment(themeExperimentJson);
  const gate = evaluateQuboBanditGate(themeExperimentJson);
  const cells = comp ? factorialCellCount(comp.slots) : 0;

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">QUBO quantum bandit</CardTitle>
        <CardDescription>
          {isQuboBanditEnabled()
            ? `LinUCB → QUBO → sub-ms assign when factorial cells > ${quboMinFactorialCells()}.`
            : "Set THEME_EXPERIMENT_QUBO_BANDIT=1."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {comp ? (
          <p className="font-mono text-xs">
            factorial {cells} cells · orthogonal {comp.orthogonal ? "yes" : "no"}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
