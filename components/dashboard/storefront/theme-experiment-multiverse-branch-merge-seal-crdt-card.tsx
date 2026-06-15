import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateMultiverseBranchMergeSealCrdtGate,
  isMultiverseBranchMergeSealCrdtEnabled,
  readMultiverseBranchMergeSealCrdt,
} from "@/lib/storefront/theme-experiment-multiverse-branch-merge-seal-crdt";

export function ThemeExperimentMultiverseBranchMergeSealCrdtCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readMultiverseBranchMergeSealCrdt(themeExperimentJson);
  const gate = evaluateMultiverseBranchMergeSealCrdtGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Multiverse branch merge seal CRDT</CardTitle>
        <CardDescription>Branch merge after AN5 timeline seal + parallel universe merge (AO5).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isMultiverseBranchMergeSealCrdtEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isMultiverseBranchMergeSealCrdtEnabled()
            ? "Branch merge seal CRDT enabled"
            : "Set THEME_EXPERIMENT_MULTIVERSE_BRANCH_MERGE_SEAL_CRDT=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.phaseQuorum} phases · consensus {snap.consensusMergedLiftPp.toFixed(1)}pp
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/multiverse-branch-merge-seal-crdt-sync</p>
      </CardContent>
    </Card>
  );
}
