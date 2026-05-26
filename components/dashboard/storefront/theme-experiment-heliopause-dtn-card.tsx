import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateHeliopauseDtnPublishGate,
  heliopauseBundleTtlMs,
  isHeliopauseDtnEnabled,
  readHeliopauseDtn,
} from "@/lib/storefront/theme-experiment-heliopause-dtn";

export function ThemeExperimentHeliopauseDtnCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const helio = readHeliopauseDtn(themeExperimentJson);
  const gate = evaluateHeliopauseDtnPublishGate(themeExperimentJson);
  const ttlDays = Math.round(heliopauseBundleTtlMs() / 86400000);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Heliopause DTN</CardTitle>
        <CardDescription>
          Deep-space relay with {ttlDays}-day bundle TTL and store-and-forward custody.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isHeliopauseDtnEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isHeliopauseDtnEnabled() ? "Heliopause DTN enabled" : "Set THEME_EXPERIMENT_HELIOPAUSE_DTN=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {helio ? (
          <p className="font-mono text-xs">
            {helio.bundles.length} bundles · pending {helio.pendingBundles}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">
          Webhook: experiment-heliopause-dtn-bundle · cron: heliopause-dtn-sync
        </p>
      </CardContent>
    </Card>
  );
}
