import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateMultiAgentOrchestratorGate,
  isMultiAgentOrchestratorEnabled,
  readMultiAgentOrchestrator,
} from "@/lib/storefront/theme-experiment-multi-agent-orchestrator";

export function ThemeExperimentMultiAgentCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readMultiAgentOrchestrator(themeExperimentJson);
  const gate = evaluateMultiAgentOrchestratorGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Multi-agent orchestrator</CardTitle>
        <CardDescription>
          {isMultiAgentOrchestratorEnabled()
            ? "Planner → Critic → Executor over causal discovery + autonomous scientist."
            : "Set THEME_EXPERIMENT_MULTI_AGENT_ORCHESTRATOR=1."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <ul className="list-inside list-disc text-xs text-muted-foreground">
            {snap.plans.slice(-3).map((p) => (
              <li key={p.planId}>
                {p.action} · risk {Math.round(p.riskScore * 100)}%
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
