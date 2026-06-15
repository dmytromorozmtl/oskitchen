import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildIrapEssentialEightEvidence,
  isIrapEssentialEightEnabled,
} from "@/lib/compliance/irap-essential-eight";

export function IrapEssentialEightCard() {
  const ev = buildIrapEssentialEightEvidence();

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">IRAP + Essential Eight (AU)</CardTitle>
        <CardDescription>
          StateRAMP/TX-RAMP → Australian IRAP readiness + Essential Eight maturity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isIrapEssentialEightEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isIrapEssentialEightEnabled() ? "IRAP/E8 enabled" : "Set THEME_EXPERIMENT_IRAP_ESSENTIAL8=1"}
        </p>
        <p>
          IRAP ready: {ev.irapReady ? "yes" : "pending"} · E8 {ev.essentialEightMaturity}
        </p>
        <p className="font-mono text-[10px]">Cron: /api/cron/irap-essential-eight-monitoring</p>
      </CardContent>
    </Card>
  );
}
