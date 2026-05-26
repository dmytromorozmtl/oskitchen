import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateWetwareCalibrationGate,
  isWetwareCalibrationEnabled,
  readWetwareCalibration,
  wetwareMinOutcomesForCalibrated,
} from "@/lib/storefront/theme-experiment-wetware-calibration";

export function ThemeExperimentWetwareCalibrationCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const cal = readWetwareCalibration(themeExperimentJson);
  const gate = evaluateWetwareCalibrationGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Online wetware calibration</CardTitle>
        <CardDescription>
          Synaptic plasticity from assignment outcomes — Hebbian updates on W2 bio-neuron path.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isWetwareCalibrationEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isWetwareCalibrationEnabled()
            ? "Wetware calibration enabled"
            : "Set THEME_EXPERIMENT_WETWARE_CALIBRATION=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {cal ? (
          <p className="font-mono text-xs">
            {cal.totalOutcomes}/{wetwareMinOutcomesForCalibrated()} outcomes · {cal.synapses.length}{" "}
            synapses
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Internal: POST /api/internal/experiment-wetware-calibrate</p>
      </CardContent>
    </Card>
  );
}
