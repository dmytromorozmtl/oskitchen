import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildFiveEyesPlusCompactEvidence,
  evaluateFiveEyesPlusCompactGate,
  isFiveEyesPlusCompactEnabled,
} from "@/lib/compliance/five-eyes-plus-compact";

export function FiveEyesPlusCompactCard({ themeExperimentJson }: { themeExperimentJson?: unknown }) {
  const ev = buildFiveEyesPlusCompactEvidence(themeExperimentJson);
  const gate = evaluateFiveEyesPlusCompactGate(themeExperimentJson ?? null);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Five Eyes+ compact</CardTitle>
        <CardDescription>
          JP/IN observer nations + quantum-safe residency proofs atop Z3 Five Eyes (Z3 + X1).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isFiveEyesPlusCompactEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isFiveEyesPlusCompactEnabled()
            ? "Five Eyes+ compact enabled"
            : "Set THEME_EXPERIMENT_FIVE_EYES_PLUS_COMPACT=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        <p>
          Observers: {ev.observersReady ? "JP/IN ready" : "pending"} · QSafe:{" "}
          {ev.quantumSafeResidencyReady ? "ready" : "pending"}
        </p>
        <p className="font-mono text-[10px]">Cron: /api/cron/five-eyes-plus-compact-monitoring</p>
      </CardContent>
    </Card>
  );
}
