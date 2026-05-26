import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateOecdStateAgAiTransparencyMeshGate,
  isOecdStateAgAiTransparencyMeshEnabled,
  readOecdStateAgAiTransparencyMesh,
} from "@/lib/compliance/oecd-state-ag-ai-transparency-mesh";

export function OecdStateAgAiTransparencyMeshCard({
  themeExperimentJson,
}: {
  themeExperimentJson?: unknown;
}) {
  const snap = themeExperimentJson ? readOecdStateAgAiTransparencyMesh(themeExperimentJson) : null;
  const gate = themeExperimentJson
    ? evaluateOecdStateAgAiTransparencyMeshGate(themeExperimentJson)
    : { passed: true, headline: "No storefront context", detail: "" };

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">OECD / state-AG transparency mesh</CardTitle>
        <CardDescription>
          Multilateral disclosure mesh over AH2 FTC + AF2 NIST (AI2).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p
          className={
            isOecdStateAgAiTransparencyMeshEnabled() ? "text-emerald-700" : "text-muted-foreground"
          }
        >
          {isOecdStateAgAiTransparencyMeshEnabled()
            ? "OECD state-AG transparency mesh enabled"
            : "Set THEME_EXPERIMENT_OECD_STATE_AG_AI_TRANSPARENCY_MESH=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.events.length} events · {snap.jurisdictionQuorum} jurisdictions
          </p>
        ) : null}
        <p className="font-mono text-[10px]">
          Cron: /api/cron/oecd-state-ag-ai-transparency-mesh-sync · Webhook:
          /api/webhooks/oecd-state-ag-ai-transparency-mesh
        </p>
      </CardContent>
    </Card>
  );
}
