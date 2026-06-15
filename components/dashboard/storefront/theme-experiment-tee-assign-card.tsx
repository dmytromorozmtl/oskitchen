import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateTeeAttestationPublishGate,
  isTeeAssignEnabled,
  readTeeAssignmentSnapshot,
  teeEnclaveType,
} from "@/lib/storefront/theme-experiment-tee-assign";

export function ThemeExperimentTeeAssignCard({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readTeeAssignmentSnapshot(themeExperimentJson);
  const gate = evaluateTeeAttestationPublishGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">TEE attested assignment</CardTitle>
        <CardDescription>
          {isTeeAssignEnabled()
            ? `Confidential computing (${teeEnclaveType()}) — SGX/SEV attestation before publish.`
            : "Set THEME_EXPERIMENT_TEE_ASSIGN=1."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.quotes.length} quotes · {Math.round(snap.attestationPassRate * 100)}% verified
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
