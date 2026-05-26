import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildSoc2Type2EvidenceBinder,
  EXPERIMENT_CRON_CONTROLS,
} from "@/lib/compliance/soc2-control-mapping";

export function Soc2Type2ControlsCard() {
  const binder = buildSoc2Type2EvidenceBinder();

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">SOC2 Type II controls</CardTitle>
        <CardDescription>
          Cron → CC6.1 / CC7.2 / CC8.1 mapping. Monthly PDF evidence binder.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="text-muted-foreground">
          Period {binder.period} · {EXPERIMENT_CRON_CONTROLS.length} crons · auditor API{" "}
          <code className="rounded bg-muted px-1 text-xs">/api/compliance/auditor/experiment-controls</code>
        </p>
        <ul className="list-inside list-disc text-xs text-muted-foreground">
          {binder.controls.map((c) => (
            <li key={c.controlId}>
              {c.controlId}: {c.cronPaths.length} crons ({c.status})
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
