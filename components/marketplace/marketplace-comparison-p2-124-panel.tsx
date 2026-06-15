import Link from "next/link";
import { Columns3, Layers, Search, ShoppingCart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MARKETPLACE_COMPARISON_P2_124_CAPABILITIES,
  MARKETPLACE_COMPARISON_P2_124_EYEBROW,
  MARKETPLACE_COMPARISON_P2_124_HEADLINE,
  MARKETPLACE_COMPARISON_P2_124_OPERATOR_LINKS,
  MARKETPLACE_COMPARISON_P2_124_SUBLINE,
} from "@/lib/marketplace/marketplace-comparison-p2-124-content";
import { MARKETPLACE_COMPARISON_P2_124_TEST_IDS } from "@/lib/marketplace/marketplace-comparison-p2-124-policy";
import type { MarketplaceComparisonP2_124Snapshot } from "@/services/marketplace/marketplace-comparison-p2-124-service";

const CAPABILITY_ICONS = [Columns3, Search, Layers, ShoppingCart] as const;

function statusVariant(status: string): "default" | "secondary" | "outline" {
  switch (status) {
    case "ready":
      return "default";
    case "partial":
      return "secondary";
    default:
      return "outline";
  }
}

/** Blueprint P2-124 — marketplace comparison tool panel. */
export function MarketplaceComparisonP2_124Panel({
  snapshot,
}: {
  snapshot: MarketplaceComparisonP2_124Snapshot;
}) {
  return (
    <div className="space-y-8" data-testid={MARKETPLACE_COMPARISON_P2_124_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {MARKETPLACE_COMPARISON_P2_124_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {MARKETPLACE_COMPARISON_P2_124_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {MARKETPLACE_COMPARISON_P2_124_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live catalog data"} · readiness{" "}
          {snapshot.readinessScore}% · policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Offers</CardDescription>
            <CardTitle className="text-2xl">{snapshot.compareOfferCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Vendors</CardDescription>
            <CardTitle className="text-2xl">{snapshot.vendorCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Sort options</CardDescription>
            <CardTitle className="text-2xl">{snapshot.sortOptionCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Tray SKUs</CardDescription>
            <CardTitle className="text-2xl">{snapshot.trayProductCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {MARKETPLACE_COMPARISON_P2_124_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? Columns3;
          const block = snapshot.blocks[index];
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={MARKETPLACE_COMPARISON_P2_124_TEST_IDS[index + 1]}
            >
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" aria-hidden />
                    <CardTitle className="text-base">{capability.label}</CardTitle>
                  </div>
                  <Badge variant={statusVariant(block?.status ?? "missing")}>
                    {block?.status ?? "missing"}
                  </Badge>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {capability.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <p>{block?.summary ?? "Not analyzed"}</p>
                <Button asChild variant="link" size="sm" className="h-auto p-0">
                  <Link href={capability.route}>Open {capability.label.toLowerCase()}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {MARKETPLACE_COMPARISON_P2_124_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
