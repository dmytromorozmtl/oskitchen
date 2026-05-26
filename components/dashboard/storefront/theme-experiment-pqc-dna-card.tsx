import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluatePqcDnaArchivalGate,
  isPqcDnaArchivalEnabled,
  readPqcDnaArchival,
} from "@/lib/compliance/pqc-dna-archival";

export function ThemeExperimentPqcDnaCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const pqc = readPqcDnaArchival(themeExperimentJson);
  const gate = evaluatePqcDnaArchivalGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Post-quantum DNA archival</CardTitle>
        <CardDescription>
          ML-DSA fingerprint layer over W1 ATGC hash chain for long-term compliance archive.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isPqcDnaArchivalEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isPqcDnaArchivalEnabled()
            ? "PQC DNA archival enabled"
            : "Set THEME_EXPERIMENT_PQC_DNA_ARCHIVAL=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {pqc ? (
          <p className="font-mono text-xs">
            {pqc.sealedBlockCount} seals · chain {pqc.chainSealed ? "sealed" : "pending"}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/pqc-dna-archival-seal</p>
      </CardContent>
    </Card>
  );
}
