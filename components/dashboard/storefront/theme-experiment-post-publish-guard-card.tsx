import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  isPostPublishGuardEnabled,
  postPublishWindowHours,
  readPostPublishGuard,
} from "@/lib/storefront/theme-experiment-post-publish-guard";

export function ThemeExperimentPostPublishGuardCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const guard = readPostPublishGuard(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Post-publish guard</CardTitle>
        <CardDescription>
          {isPostPublishGuardEnabled()
            ? `${postPublishWindowHours()}h regression window · 2σ drop → Slack rollback`
            : "Set THEME_EXPERIMENT_POST_PUBLISH_GUARD=1."}
        </CardDescription>
      </CardHeader>
      {guard ? (
        <CardContent className="space-y-2 text-sm">
          <p className={guard.rollbackPending ? "text-amber-700" : "text-muted-foreground"}>
            {guard.rollbackPending
              ? `Regression detected (z=${guard.zScore}) — confirm rollback in Slack`
              : "Monitoring within publish window"}
          </p>
          <p className="font-mono text-xs">
            Baseline {(guard.baseline.conversionRate * 100).toFixed(2)}% · current{" "}
            {guard.currentConversionRate !== null
              ? `${(guard.currentConversionRate * 100).toFixed(2)}%`
              : "—"}
          </p>
          {guard.frozenUntil ? (
            <p className="text-xs text-muted-foreground">
              Auto-conclude frozen until {new Date(guard.frozenUntil).toLocaleString()}
            </p>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  );
}
