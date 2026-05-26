import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildSociNzGcdoEvidence,
  evaluateSociNzGcdoPublishGate,
  isSociNzGcdoEnabled,
} from "@/lib/compliance/soci-nz-gcdo-crosswalk";

export function SociNzGcdoCard({ themeExperimentJson }: { themeExperimentJson?: unknown }) {
  const ev = buildSociNzGcdoEvidence();
  const gate = themeExperimentJson
    ? evaluateSociNzGcdoPublishGate(themeExperimentJson)
    : evaluateSociNzGcdoPublishGate(null);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">SOCI + NZ GCDO</CardTitle>
        <CardDescription>
          AU Security of Critical Infrastructure + NZ Government Chief Digital Officer model.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isSociNzGcdoEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isSociNzGcdoEnabled() ? "SOCI/NZ GCDO enabled" : "Set THEME_EXPERIMENT_SOCI_NZ_GCDO=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        <p>
          SOCI: {ev.sociReady ? "ready" : "pending"} · GCDO: {ev.nzGcdoReady ? "ready" : "pending"}
        </p>
        <p className="font-mono text-[10px]">Cron: /api/cron/soci-nz-gcdo-monitoring</p>
      </CardContent>
    </Card>
  );
}
