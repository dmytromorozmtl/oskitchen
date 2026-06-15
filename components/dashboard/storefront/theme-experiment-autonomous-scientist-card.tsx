import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateAutonomousScientistGate,
  isAutonomousScientistEnabled,
  readAutonomousScientist,
} from "@/lib/storefront/theme-experiment-autonomous-scientist";

export function ThemeExperimentAutonomousScientistCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readAutonomousScientist(themeExperimentJson);
  const gate = evaluateAutonomousScientistGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Autonomous experiment scientist</CardTitle>
        <CardDescription>
          {isAutonomousScientistEnabled()
            ? "LLM propose → run → conclude · human approval gate for high risk."
            : "Set THEME_EXPERIMENT_AUTONOMOUS_SCIENTIST=1."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <ul className="list-inside list-disc text-xs text-muted-foreground">
            {snap.proposals.slice(-5).map((p) => (
              <li key={p.proposalId}>
                {p.status} · {p.riskTier} · {p.hypothesis.slice(0, 60)}
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
