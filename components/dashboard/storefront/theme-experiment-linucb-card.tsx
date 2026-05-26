import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isLinUcbEnabled, linUcbMaxExplorationPercent, readLinUcbSnapshot } from "@/lib/storefront/theme-experiment-linucb";
import { regretAlertThresholdPp } from "@/lib/storefront/theme-experiment-regret-alerts";

export function ThemeExperimentLinUcbCard({ themeExperimentJson }: { themeExperimentJson: unknown }) {
  const snap = readLinUcbSnapshot(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">LinUCB (live)</CardTitle>
        <CardDescription>
          {isLinUcbEnabled()
            ? `Features: segment, geo, device, hour, cart bucket · max exploration ${linUcbMaxExplorationPercent()}%`
            : "Set THEME_EXPERIMENT_LINUCB=1 and configure BQ webhook every 15m."}
        </CardDescription>
      </CardHeader>
      {snap ? (
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            Updated {new Date(snap.at).toLocaleString()} · regret ~{snap.regretPp}pp (alert &gt;
            {regretAlertThresholdPp()}pp)
          </p>
          <ul className="space-y-1 font-mono text-xs">
            {snap.arms.map((a) => (
              <li key={a.armId} className="flex justify-between">
                <span>{a.armId}</span>
                <span>w={(a.weight * 100).toFixed(0)}%</span>
              </li>
            ))}
          </ul>
        </CardContent>
      ) : null}
    </Card>
  );
}
