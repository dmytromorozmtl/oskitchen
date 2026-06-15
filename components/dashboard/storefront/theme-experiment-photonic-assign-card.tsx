import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluatePhotonicAssignGate,
  isPhotonicAssignEnabled,
  photonicMinFactorialCells,
} from "@/lib/storefront/theme-experiment-photonic-assign";

export function ThemeExperimentPhotonicAssignCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const gate = evaluatePhotonicAssignGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Photonic co-processor assign</CardTitle>
        <CardDescription>
          {isPhotonicAssignEnabled()
            ? `Photonic matmul path when factorial > ${photonicMinFactorialCells()} cells.`
            : "Set THEME_EXPERIMENT_PHOTONIC_ASSIGN=1."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
      </CardContent>
    </Card>
  );
}
