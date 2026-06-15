import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateRecursiveZkDnaRollupGate,
  isRecursiveZkDnaRollupEnabled,
  readRecursiveZkDnaRollup,
} from "@/lib/compliance/recursive-zk-dna-rollup";

export function ThemeExperimentRecursiveZkDnaCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const recursive = readRecursiveZkDnaRollup(themeExperimentJson);
  const gate = evaluateRecursiveZkDnaRollupGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Recursive ZK DNA rollup</CardTitle>
        <CardDescription>
          Batched Groth16 over Z1 rollup-proof chain — seals remain hidden (Z1 + U1).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p
          className={
            isRecursiveZkDnaRollupEnabled() ? "text-emerald-700" : "text-muted-foreground"
          }
        >
          {isRecursiveZkDnaRollupEnabled()
            ? "Recursive ZK DNA rollup enabled"
            : "Set THEME_EXPERIMENT_RECURSIVE_ZK_DNA_ROLLUP=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {recursive ? (
          <p className="font-mono text-xs">
            {recursive.batches.length} batches · verification{" "}
            {Math.round(recursive.verificationRate * 100)}%
          </p>
        ) : null}
        <p className="font-mono text-[10px]">
          Cron: /api/cron/recursive-zk-dna-rollup · x-kos-recursive-zk-dna-rollup
        </p>
      </CardContent>
    </Card>
  );
}
