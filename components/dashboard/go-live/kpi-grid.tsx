import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type GoLiveKpis = {
  readiness: number;
  criticalBlockers: number;
  riskLevel: string;
  integrationCertification: string;
  integrationCertificationHint?: string;
  integrationCertificationTone?: "danger" | "warning" | "success" | "info" | "neutral";
  simulationStatus: string;
  launchEta: string;
  unresolvedIncidents: number;
  approvalsPending: number;
};

function Tile({ label, value, hint, tone }: { label: string; value: string | number; hint?: string; tone?: "danger" | "warning" | "success" | "info" | "neutral" }) {
  const cls = tone === "danger" ? "text-rose-600" : tone === "warning" ? "text-amber-600" : tone === "success" ? "text-emerald-600" : "";
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className={`text-2xl tabular-nums ${cls}`}>{value}</CardTitle>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardHeader>
    </Card>
  );
}

export function GoLiveKpiGrid({ tiles }: { tiles: GoLiveKpis }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Tile label="Readiness" value={`${tiles.readiness}%`} tone={tiles.readiness >= 80 ? "success" : tiles.readiness >= 50 ? "warning" : "danger"} />
      <Tile label="Critical blockers" value={tiles.criticalBlockers} tone={tiles.criticalBlockers > 0 ? "danger" : "success"} />
      <Tile label="Launch risk" value={tiles.riskLevel} tone={tiles.riskLevel === "CRITICAL" || tiles.riskLevel === "HIGH" ? "danger" : tiles.riskLevel === "MEDIUM" ? "warning" : "success"} />
      <Tile
        label="External certifications"
        value={tiles.integrationCertification}
        hint={tiles.integrationCertificationHint}
        tone={tiles.integrationCertificationTone}
      />
      <Tile label="Simulation status" value={tiles.simulationStatus} />
      <Tile label="Launch ETA" value={tiles.launchEta} />
      <Tile label="Unresolved incidents" value={tiles.unresolvedIncidents} tone={tiles.unresolvedIncidents > 0 ? "warning" : "success"} />
      <Tile label="Approvals pending" value={tiles.approvalsPending} tone={tiles.approvalsPending > 0 ? "warning" : "success"} />
    </div>
  );
}
