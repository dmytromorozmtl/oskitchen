import Link from "next/link";
import { CreditCard, ShoppingBag, TrendingDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  COMMISSION_FREE_ORDERING_P2_113_EYEBROW,
  COMMISSION_FREE_ORDERING_P2_113_HEADLINE,
  COMMISSION_FREE_ORDERING_P2_113_MESSAGES,
  COMMISSION_FREE_ORDERING_P2_113_OPERATOR_LINKS,
  COMMISSION_FREE_ORDERING_P2_113_SUBLINE,
} from "@/lib/marketing/commission-free-ordering-p2-113-content";
import { COMMISSION_FREE_ORDERING_P2_113_TEST_IDS } from "@/lib/marketing/commission-free-ordering-p2-113-policy";
import type { CommissionFreeOrderingSnapshot } from "@/services/marketing/commission-free-ordering-p2-113-service";

const MESSAGE_ICONS = [ShoppingBag, CreditCard, TrendingDown] as const;

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Blueprint P2-113 — commission-free ordering messaging panel. */
export function CommissionFreeOrderingPanel({
  snapshot,
}: {
  snapshot: CommissionFreeOrderingSnapshot;
}) {
  return (
    <div className="space-y-8" data-testid={COMMISSION_FREE_ORDERING_P2_113_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {COMMISSION_FREE_ORDERING_P2_113_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {COMMISSION_FREE_ORDERING_P2_113_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {COMMISSION_FREE_ORDERING_P2_113_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live storefront settings"} · Stripe{" "}
          {snapshot.stripeMode} · checkout{" "}
          {snapshot.checkoutAllowed ? "allowed" : "blocked"} · policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Marketplace fees (typical)</CardDescription>
            <CardTitle className="text-2xl">{formatMoney(snapshot.marketplaceFeesUsd)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            ~{snapshot.marketplaceCommissionPct}% on {formatMoney(snapshot.monthlyOrderVolumeUsd)}/mo
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Owned channel (Stripe only)</CardDescription>
            <CardTitle className="text-2xl">{formatMoney(snapshot.ownedChannelFeesUsd)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            ~{snapshot.stripeProcessingPct}% + ${snapshot.stripeFixedFeeUsd.toFixed(2)}/charge
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Directional monthly delta</CardDescription>
            <CardTitle className="text-2xl text-emerald-700 dark:text-emerald-400">
              {formatMoney(snapshot.monthlyDeltaUsd)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            OS Kitchen order commission: {snapshot.osKitchenOrderCommissionPct}%
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {COMMISSION_FREE_ORDERING_P2_113_MESSAGES.map((message, index) => {
          const Icon = MESSAGE_ICONS[index] ?? ShoppingBag;
          const block = snapshot.messages[index];
          return (
            <Card
              key={message.id}
              className="border-border/80 shadow-sm"
              data-testid={COMMISSION_FREE_ORDERING_P2_113_TEST_IDS[index + 1]}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                  <CardTitle className="text-base">{message.label}</CardTitle>
                </div>
                <CardDescription>{message.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {block ? (
                  <>
                    <p className="font-medium">{block.headline}</p>
                    <p className="text-muted-foreground">{block.body}</p>
                    {block.guestCopy ? (
                      <p className="rounded-lg border border-dashed border-border/80 bg-muted/40 p-3 text-xs italic text-muted-foreground">
                        Guest copy: {block.guestCopy}
                      </p>
                    ) : null}
                  </>
                ) : null}
                <Button asChild variant="link" size="sm" className="h-auto p-0">
                  <Link href={message.route}>Open {message.label.toLowerCase()}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {COMMISSION_FREE_ORDERING_P2_113_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
