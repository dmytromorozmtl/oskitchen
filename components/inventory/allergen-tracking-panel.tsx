import Link from "next/link";
import { AlertTriangle, BookOpen, ChefHat } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ALLERGEN_TRACKING_P2_101_CAPABILITIES,
  ALLERGEN_TRACKING_P2_101_EYEBROW,
  ALLERGEN_TRACKING_P2_101_HEADLINE,
  ALLERGEN_TRACKING_P2_101_OPERATOR_LINKS,
  ALLERGEN_TRACKING_P2_101_SUBLINE,
} from "@/lib/inventory/allergen-tracking-p2-101-content";
import { ALLERGEN_TRACKING_P2_101_TEST_IDS } from "@/lib/inventory/allergen-tracking-p2-101-policy";
import { displayAllergenKey } from "@/lib/nutrition/allergen-registry";
import type { AllergenTrackingSnapshot } from "@/services/inventory/allergen-tracking-p2-101-service";

const CAPABILITY_ICONS = [BookOpen, ChefHat, AlertTriangle] as const;

/** Blueprint P2-101 — allergen tracking panel. */
export function AllergenTrackingPanel({ snapshot }: { snapshot: AllergenTrackingSnapshot }) {
  return (
    <div className="space-y-8" data-testid={ALLERGEN_TRACKING_P2_101_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {ALLERGEN_TRACKING_P2_101_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">{ALLERGEN_TRACKING_P2_101_HEADLINE}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {ALLERGEN_TRACKING_P2_101_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live menu data"} · {snapshot.registryCount}{" "}
          registry keys · {snapshot.unverifiedRecipeCount} unverified · policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Registry keys</CardDescription>
            <CardTitle className="text-2xl">{snapshot.registryCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Recipe rollups</CardDescription>
            <CardTitle className="text-2xl">{snapshot.recipeRollupCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Inventory links</CardDescription>
            <CardTitle className="text-2xl">{snapshot.inventoryLinkCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {ALLERGEN_TRACKING_P2_101_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? BookOpen;
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={ALLERGEN_TRACKING_P2_101_TEST_IDS[index + 1]}
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

      {snapshot.recipeRollups.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Recipe allergen rollups</h3>
          <div className="grid gap-2">
            {snapshot.recipeRollups.slice(0, 6).map((row) => (
              <Card key={row.recipeId} className="border-border/80 shadow-sm">
                <CardHeader className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-sm">{row.productName}</CardTitle>
                    <Badge variant={row.verificationStatus === "VERIFIED" ? "default" : "secondary"}>
                      {row.verificationStatus}
                    </Badge>
                  </div>
                  <CardDescription>{row.containsStatement}</CardDescription>
                  <CardContent className="flex flex-wrap gap-1 px-0 pt-2">
                    {row.rolledUpAllergens.map((key) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {displayAllergenKey(key)}
                      </Badge>
                    ))}
                  </CardContent>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {snapshot.inventoryLinks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Inventory ingredient linkage</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {snapshot.inventoryLinks.slice(0, 6).map((row) => (
              <Card key={row.ingredientId} className="border-border/80 shadow-sm">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">{row.ingredientName}</CardTitle>
                  <CardDescription>
                    {row.category ?? "Uncategorized"} · {row.linkedRecipes.length} recipe(s)
                  </CardDescription>
                  <CardContent className="flex flex-wrap gap-1 px-0 pt-2">
                    {row.allergenKeys.map((key) => (
                      <Badge key={key} variant="destructive" className="text-xs">
                        {displayAllergenKey(key)}
                      </Badge>
                    ))}
                  </CardContent>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {ALLERGEN_TRACKING_P2_101_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
