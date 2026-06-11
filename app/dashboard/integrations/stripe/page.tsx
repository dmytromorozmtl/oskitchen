import Link from "next/link";

import { LiveBadge } from "@/components/integrations/beta-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isStripeConfigured, isStripeWebhookConfigured } from "@/services/integrations/stripe/stripe-credentials";

export const dynamic = "force-dynamic";

export default async function StripeIntegrationPage() {
  const configured = isStripeConfigured();
  const webhookConfigured = isStripeWebhookConfigured();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">Stripe</h1>
          <LiveBadge title="LIVE — PaymentIntent, webhooks, payout reconciliation" />
        </div>
        <Button asChild size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/stripe/live">Open LIVE dashboard</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {configured ? (
            <p className="text-emerald-600">STRIPE_SECRET_KEY detected</p>
          ) : (
            <p className="text-muted-foreground">Set STRIPE_SECRET_KEY for PaymentIntent creation</p>
          )}
          {webhookConfigured ? (
            <p className="text-emerald-600">STRIPE_WEBHOOK_SECRET detected</p>
          ) : (
            <p className="text-muted-foreground">
              Set STRIPE_WEBHOOK_SECRET for payment and payout webhooks
            </p>
          )}
          <p className="text-muted-foreground">
            Webhook endpoint: <code>/api/integrations/stripe/webhook</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
