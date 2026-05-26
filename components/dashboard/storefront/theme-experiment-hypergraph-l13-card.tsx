import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateHypergraphL13HomotopyTypeTheoreticAnchorGate,
  hypergraphL13HomotopyLevel,
  isHypergraphL13HomotopyTypeTheoreticAnchorEnabled,
  readHypergraphL13HomotopyTypeTheoretic,
} from "@/lib/compliance/hypergraph-l13-homotopy-type-theoretic-anchor";

export function ThemeExperimentHypergraphL13Card({
  themeExperimentJson,
}: {
  themeExperimentJson: unknown;
}) {
  const snap = readHypergraphL13HomotopyTypeTheoretic(themeExperimentJson);
  const gate = evaluateHypergraphL13HomotopyTypeTheoreticAnchorGate(themeExperimentJson);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Hypergraph L13 homotopy type-theoretic</CardTitle>
        <CardDescription>HoTT anchor over AN3 L12 categorical quantum (AO3).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isHypergraphL13HomotopyTypeTheoreticAnchorEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isHypergraphL13HomotopyTypeTheoreticAnchorEnabled()
            ? "L13 HoTT anchor enabled"
            : "Set THEME_EXPERIMENT_HYPERGRAPH_L13_HOMOTOPY_TYPE_THEORETIC_ANCHOR=1"}
        </p>
        <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
        <p className="text-muted-foreground">{gate.detail}</p>
        {snap ? (
          <p className="font-mono text-xs">
            {snap.latestAnchorId ?? "—"} · level {hypergraphL13HomotopyLevel()}
          </p>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/hypergraph-l13-homotopy-type-theoretic-anchor</p>
      </CardContent>
    </Card>
  );
}
