import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildPspfNzDtaEvidence,
  evaluatePspfNzDtaPublishGate,
  isPspfNzDtaEnabled,
} from "@/lib/compliance/pspf-nz-dta-crosswalk";

export function PspfNzDtaCard({ themeExperimentJson }: { themeExperimentJson?: unknown }) {
  const ev = buildPspfNzDtaEvidence();
  const gate = themeExperimentJson
    ? evaluatePspfNzDtaPublishGate(themeExperimentJson)
    : evaluatePspfNzDtaPublishGate(null);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">PSPF + NZ DTA</CardTitle>
        <CardDescription>
          AU Protective Security Policy Framework + NZ Data &amp; Analytics from W3 ISMAP/NZISM.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isPspfNzDtaEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isPspfNzDtaEnabled() ? "PSPF/NZ DTA enabled" : "Set THEME_EXPERIMENT_PSPF_NZ_DTA=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        <p>
          PSPF: {ev.pspfReady ? "ready" : "pending"} · NZ DTA: {ev.nzDtaReady ? "ready" : "pending"}
        </p>
        <p className="font-mono text-[10px]">Cron: /api/cron/pspf-nz-dta-monitoring</p>
      </CardContent>
    </Card>
  );
}
