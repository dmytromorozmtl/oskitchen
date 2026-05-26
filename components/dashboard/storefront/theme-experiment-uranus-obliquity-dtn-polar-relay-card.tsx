import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateUranusObliquityDtnPolarRelayGate,
  isUranusObliquityDtnPolarRelayEnabled,
  readUranusObliquityDtnPolarRelay,
} from "@/lib/storefront/theme-experiment-uranus-obliquity-dtn-polar-relay";

export function ThemeExperimentUranusObliquityDtnPolarRelayCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readUranusObliquityDtnPolarRelay(themeExperimentJson);
  const gate = evaluateUranusObliquityDtnPolarRelayGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Uranus obliquity DTN polar relay</CardTitle>
        <CardDescription>Polar relay tier over AK1 Saturn ring + AE heliopause (AL1).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isUranusObliquityDtnPolarRelayEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isUranusObliquityDtnPolarRelayEnabled()
            ? "Uranus polar relay enabled"
            : "Set THEME_EXPERIMENT_URANUS_OBLIQUITY_DTN_POLAR_RELAY=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.polarQuorum} relays · max {snap.maxPolarLatencyMs}ms
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/uranus-obliquity-dtn-polar-relay-sync</p>
      </CardContent>
    </Card>
  );
}
