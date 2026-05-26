import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateJupiterTrojanDtnLagrangeGate,
  isJupiterTrojanDtnLagrangeEnabled,
  readJupiterTrojanDtnLagrange,
} from "@/lib/storefront/theme-experiment-jupiter-trojan-dtn-lagrange";

export function ThemeExperimentJupiterTrojanDtnLagrangeCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readJupiterTrojanDtnLagrange(themeExperimentJson);
  const gate = evaluateJupiterTrojanDtnLagrangeGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Jupiter trojan DTN Lagrange</CardTitle>
        <CardDescription>L4/L5 trojan points over AI1 Martian orbital relay (AJ1).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isJupiterTrojanDtnLagrangeEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isJupiterTrojanDtnLagrangeEnabled()
            ? "Jupiter trojan Lagrange enabled"
            : "Set THEME_EXPERIMENT_JUPITER_TROJAN_DTN_LAGRANGE=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.lagrangeQuorum} Lagrange points · max {snap.maxTrojanLatencyMs}ms
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/jupiter-trojan-dtn-lagrange-sync</p>
      </CardContent>
    </Card>
  );
}
