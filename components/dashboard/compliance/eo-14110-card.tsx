import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  evaluateEo14110InventoryPublishGate,
  isEo14110InventoryEnabled,
  readEo14110InventoryPack,
} from "@/lib/compliance/eo-14110-ai-inventory";

export function Eo14110Card({ themeExperimentJson }: { themeExperimentJson?: unknown }) {
  const pack = themeExperimentJson ? readEo14110InventoryPack(themeExperimentJson) : null;
  const gate = themeExperimentJson
    ? evaluateEo14110InventoryPublishGate(themeExperimentJson)
    : { passed: true, headline: "No storefront context", detail: "" };

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">US EO 14110 AI inventory</CardTitle>
        <CardDescription>
          Model inventory · dual-use screening · incident log (extends EU/UK packs).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={isEo14110InventoryEnabled() ? "text-emerald-700" : "text-muted-foreground"}>
          {isEo14110InventoryEnabled() ? "EO 14110 pack enabled" : "Set THEME_EXPERIMENT_EO_14110_INVENTORY=1"}
        </p>
        {pack ? (
          <>
            <p className={gate.passed ? "text-emerald-700" : "text-amber-700"}>{gate.headline}</p>
            <p className="text-muted-foreground">{gate.detail}</p>
            <p className="font-mono text-xs">
              {pack.modelInventory.length} models · dual-use {pack.dualUseScreeningPassed ? "pass" : "fail"}
            </p>
          </>
        ) : null}
        <p className="font-mono text-[10px]">Cron: /api/cron/eo-14110-inventory-seed</p>
      </CardContent>
    </Card>
  );
}
