import Link from "next/link";
import { ArrowLeftRight, CalendarClock, PackageSearch, Scale, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RESTAURANT_PURCHASING_P2_117_CAPABILITIES,
  RESTAURANT_PURCHASING_P2_117_EYEBROW,
  RESTAURANT_PURCHASING_P2_117_HEADLINE,
  RESTAURANT_PURCHASING_P2_117_OPERATOR_LINKS,
  RESTAURANT_PURCHASING_P2_117_SUBLINE,
} from "@/lib/marketplace/restaurant-purchasing-p2-117-content";
import { RESTAURANT_PURCHASING_P2_117_TEST_IDS } from "@/lib/marketplace/restaurant-purchasing-p2-117-policy";
import type { RestaurantPurchasingSnapshot } from "@/services/marketplace/restaurant-purchasing-p2-117-service";

const CAPABILITY_ICONS = [Scale, CalendarClock, ArrowLeftRight, Truck, PackageSearch] as const;

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

/** Blueprint P2-117 — restaurant purchasing marketplace panel. */
export function RestaurantPurchasingPanel({
  snapshot,
}: {
  snapshot: RestaurantPurchasingSnapshot;
}) {
  return (
    <div className="space-y-8" data-testid={RESTAURANT_PURCHASING_P2_117_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {RESTAURANT_PURCHASING_P2_117_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {RESTAURANT_PURCHASING_P2_117_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {RESTAURANT_PURCHASING_P2_117_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live marketplace data"} · readiness{" "}
          {snapshot.readinessScore}% · policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-5">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Compare offers</CardDescription>
            <CardTitle className="text-2xl">{snapshot.compareOfferCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Recurring</CardDescription>
            <CardTitle className="text-2xl">{snapshot.recurringOrderCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Substitutions</CardDescription>
            <CardTitle className="text-2xl">{snapshot.activeSubstitutionCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>In transit</CardDescription>
            <CardTitle className="text-2xl">{snapshot.inTransitDeliveryCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Open disputes</CardDescription>
            <CardTitle className="text-2xl">{snapshot.openDisputeCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {RESTAURANT_PURCHASING_P2_117_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? Scale;
          const block = snapshot.blocks[index];
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={RESTAURANT_PURCHASING_P2_117_TEST_IDS[index + 1]}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" aria-hidden />
                    <CardTitle className="text-base">{capability.label}</CardTitle>
                  </div>
                  {block ? (
                    <Badge variant={statusVariant(block.status)} className="rounded-full capitalize">
                      {block.status}
                    </Badge>
                  ) : null}
                </div>
                <CardDescription>{capability.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {block ? <p className="text-muted-foreground">{block.summary}</p> : null}
                <Button asChild variant="link" size="sm" className="h-auto p-0">
                  <Link href={capability.route}>Open {capability.label.toLowerCase()}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {RESTAURANT_PURCHASING_P2_117_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
