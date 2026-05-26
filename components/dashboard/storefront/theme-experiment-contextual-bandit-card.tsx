import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isContextualBanditEnabled } from "@/lib/storefront/theme-experiment-contextual-bandit";
import { readOffPolicyEvaluation } from "@/lib/storefront/theme-experiment-off-policy";

export function ThemeExperimentContextualBanditCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const offPolicy = readOffPolicyEvaluation(themeExperimentJson);
  const segmentWeights =
    themeExperimentJson &&
    typeof themeExperimentJson === "object" &&
    !Array.isArray(themeExperimentJson)
      ? (themeExperimentJson as Record<string, unknown>).segmentArmWeights
      : null;

  const segments =
    segmentWeights && typeof segmentWeights === "object" && !Array.isArray(segmentWeights)
      ? Object.keys(segmentWeights as Record<string, unknown>)
      : [];

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Contextual bandit</CardTitle>
        <CardDescription>
          {isContextualBanditEnabled()
            ? "visitorSegment cookie → per-segment armWeights at edge."
            : "Set THEME_EXPERIMENT_CONTEXTUAL_BANDIT=1 and segmentArmWeights in JSON."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {segments.length > 0 ? (
          <ul className="space-y-2">
            {segments.map((seg) => (
              <li key={seg} className="rounded-md border border-border/60 px-3 py-2">
                <span className="font-mono text-xs">{seg}</span>
                <pre className="mt-1 overflow-x-auto text-[10px] text-muted-foreground">
                  {JSON.stringify((segmentWeights as Record<string, unknown>)[seg], null, 0)}
                </pre>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No segmentArmWeights configured.</p>
        )}
        {offPolicy ? (
          <div className="rounded-md bg-muted/50 p-3 text-xs">
            <p className="font-medium">Off-policy evaluation (BQ)</p>
            <p className="mt-1 text-muted-foreground">
              IPS lift {offPolicy.ipsLiftPp} pp · DM {offPolicy.dmLiftPp} pp · regret ~
              {offPolicy.estimatedRegretPp} pp · {new Date(offPolicy.at).toLocaleString()}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
