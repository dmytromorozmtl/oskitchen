import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildIsmapNzismEvidence,
  evaluateIsmapNzismPublishGate,
  isIsmapNzismEnabled,
} from "@/lib/compliance/ismap-nzism-crosswalk";

export function IsmapNzismCard({ themeExperimentJson }: { themeExperimentJson?: unknown }) {
  const ev = buildIsmapNzismEvidence();
  const gate = themeExperimentJson
    ? evaluateIsmapNzismPublishGate(themeExperimentJson)
    : evaluateIsmapNzismPublishGate(null);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">ISMAP + NZISM (AU/NZ gov)</CardTitle>
        <CardDescription>
          IRAP/Essential Eight → ISMAP (AU) + NZISM (NZ) for government cloud procurement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isIsmapNzismEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isIsmapNzismEnabled() ? "ISMAP/NZISM enabled" : "Set THEME_EXPERIMENT_ISMAP_NZISM=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        <p>
          ISMAP: {ev.ismapReady ? "ready" : "pending"} · NZISM: {ev.nzismReady ? "ready" : "pending"}
        </p>
        <p className="font-mono text-[10px]">Cron: /api/cron/ismap-nzism-monitoring</p>
      </CardContent>
    </Card>
  );
}
