import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateMartianOrbitalDtnRelayGate,
  isMartianOrbitalDtnRelayEnabled,
  readMartianOrbitalDtnRelay,
} from "@/lib/storefront/theme-experiment-martian-orbital-dtn-relay";

export function ThemeExperimentMartianOrbitalDtnRelayCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readMartianOrbitalDtnRelay(themeExperimentJson);
  const gate = evaluateMartianOrbitalDtnRelayGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Martian orbital DTN relay</CardTitle>
        <CardDescription>
          Olympus–Valles–Phobos relay over AH1 lunar far-side + AE heliopause (AI1).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isMartianOrbitalDtnRelayEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isMartianOrbitalDtnRelayEnabled()
            ? "Martian orbital DTN relay enabled"
            : "Set THEME_EXPERIMENT_MARTIAN_ORBITAL_DTN_RELAY=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.nodeQuorum} nodes · max {snap.maxOrbitalLatencyMs}ms orbital
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/martian-orbital-dtn-relay-sync</p>
      </CardContent>
    </Card>
  );
}
