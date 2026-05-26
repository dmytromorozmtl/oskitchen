import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExperimentPowerEstimate } from "@/lib/storefront/theme-experiment-power";

export function ThemeExperimentPowerCard({
  power,
  cupedEnabled,
}: {
  power: ExperimentPowerEstimate;
  cupedEnabled: boolean;
}) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Sample size (power)</CardTitle>
        <CardDescription>
          Min checkouts per arm for {power.targetLiftPp} pp lift at {power.baselineRatePercent}% baseline (
          {Math.round(power.power * 100)}% power).
          {cupedEnabled ? " CUPED adjustment enabled on server." : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="font-medium">{power.headline}</p>
        <p className="text-muted-foreground">{power.detail}</p>
      </CardContent>
    </Card>
  );
}
