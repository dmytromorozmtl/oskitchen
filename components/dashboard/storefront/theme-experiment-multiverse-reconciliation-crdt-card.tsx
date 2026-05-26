import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateMultiverseReconciliationCrdtGate,
  isMultiverseReconciliationCrdtEnabled,
  readMultiverseReconciliationCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-reconciliation-crdt";

export function ThemeExperimentMultiverseReconciliationCrdtCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readMultiverseReconciliationCrdt(themeExperimentJson);
  const gate = evaluateMultiverseReconciliationCrdtGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Multiverse reconciliation CRDT</CardTitle>
        <CardDescription>
          Collapse divergent branches after AH5 parallel universe merge (AI5).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p
          className={
            isMultiverseReconciliationCrdtEnabled() ? "text-emerald-700" : "text-muted-foreground"
          }
        >
          {isMultiverseReconciliationCrdtEnabled()
            ? "Multiverse reconciliation CRDT enabled"
            : "Set THEME_EXPERIMENT_MULTIVERSE_RECONCILIATION_CRDT=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.branchQuorum} branches · consensus {snap.consensusReconciledLiftPp.toFixed(1)}pp
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/multiverse-reconciliation-crdt-sync</p>
      </CardContent>
    </Card>
  );
}
