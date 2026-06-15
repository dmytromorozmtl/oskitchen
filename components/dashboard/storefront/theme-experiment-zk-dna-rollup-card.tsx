import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateZkDnaRollupGate,
  isZkDnaRollupEnabled,
  readZkDnaRollup,
} from "@/lib/compliance/zk-dna-rollup";

export function ThemeExperimentZkDnaRollupCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const rollup = readZkDnaRollup(themeExperimentJson);
  const gate = evaluateZkDnaRollupGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">ZK DNA rollup</CardTitle>
        <CardDescription>
          Groth16-sim proof of federated DNA trail validity — PQC seals never revealed (Y1 + U1).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isZkDnaRollupEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isZkDnaRollupEnabled() ? "ZK DNA rollup enabled" : "Set THEME_EXPERIMENT_ZK_DNA_ROLLUP=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {rollup ? (
          <p className="font-mono text-xs">
            {rollup.rollups.length} proofs · verification{" "}
            {Math.round(rollup.verificationRate * 100)}%
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/zk-dna-rollup · header x-kos-zk-dna-rollup</p>
      </CardContent>
    </Card>
  );
}
