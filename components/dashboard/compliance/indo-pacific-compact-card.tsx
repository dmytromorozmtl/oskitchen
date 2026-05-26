import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateIndoPacificCompactGate,
  isIndoPacificCompactEnabled,
  readIndoPacificCompact,
} from "@/lib/compliance/indo-pacific-compact";

export function IndoPacificCompactCard({ themeExperimentJson }: { themeExperimentJson?: unknown }) {
  const snap = themeExperimentJson ? readIndoPacificCompact(themeExperimentJson) : null;
  const gate = evaluateIndoPacificCompactGate(themeExperimentJson ?? null);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Indo-Pacific compact</CardTitle>
        <CardDescription>ASEAN observer + cross-border PQC attestation (AD1).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isIndoPacificCompactEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isIndoPacificCompactEnabled()
            ? "Indo-Pacific compact enabled"
            : "Set THEME_EXPERIMENT_INDO_PACIFIC_COMPACT=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            ASEAN {snap.evidence.observers.join("/")} · ready {String(snap.evidence.indoPacificReady)}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/indo-pacific-compact-sync</p>
      </CardContent>
    </Card>
  );
}
