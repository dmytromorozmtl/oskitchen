import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateCosmicWebFederationGate,
  isCosmicWebFederationEnabled,
  readCosmicWebFederation,
} from "@/lib/storefront/theme-experiment-cosmic-web-federation";

export function ThemeExperimentCosmicWebFederationCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readCosmicWebFederation(themeExperimentJson);
  const gate = evaluateCosmicWebFederationGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Cosmic web federation</CardTitle>
        <CardDescription>Filament CRDT merge over intergalactic mesh + wormhole SLO (AD5).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isCosmicWebFederationEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isCosmicWebFederationEnabled()
            ? "Cosmic web federation enabled"
            : "Set THEME_EXPERIMENT_COSMIC_WEB_FEDERATION=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.filamentQuorum} filaments · SLO {snap.wormholeSloMet ? "met" : "breach"}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/cosmic-web-federation-sync</p>
      </CardContent>
    </Card>
  );
}
