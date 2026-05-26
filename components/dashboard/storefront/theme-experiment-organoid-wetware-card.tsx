import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateOrganoidWetwareGate,
  isOrganoidWetwareEnabled,
  organoidEnsembleSize,
} from "@/lib/storefront/theme-experiment-organoid-wetware";

export function ThemeExperimentOrganoidWetwareCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const gate = evaluateOrganoidWetwareGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Organoid wetware cluster</CardTitle>
        <CardDescription>
          Multi-synapse ensemble assign with variance reduction over calibrated wetware path.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isOrganoidWetwareEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isOrganoidWetwareEnabled()
            ? "Organoid wetware enabled"
            : "Set THEME_EXPERIMENT_ORGANOID_WETWARE=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        <p className="font-mono text-[10px]">
          Middleware: organoid → bio → photonic · ensemble n={organoidEnsembleSize()}
        </p>
      </CardContent>
    </Card>
  );
}
