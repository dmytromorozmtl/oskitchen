import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateQuantumSafePublishGate,
  isQuantumSafeAssignmentEnabled,
  readQuantumSafeSnapshot,
} from "@/lib/storefront/theme-experiment-quantum-safe";

export function ThemeExperimentQuantumSafeCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readQuantumSafeSnapshot(themeExperimentJson);
  const gate = evaluateQuantumSafePublishGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Quantum-safe assignment (ML-KEM)</CardTitle>
        <CardDescription>
          {isQuantumSafeAssignmentEnabled()
            ? "Hybrid SHA-256 + ML-KEM-768 sealed buckets · KEM rotation gate."
            : "Set THEME_EXPERIMENT_QUANTUM_SAFE=1."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            mode={snap.hybridMode} · seals={snap.seals.length} · rotation {snap.kemRotationDays}d
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
