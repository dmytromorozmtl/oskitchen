import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateIso42001AiMsPublishGate,
  isIso42001AiMsEnabled,
  readIso42001AiMsPack,
} from "@/lib/compliance/iso-42001-ai-ms";

export function Iso42001Card({ themeExperimentJson }: { themeExperimentJson?: unknown }) {
  const pack = themeExperimentJson ? readIso42001AiMsPack(themeExperimentJson) : null;
  const gate = themeExperimentJson
    ? evaluateIso42001AiMsPublishGate(themeExperimentJson)
    : { passed: true, headline: "No storefront context", detail: "" };

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">ISO/IEC 42001 AI MS</CardTitle>
        <CardDescription>
          NIST AI RMF + EU AI Act → ISO 42001 management system attestation pack.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isIso42001AiMsEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isIso42001AiMsEnabled() ? "ISO 42001 enabled" : "Set THEME_EXPERIMENT_ISO_42001=1"}
        </p>
        {pack ? (
          <>
            <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
            <p className="text-muted-foreground">{gate.detail}</p>
            <p className="font-mono text-xs">{pack.certificationTarget}</p>
          </>
        ) : (
          <p className="text-muted-foreground">Run iso-42001-ai-ms-seed cron after NIST RMF + EU AI Act.</p>
        )}
        <p className="font-mono text-[10px]">Cron: /api/cron/iso-42001-ai-ms-seed</p>
      </CardContent>
    </Card>
  );
}
