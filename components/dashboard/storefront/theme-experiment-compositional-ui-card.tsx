import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  COMPOSITIONAL_SLOTS,
  evaluateCompositionalPublishGate,
  isCompositionalUiEnabled,
  readCompositionalExperiment,
} from "@/lib/storefront/theme-experiment-compositional-ui";

export function ThemeExperimentCompositionalUiCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readCompositionalExperiment(themeExperimentJson);
  const gate = evaluateCompositionalPublishGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Compositional UI (factorial)</CardTitle>
        <CardDescription>
          {isCompositionalUiEnabled()
            ? "Slot experiments: header / hero / CTA / footer — orthogonal factorial design."
            : "Set THEME_EXPERIMENT_COMPOSITIONAL_UI=1."}
        </CardDescription>
      </CardHeader>
      {snap ? (
        <CardContent className="space-y-2 text-sm">
          <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
          <p className="text-muted-foreground">{gate.detail}</p>
          <ul className="list-inside list-disc text-xs text-muted-foreground">
            {COMPOSITIONAL_SLOTS.map((slot) => {
              const variants = snap.slots.filter((s) => s.slot === slot).map((s) => s.variantId);
              return (
                <li key={slot}>
                  {slot}: {variants.join(", ") || "default"}
                </li>
              );
            })}
          </ul>
          <p className="font-mono text-xs">{snap.factorialCells} factorial cells</p>
        </CardContent>
      ) : null}
    </Card>
  );
}
