import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MabBanditSnapshot } from "@/lib/storefront/theme-experiment-mab";
import { readMabSnapshot } from "@/lib/storefront/theme-experiment-mab";

export function ThemeExperimentBanditCard({ themeExperimentJson }: { themeExperimentJson: unknown }) {
  const snapshot: MabBanditSnapshot | null = readMabSnapshot(themeExperimentJson);

  if (!snapshot) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Bandit (MAB)</CardTitle>
          <CardDescription>
            Enable with <code className="rounded bg-muted px-1 text-xs">THEME_EXPERIMENT_MAB=1</code> and{" "}
            <code className="rounded bg-muted px-1 text-xs">allocationMode: mab</code> in experiment JSON.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Bandit (MAB)</CardTitle>
        <CardDescription>
          Thompson sampling snapshot — exploration {snapshot.explorationPercent}%, regret ~{snapshot.regretPp} pp.
          Updated {new Date(snapshot.updatedAt).toLocaleString()}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {snapshot.arms.map((a) => (
            <li key={a.armId} className="flex justify-between rounded-md border border-border/60 px-3 py-2">
              <span className="font-mono text-xs">{a.armId}</span>
              <span className="text-muted-foreground">
                α={a.alpha.toFixed(1)} β={a.beta.toFixed(1)} · {a.trials} trials
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
