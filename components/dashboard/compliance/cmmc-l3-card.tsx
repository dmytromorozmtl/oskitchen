import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildCmmcL3MonitoringEvidence,
  isCmmcL3Enabled,
} from "@/lib/compliance/cmmc-l3-crosswalk";

export function CmmcL3Card() {
  const ev = buildCmmcL3MonitoringEvidence();

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">CMMC Level 3 (DoD contractors)</CardTitle>
        <CardDescription>
          FedRAMP High + NIST 800-171 → CMMC L3 practices · continuous monitoring evidence.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isCmmcL3Enabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isCmmcL3Enabled() ? "CMMC L3 pack enabled" : "Set THEME_EXPERIMENT_CMMC_L3=1"}
        </p>
        <p className={ev.dodContractorReady ? "text-emerald-700" : "text-amber-700"}>
          DoD contractor ready: {ev.dodContractorReady ? "yes" : "pending"} · {ev.period}
        </p>
        <ul className="list-inside list-disc text-xs text-muted-foreground">
          {ev.practices.slice(0, 5).map((p) => (
            <li key={p.practiceId}>
              {p.practiceId} [{p.continuousMonitoring}] NIST {p.nist800171}
            </li>
          ))}
        </ul>
        <p className="font-mono text-[10px]">Cron: /api/cron/cmmc-l3-monitoring</p>
      </CardContent>
    </Card>
  );
}
