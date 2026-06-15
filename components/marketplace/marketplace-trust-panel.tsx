import Link from "next/link";
import { BadgeCheck, Clock, MessageSquare, Scale } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MARKETPLACE_TRUST_P2_120_CAPABILITIES,
  MARKETPLACE_TRUST_P2_120_EYEBROW,
  MARKETPLACE_TRUST_P2_120_HEADLINE,
  MARKETPLACE_TRUST_P2_120_OPERATOR_LINKS,
  MARKETPLACE_TRUST_P2_120_SUBLINE,
} from "@/lib/marketplace/marketplace-trust-p2-120-content";
import { MARKETPLACE_TRUST_P2_120_TEST_IDS } from "@/lib/marketplace/marketplace-trust-p2-120-policy";
import type { MarketplaceTrustSnapshot } from "@/services/marketplace/marketplace-trust-p2-120-service";

const CAPABILITY_ICONS = [BadgeCheck, Clock, MessageSquare, Scale] as const;

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

/** Blueprint P2-120 — marketplace trust panel. */
export function MarketplaceTrustPanel({ snapshot }: { snapshot: MarketplaceTrustSnapshot }) {
  return (
    <div className="space-y-8" data-testid={MARKETPLACE_TRUST_P2_120_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {MARKETPLACE_TRUST_P2_120_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {MARKETPLACE_TRUST_P2_120_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {MARKETPLACE_TRUST_P2_120_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live marketplace data"} · readiness{" "}
          {snapshot.readinessScore}% · policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Verified vendors</CardDescription>
            <CardTitle className="text-2xl">
              {snapshot.verifiedVendorCount}/{snapshot.totalVendorCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Delivery SLA</CardDescription>
            <CardTitle className="text-2xl">
              {snapshot.slaDeliveryScore != null ? `${snapshot.slaDeliveryScore}/5` : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Reviews</CardDescription>
            <CardTitle className="text-2xl">
              {snapshot.avgReviewScore != null
                ? `${snapshot.avgReviewScore}/5`
                : snapshot.reviewCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Open disputes</CardDescription>
            <CardTitle className="text-2xl">{snapshot.openDisputeCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {MARKETPLACE_TRUST_P2_120_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? BadgeCheck;
          const block = snapshot.blocks[index];
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={MARKETPLACE_TRUST_P2_120_TEST_IDS[index + 1]}
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
        {MARKETPLACE_TRUST_P2_120_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
