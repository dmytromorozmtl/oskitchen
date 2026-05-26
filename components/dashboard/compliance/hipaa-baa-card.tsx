import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildHipaaBaaEvidenceBinder, isHipaaBaaEnabled } from "@/lib/compliance/hipaa-baa";

export function HipaaBaaCard() {
  const binder = buildHipaaBaaEvidenceBinder([]);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">HIPAA BAA (healthcare)</CardTitle>
        <CardDescription>
          PHI redaction in audit · break-glass log · monthly evidence binder to S3.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isHipaaBaaEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isHipaaBaaEnabled() ? "HIPAA pack enabled" : "Set THEME_EXPERIMENT_HIPAA_BAA=1"}
        </p>
        <ul className="list-inside list-disc text-xs text-muted-foreground">
          {binder.controls.map((c) => (
            <li key={c.id}>
              {c.id}: {c.status}
            </li>
          ))}
        </ul>
        <p className="font-mono text-[10px]">Cron: /api/cron/hipaa-baa-evidence-binder</p>
      </CardContent>
    </Card>
  );
}
