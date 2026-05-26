import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateIso42001CertBodyPublishGate,
  isIso42001CertBodyEnabled,
  readIso42001CertBodyPack,
} from "@/lib/compliance/iso-42001-cert-body";

export function Iso42001CertBodyCard({ themeExperimentJson }: { themeExperimentJson?: unknown }) {
  const pack = themeExperimentJson ? readIso42001CertBodyPack(themeExperimentJson) : null;
  const gate = themeExperimentJson
    ? evaluateIso42001CertBodyPublishGate(themeExperimentJson)
    : { passed: true, headline: "No storefront context", detail: "" };

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">ISO 42001 cert body</CardTitle>
        <CardDescription>
          External auditor portal + certification body webhook attestations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isIso42001CertBodyEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isIso42001CertBodyEnabled()
            ? "Cert body API enabled"
            : "Set THEME_EXPERIMENT_ISO_42001_CERT_BODY=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {pack?.attestations.length ? (
          <p className="font-mono text-xs">
            Latest: {pack.attestations[pack.attestations.length - 1]?.certBodyName} ·{" "}
            {pack.latestVerdict}
          </p>
        ) : (
          <p className="text-muted-foreground">Awaiting cert body webhook or seed cron.</p>
        )}
        <p className="font-mono text-[10px]">
          Webhook: iso-42001-cert-body-attest · cron: iso-42001-cert-body-seed
        </p>
      </CardContent>
    </Card>
  );
}
