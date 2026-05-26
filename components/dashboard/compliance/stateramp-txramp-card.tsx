import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildStateRampTxRampEvidence,
  isStateRampTxRampEnabled,
} from "@/lib/compliance/stateramp-txramp-crosswalk";

export function StateRampTxRampCard() {
  const ev = buildStateRampTxRampEvidence();

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">StateRAMP + TX-RAMP</CardTitle>
        <CardDescription>
          CMMC L3 → state / Texas cloud procurement continuous monitoring.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isStateRampTxRampEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isStateRampTxRampEnabled() ? "StateRAMP/TX-RAMP enabled" : "Set THEME_EXPERIMENT_STATERAMP_TXRAMP=1"}
        </p>
        <p>
          StateRAMP: {ev.stateRampReady ? "ready" : "pending"} · TX-RAMP:{" "}
          {ev.txRampReady ? "ready" : "pending"}
        </p>
        <p className="font-mono text-[10px]">Cron: /api/cron/stateramp-txramp-monitoring</p>
      </CardContent>
    </Card>
  );
}
