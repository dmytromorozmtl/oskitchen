import Link from "next/link";
import { BarChart3, RefreshCw, ShoppingCart, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  VENDOR_ANALYTICS_P2_119_CAPABILITIES,
  VENDOR_ANALYTICS_P2_119_EYEBROW,
  VENDOR_ANALYTICS_P2_119_HEADLINE,
  VENDOR_ANALYTICS_P2_119_OPERATOR_LINKS,
  VENDOR_ANALYTICS_P2_119_SUBLINE,
} from "@/lib/marketplace/vendor-analytics-p2-119-content";
import { VENDOR_ANALYTICS_P2_119_TEST_IDS } from "@/lib/marketplace/vendor-analytics-p2-119-policy";
import type { VendorAnalyticsSnapshot } from "@/services/marketplace/vendor-analytics-p2-119-service";

const CAPABILITY_ICONS = [TrendingUp, RefreshCw, ShoppingCart, BarChart3] as const;

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

/** Blueprint P2-119 — vendor analytics panel. */
export function VendorAnalyticsPanel({ snapshot }: { snapshot: VendorAnalyticsSnapshot }) {
  return (
    <div className="space-y-8" data-testid={VENDOR_ANALYTICS_P2_119_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {VENDOR_ANALYTICS_P2_119_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {VENDOR_ANALYTICS_P2_119_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {VENDOR_ANALYTICS_P2_119_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live vendor data"} · readiness{" "}
          {snapshot.readinessScore}% · policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Top SKUs</CardDescription>
            <CardTitle className="text-2xl">{snapshot.topProductCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Repeat rate</CardDescription>
            <CardTitle className="text-2xl">{snapshot.repeatBuyerRatePct}%</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Lost carts</CardDescription>
            <CardTitle className="text-2xl">{snapshot.lostCartCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Best-price SKUs</CardDescription>
            <CardTitle className="text-2xl">{snapshot.competitiveSkuCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {VENDOR_ANALYTICS_P2_119_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? TrendingUp;
          const block = snapshot.blocks[index];
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={VENDOR_ANALYTICS_P2_119_TEST_IDS[index + 1]}
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
        {VENDOR_ANALYTICS_P2_119_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
