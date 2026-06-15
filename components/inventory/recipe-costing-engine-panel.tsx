import Link from "next/link";
import { Coins, Percent, Scale, Trash2, UtensilsCrossed, Wheat } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RECIPE_COSTING_ENGINE_P2_97_CAPABILITIES,
  RECIPE_COSTING_ENGINE_P2_97_EYEBROW,
  RECIPE_COSTING_ENGINE_P2_97_HEADLINE,
  RECIPE_COSTING_ENGINE_P2_97_OPERATOR_LINKS,
  RECIPE_COSTING_ENGINE_P2_97_SUBLINE,
} from "@/lib/inventory/recipe-costing-engine-p2-97-content";
import { RECIPE_COSTING_ENGINE_P2_97_TEST_IDS } from "@/lib/inventory/recipe-costing-engine-p2-97-policy";
import type { RecipeCostingEngineSnapshot } from "@/services/inventory/recipe-costing-engine-p2-97-service";

const CAPABILITY_ICONS = [Wheat, Scale, Trash2, UtensilsCrossed, Percent] as const;

/** Blueprint P2-97 — recipe costing engine panel. */
export function RecipeCostingEnginePanel({ snapshot }: { snapshot: RecipeCostingEngineSnapshot }) {
  return (
    <div className="space-y-8" data-testid={RECIPE_COSTING_ENGINE_P2_97_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {RECIPE_COSTING_ENGINE_P2_97_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">{RECIPE_COSTING_ENGINE_P2_97_HEADLINE}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {RECIPE_COSTING_ENGINE_P2_97_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live costing run"} · {snapshot.itemCount} item(s) ·{" "}
          {snapshot.recipeCount} recipe(s) in workspace · policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Avg margin</CardDescription>
            <CardTitle className="text-2xl">{snapshot.avgMarginPercent.toFixed(1)}%</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Below target ({snapshot.targetMarginPercent}%)</CardDescription>
            <CardTitle className="text-2xl">{snapshot.itemsBelowTargetMargin}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Items costed</CardDescription>
            <CardTitle className="text-2xl">{snapshot.itemCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {RECIPE_COSTING_ENGINE_P2_97_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? Coins;
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={RECIPE_COSTING_ENGINE_P2_97_TEST_IDS[index + 1]}
            >
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <CardTitle className="text-base">{capability.label}</CardTitle>
                  <CardDescription className="mt-1">{capability.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-xs text-muted-foreground">{capability.module}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Margin by item</h3>
        <div className="grid gap-3">
          {snapshot.items.map((item) => (
            <Card key={item.recipeId} className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{item.recipeName}</CardTitle>
                    <CardDescription>
                      Yield {item.yieldQuantity} · portion ${item.portionCost.toFixed(2)} · sale $
                      {item.salePrice.toFixed(2)}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={item.margin.grossMarginPercent >= snapshot.targetMarginPercent ? "default" : "destructive"}
                  >
                    {item.margin.grossMarginPercent.toFixed(1)}% margin
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Ingredients ${item.ingredientCostPerPortion.toFixed(2)} · Labor $
                  {item.laborCostPerPortion.toFixed(2)} · Packaging ${item.packagingCostPerPortion.toFixed(2)}
                </p>
                {item.ingredientLines.length > 0 && (
                  <ul className="list-inside list-disc text-xs">
                    {item.ingredientLines.slice(0, 3).map((line) => (
                      <li key={line.ingredientId}>
                        {line.ingredientName}: {line.quantity} × ${line.costPerUnit.toFixed(2)} +{" "}
                        {line.wastePercent}% waste → ${line.costPerPortion.toFixed(2)}/portion
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {RECIPE_COSTING_ENGINE_P2_97_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
