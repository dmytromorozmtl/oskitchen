import Link from "next/link";
import { ClipboardList, PackageSearch, Store } from "lucide-react";

import { MarketplaceEmptyState } from "@/components/marketplace/marketplace-empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MARKETPLACE_EMPTY_STATES_P2_123_CAPABILITIES,
  MARKETPLACE_EMPTY_STATES_P2_123_EYEBROW,
  MARKETPLACE_EMPTY_STATES_P2_123_HEADLINE,
  MARKETPLACE_EMPTY_STATES_P2_123_OPERATOR_LINKS,
  MARKETPLACE_EMPTY_STATES_P2_123_SUBLINE,
} from "@/lib/marketplace/marketplace-empty-states-p2-123-content";
import { MARKETPLACE_EMPTY_STATES_P2_123_TEST_IDS } from "@/lib/marketplace/marketplace-empty-states-p2-123-policy";
import type { MarketplaceEmptyStatesP2_123Snapshot } from "@/services/marketplace/marketplace-empty-states-p2-123-service";

const CAPABILITY_ICONS = [PackageSearch, ClipboardList, Store] as const;

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

/** Blueprint P2-123 — marketplace empty states panel. */
export function MarketplaceEmptyStatesP2_123Panel({
  snapshot,
}: {
  snapshot: MarketplaceEmptyStatesP2_123Snapshot;
}) {
  return (
    <div className="space-y-8" data-testid={MARKETPLACE_EMPTY_STATES_P2_123_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {MARKETPLACE_EMPTY_STATES_P2_123_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {MARKETPLACE_EMPTY_STATES_P2_123_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {MARKETPLACE_EMPTY_STATES_P2_123_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live workspace counts"} · wiring score{" "}
          {snapshot.wiringScore}% · policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Products</CardDescription>
            <CardTitle className="text-2xl">{snapshot.productCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Orders</CardDescription>
            <CardTitle className="text-2xl">{snapshot.orderCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Vendors</CardDescription>
            <CardTitle className="text-2xl">{snapshot.vendorCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {MARKETPLACE_EMPTY_STATES_P2_123_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? PackageSearch;
          const block = snapshot.blocks[index];
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={MARKETPLACE_EMPTY_STATES_P2_123_TEST_IDS[index + 1]}
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
                  <Link href={capability.route}>Open live page</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Design previews</h3>
        <div className="grid gap-6 xl:grid-cols-3">
          {MARKETPLACE_EMPTY_STATES_P2_123_CAPABILITIES.map((capability) => (
            <MarketplaceEmptyState
              key={capability.id}
              scenario={capability.scenario}
              variant="card"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {MARKETPLACE_EMPTY_STATES_P2_123_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
