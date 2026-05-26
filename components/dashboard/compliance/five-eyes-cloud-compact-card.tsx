import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildFiveEyesCloudCompactEvidence,
  evaluateFiveEyesCloudCompactGate,
  isFiveEyesCloudCompactEnabled,
} from "@/lib/compliance/five-eyes-cloud-compact";

export function FiveEyesCloudCompactCard({ themeExperimentJson }: { themeExperimentJson?: unknown }) {
  const ev = buildFiveEyesCloudCompactEvidence();
  const gate = evaluateFiveEyesCloudCompactGate(themeExperimentJson ?? null);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Five Eyes + AUKUS cloud compact</CardTitle>
        <CardDescription>
          Sovereign data residency attestation derived from SOCI + NZ GCDO (Y3).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isFiveEyesCloudCompactEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isFiveEyesCloudCompactEnabled()
            ? "Five Eyes cloud compact enabled"
            : "Set THEME_EXPERIMENT_FIVE_EYES_CLOUD_COMPACT=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        <p>
          Five Eyes: {ev.fiveEyesReady ? "ready" : "pending"} · AUKUS:{" "}
          {ev.aukusReady ? "ready" : "pending"}
        </p>
        <p className="font-mono text-[10px]">Cron: /api/cron/five-eyes-cloud-compact-monitoring</p>
      </CardContent>
    </Card>
  );
}
