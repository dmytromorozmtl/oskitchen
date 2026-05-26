import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateIso42001Stage2PublishGate,
  isIso42001Stage2Enabled,
  readIso42001Stage2Pack,
} from "@/lib/compliance/iso-42001-stage2";

export function Iso42001Stage2Card({ themeExperimentJson }: { themeExperimentJson?: unknown }) {
  const stage2 = themeExperimentJson ? readIso42001Stage2Pack(themeExperimentJson) : null;
  const gate = themeExperimentJson
    ? evaluateIso42001Stage2PublishGate(themeExperimentJson)
    : { passed: true, headline: "No storefront context", detail: "" };

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">ISO/IEC 42001 Stage 2</CardTitle>
        <CardDescription>
          Surveillance audit automation, corrective actions, management review cadence.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isIso42001Stage2Enabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isIso42001Stage2Enabled()
            ? "ISO 42001 Stage 2 enabled"
            : "Set THEME_EXPERIMENT_ISO_42001_STAGE2=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {stage2 ? (
          <p className="font-mono text-xs">
            CAPA closed {stage2.correctiveActions.length - stage2.openCorrectiveActions}/
            {stage2.correctiveActions.length} · review{" "}
            {stage2.nextManagementReviewAt?.slice(0, 10) ?? "n/a"}
          </p>
        ) : (
          <p className="text-muted-foreground">Run iso-42001-stage2-surveillance cron after W4 pack.</p>
        )}
        <p className="font-mono text-[10px]">Cron: /api/cron/iso-42001-stage2-surveillance</p>
      </CardContent>
    </Card>
  );
}
