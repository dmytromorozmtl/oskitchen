import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateDnaAuditTrailGate,
  isDnaAuditTrailEnabled,
  readDnaAuditTrail,
} from "@/lib/compliance/dna-encoded-audit-trail";

export function ThemeExperimentDnaAuditCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const trail = readDnaAuditTrail(themeExperimentJson);
  const gate = evaluateDnaAuditTrailGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">DNA-encoded audit trail</CardTitle>
        <CardDescription>
          Immutable hash chain with ATGC encoding for long-term compliance archive.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isDnaAuditTrailEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isDnaAuditTrailEnabled()
            ? "DNA audit trail enabled"
            : "Set THEME_EXPERIMENT_DNA_AUDIT_TRAIL=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {trail ? (
          <p className="font-mono text-xs">
            {trail.blocks.length} blocks · {trail.totalBasePairs} bp · chain{" "}
            {trail.chainValid ? "valid" : "invalid"}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/dna-audit-trail-archive</p>
      </CardContent>
    </Card>
  );
}
