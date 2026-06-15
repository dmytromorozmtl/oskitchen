import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPciSaqAttestation, isPciDssSaqEnabled } from "@/lib/compliance/pci-dss-saq";

export function PciDssSaqCard() {
  const att = buildPciSaqAttestation();

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">PCI-DSS SAQ-A</CardTitle>
        <CardDescription>
          Cardholder data boundary checks · quarterly attestation PDF.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={att.overallPassed ? "text-emerald-700" : "text-amber-700"}>
          {att.overallPassed ? "All boundary checks passed" : "One or more checks failed"}
        </p>
        <p className="text-muted-foreground">
          {isPciDssSaqEnabled() ? `Quarter ${att.quarter} · level ${att.merchantLevel}` : "Set THEME_EXPERIMENT_PCI_DSS_SAQ=1"}
        </p>
        <ul className="list-inside list-disc text-xs text-muted-foreground">
          {att.checks.map((c) => (
            <li key={c.id}>
              {c.id}: {c.passed ? "pass" : "fail"} — {c.description}
            </li>
          ))}
        </ul>
        <p className="font-mono text-[10px]">Cron: /api/cron/pci-dss-saq-attestation</p>
      </CardContent>
    </Card>
  );
}
