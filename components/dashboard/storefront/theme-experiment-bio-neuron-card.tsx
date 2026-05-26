import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  bioNeuronMinFactorialCells,
  evaluateBioNeuronAssignGate,
  isBioNeuronAssignEnabled,
} from "@/lib/storefront/theme-experiment-bio-neuron-assign";

export function ThemeExperimentBioNeuronCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const gate = evaluateBioNeuronAssignGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Biological neuron assign</CardTitle>
        <CardDescription>
          Wetware-sim Hodgkin–Huxley fallback when photonic factorial exceeds{" "}
          {bioNeuronMinFactorialCells()} cells.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isBioNeuronAssignEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isBioNeuronAssignEnabled()
            ? "Bio-neuron assign enabled"
            : "Set THEME_EXPERIMENT_BIO_NEURON_ASSIGN=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        <p className="font-mono text-[10px]">
          Middleware: bio (&gt;64) → photonic (&gt;32) → neuromorphic (&gt;16)
        </p>
      </CardContent>
    </Card>
  );
}
