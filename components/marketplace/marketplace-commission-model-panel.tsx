import Link from "next/link";
import { BadgeDollarSign, CreditCard, Sparkles, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MARKETPLACE_COMMISSION_MODEL_P2_118_CAPABILITIES,
  MARKETPLACE_COMMISSION_MODEL_P2_118_EYEBROW,
  MARKETPLACE_COMMISSION_MODEL_P2_118_HEADLINE,
  MARKETPLACE_COMMISSION_MODEL_P2_118_OPERATOR_LINKS,
  MARKETPLACE_COMMISSION_MODEL_P2_118_SUBLINE,
} from "@/lib/marketplace/marketplace-commission-model-p2-118-content";
import { MARKETPLACE_COMMISSION_MODEL_P2_118_TEST_IDS } from "@/lib/marketplace/marketplace-commission-model-p2-118-policy";
import type { MarketplaceCommissionModelSnapshot } from "@/services/marketplace/marketplace-commission-model-p2-118-service";

const CAPABILITY_ICONS = [BadgeDollarSign, Sparkles, Users, CreditCard] as const;

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

function formatUsd(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/** Blueprint P2-118 — marketplace commission model panel. */
export function MarketplaceCommissionModelPanel({
  snapshot,
}: {
  snapshot: MarketplaceCommissionModelSnapshot;
}) {
  return (
    <div className="space-y-8" data-testid={MARKETPLACE_COMMISSION_MODEL_P2_118_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {MARKETPLACE_COMMISSION_MODEL_P2_118_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {MARKETPLACE_COMMISSION_MODEL_P2_118_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {MARKETPLACE_COMMISSION_MODEL_P2_118_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live platform data"} · readiness{" "}
          {snapshot.readinessScore}% · policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Commission (30d)</CardDescription>
            <CardTitle className="text-2xl">
              {formatUsd(snapshot.commissionRevenue30dUsd)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Featured (30d)</CardDescription>
            <CardTitle className="text-2xl">{formatUsd(snapshot.featuredRevenue30dUsd)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Lead fees (30d)</CardDescription>
            <CardTitle className="text-2xl">{formatUsd(snapshot.leadFeeRevenue30dUsd)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Transactions (30d)</CardDescription>
            <CardTitle className="text-2xl">{snapshot.transactionCount30d}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {MARKETPLACE_COMMISSION_MODEL_P2_118_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? BadgeDollarSign;
          const block = snapshot.blocks[index];
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={MARKETPLACE_COMMISSION_MODEL_P2_118_TEST_IDS[index + 1]}
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
        {MARKETPLACE_COMMISSION_MODEL_P2_118_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
