import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateNeuromorphicAssignGate,
  isNeuromorphicAssignEnabled,
  neuromorphicMinFactorialCells,
} from "@/lib/storefront/theme-experiment-neuromorphic-assign";

export function ThemeExperimentNeuromorphicCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const gate = evaluateNeuromorphicAssignGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Neuromorphic edge assign</CardTitle>
        <CardDescription>
          {isNeuromorphicAssignEnabled()
            ? `Spiking WASM kernel · sub-µs when factorial > ${neuromorphicMinFactorialCells()}.`
            : "Set THEME_EXPERIMENT_NEUROMORPHIC_ASSIGN=1."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
      </CardContent>
    </Card>
  );
}
