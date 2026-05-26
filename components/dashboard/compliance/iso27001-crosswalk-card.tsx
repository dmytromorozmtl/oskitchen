import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildIso27001Attestation } from "@/lib/compliance/iso27001-crosswalk";

export function Iso27001CrosswalkCard() {
  const att = buildIso27001Attestation();

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">ISO 27001 crosswalk</CardTitle>
        <CardDescription>
          SOC2 CC → ISO/IEC 27001:2022 Annex A. Quarterly attestation PDF to S3.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="text-muted-foreground">Quarter {att.quarter} · {att.controls.length} ISO controls mapped</p>
        <ul className="list-inside list-disc text-xs text-muted-foreground">
          {att.controls.map((c) => (
            <li key={c.isoControlId}>
              {c.isoControlId} ← {c.soc2Controls.join(", ")} ({c.cronPaths.length} crons)
            </li>
          ))}
        </ul>
        <p className="font-mono text-[10px] text-muted-foreground">
          Cron: /api/cron/iso27001-quarterly-attestation
        </p>
      </CardContent>
    </Card>
  );
}
