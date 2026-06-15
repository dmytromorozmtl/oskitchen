import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateMultiverseCausalityLockCrdtGate,
  isMultiverseCausalityLockCrdtEnabled,
  readMultiverseCausalityLockCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-causality-lock-crdt";

export function ThemeExperimentMultiverseCausalityLockCrdtCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readMultiverseCausalityLockCrdt(themeExperimentJson);
  const gate = evaluateMultiverseCausalityLockCrdtGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Multiverse causality lock CRDT</CardTitle>
        <CardDescription>Causal lock after AK5 irreversible metaverse finality (AL5).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isMultiverseCausalityLockCrdtEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isMultiverseCausalityLockCrdtEnabled()
            ? "Multiverse causality lock enabled"
            : "Set THEME_EXPERIMENT_MULTIVERSE_CAUSALITY_LOCK_CRDT=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.phaseQuorum} phases · consensus {snap.consensusLockedLiftPp.toFixed(1)}pp locked
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/multiverse-causality-lock-crdt-sync</p>
      </CardContent>
    </Card>
  );
}
