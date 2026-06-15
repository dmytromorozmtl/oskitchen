import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateUkDsitAlgorithmicTransparencyGate,
  isUkDsitAlgorithmicTransparencyEnabled,
  readUkDsitAlgorithmicTransparency,
} from "@/lib/compliance/uk-dsit-algorithmic-transparency";

export function UkDsitAlgorithmicTransparencyCard({
  themeExperimentJson,
}: {
  themeExperimentJson?: unknown;
}) {
  const snap = themeExperimentJson ? readUkDsitAlgorithmicTransparency(themeExperimentJson) : null;
  const gate = evaluateUkDsitAlgorithmicTransparencyGate(themeExperimentJson ?? null);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">UK DSIT algorithmic transparency</CardTitle>
        <CardDescription>Live transparency feed over UK AI safety (AE2).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p
          className={
            isUkDsitAlgorithmicTransparencyEnabled() ? "text-emerald-700" : "text-muted-foreground"
          }
        >
          {isUkDsitAlgorithmicTransparencyEnabled()
            ? "UK DSIT feed enabled"
            : "Set THEME_EXPERIMENT_UK_DSIT_ALGORITHMIC_TRANSPARENCY=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        <p className="font-mono text-[10px]">
          Webhook: /api/webhooks/uk-dsit-algorithmic-transparency · Topic: uk-dsit-transparency-events
        </p>
      </CardContent>
    </Card>
  );
}
