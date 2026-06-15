import Link from "next/link";
import { CreditCard, Link2, Send, Webhook } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  VENDOR_PAYOUT_WEBHOOK_P2_121_CAPABILITIES,
  VENDOR_PAYOUT_WEBHOOK_P2_121_EYEBROW,
  VENDOR_PAYOUT_WEBHOOK_P2_121_HEADLINE,
  VENDOR_PAYOUT_WEBHOOK_P2_121_OPERATOR_LINKS,
  VENDOR_PAYOUT_WEBHOOK_P2_121_SUBLINE,
} from "@/lib/marketplace/vendor-payout-webhook-p2-121-content";
import { VENDOR_PAYOUT_WEBHOOK_P2_121_TEST_IDS } from "@/lib/marketplace/vendor-payout-webhook-p2-121-policy";
import type { VendorPayoutWebhookSnapshot } from "@/services/marketplace/vendor-payout-webhook-p2-121-service";

const CAPABILITY_ICONS = [Link2, CreditCard, Send, Webhook] as const;

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

/** Blueprint P2-121 — vendor payout webhook panel. */
export function VendorPayoutWebhookPanel({
  snapshot,
}: {
  snapshot: VendorPayoutWebhookSnapshot;
}) {
  return (
    <div className="space-y-8" data-testid={VENDOR_PAYOUT_WEBHOOK_P2_121_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {VENDOR_PAYOUT_WEBHOOK_P2_121_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {VENDOR_PAYOUT_WEBHOOK_P2_121_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {VENDOR_PAYOUT_WEBHOOK_P2_121_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.mode === "demo" ? "Demo fixture" : "Live Connect data"} · readiness{" "}
          {snapshot.readinessScore}% · policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Connect</CardDescription>
            <CardTitle className="text-2xl capitalize">{snapshot.connectStatus}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Available</CardDescription>
            <CardTitle className="text-2xl">{formatUsd(snapshot.availableBalanceUsd)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Payouts (30d)</CardDescription>
            <CardTitle className="text-2xl">{snapshot.paidOutCount30d}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Webhooks (30d)</CardDescription>
            <CardTitle className="text-2xl">{snapshot.connectWebhookDeliveries30d}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {VENDOR_PAYOUT_WEBHOOK_P2_121_CAPABILITIES.map((capability, index) => {
          const Icon = CAPABILITY_ICONS[index] ?? Link2;
          const block = snapshot.blocks[index];
          return (
            <Card
              key={capability.id}
              className="border-border/80 shadow-sm"
              data-testid={VENDOR_PAYOUT_WEBHOOK_P2_121_TEST_IDS[index + 1]}
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
        {VENDOR_PAYOUT_WEBHOOK_P2_121_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
