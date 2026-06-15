import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  evaluateCausalDiscoveryAgentGate,
  isCausalDiscoveryAgentEnabled,
  readCausalDiscoveryAgent,
} from "@/lib/storefront/theme-experiment-causal-discovery-agent";

export function ThemeExperimentCausalDiscoveryCard({
  themeExperimentJson,
  storefrontId,
}: {
  themeExperimentJson: unknown;
  storefrontId: string;
}) {
  const agent = readCausalDiscoveryAgent(themeExperimentJson);
  const gate = evaluateCausalDiscoveryAgentGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Causal discovery agent (closed loop)</CardTitle>
        <CardDescription>
          {isCausalDiscoveryAgentEnabled()
            ? "BQ outcomes → DAG → interference matrix → holdout WS push · human gate on high spillover."
            : "Set THEME_EXPERIMENT_CAUSAL_DISCOVERY_AGENT=1."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {agent ? (
          <ul className="list-inside list-disc text-xs text-muted-foreground">
            {agent.steps.slice(-4).map((s, i) => (
              <li key={`${s.at}-${i}`}>
                {s.step}: {s.detail}
              </li>
            ))}
          </ul>
        ) : null}
        {agent?.pendingApproval ? (
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/storefront/advanced?causalDiscovery=${storefrontId}`}>
              Approve holdout push (API)
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
