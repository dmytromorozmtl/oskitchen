import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateSpinalCordPublishThrottleGate,
  isSpinalCordPublishThrottleEnabled,
  readSpinalCordPublishThrottle,
  spinalMaxPublishAttemptsPerEthicsWindow,
} from "@/lib/storefront/theme-experiment-spinal-cord-publish-throttle";

export function ThemeExperimentSpinalCordPublishThrottleCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readSpinalCordPublishThrottle(themeExperimentJson);
  const gate = evaluateSpinalCordPublishThrottleGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Spinal cord publish throttle</CardTitle>
        <CardDescription>
          Rate limit publish per ethics window after AF4 brainstem (AG4).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isSpinalCordPublishThrottleEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isSpinalCordPublishThrottleEnabled()
            ? "Spinal cord throttle enabled"
            : "Set THEME_EXPERIMENT_SPINAL_CORD_PUBLISH_THROTTLE=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.attemptsInWindow}/{snap.maxAttemptsPerWindow} attempts · throttle {snap.throttleMs}ms
          </p>
        ) : (
          <p className="font-mono text-xs">
            Max {spinalMaxPublishAttemptsPerEthicsWindow()} attempts per ethics window
          </p>
        )}
        <p className="font-mono text-[10px]">
          Header: x-kos-spinal-throttle-ms · Cron: /api/cron/spinal-cord-publish-throttle-sync
        </p>
      </CardContent>
    </Card>
  );
}
