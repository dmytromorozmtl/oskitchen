import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildFedRampHighMonitoringEvidence,
  isFedRampHighEnabled,
} from "@/lib/compliance/fedramp-high-crosswalk";

export function FedRampHighCard() {
  const ev = buildFedRampHighMonitoringEvidence();

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">FedRAMP High P-ATO</CardTitle>
        <CardDescription>
          SOC2 / ISO 27001 crosswalk · continuous monitoring evidence to S3.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isFedRampHighEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isFedRampHighEnabled() ? "FedRAMP High pack enabled" : "Set THEME_EXPERIMENT_FEDRAMP_HIGH=1"}
        </p>
        <p className={ev.pAtoReady ? "text-emerald-700" : "text-amber-700"}>
          P-ATO ready: {ev.pAtoReady ? "yes" : "pending"} · period {ev.period}
        </p>
        <ul className="list-inside list-disc text-xs text-muted-foreground">
          {ev.controls.slice(0, 6).map((c) => (
            <li key={c.controlId}>
              {c.controlId}: {c.continuousMonitoring} ({c.mappedFrom.length} mapped)
            </li>
          ))}
        </ul>
        <p className="font-mono text-[10px]">Cron: /api/cron/fedramp-high-monitoring</p>
      </CardContent>
    </Card>
  );
}
