import Link from "next/link";

import { StripeLivePanel } from "@/components/integrations/stripe-live-panel";
import { LiveBadge } from "@/components/integrations/beta-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceholderBanner } from "@/components/ui/placeholder-banner";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getStripeLiveDashboard } from "@/services/integrations/stripe/stripe-live-service";

export const metadata = {
  title: "Stripe LIVE — Integrations",
  description: "PaymentIntent, webhooks, and payout reconciliation for Stripe.",
};

export default async function StripeLivePage() {
  const { userId } = await getTenantActor();
  const dashboard = await getStripeLiveDashboard(userId);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      {dashboard.mode === "placeholder" ? (
        <PlaceholderBanner
          feature="Stripe LIVE"
          detail="Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to enable payments and payout reconciliation."
        />
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Stripe LIVE</h1>
            <LiveBadge />
          </div>
          <p className="text-sm text-muted-foreground">
            PaymentIntent, webhooks, and payout reconciliation.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/integrations/stripe">← Integration settings</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live controls</CardTitle>
        </CardHeader>
        <CardContent>
          <StripeLivePanel dashboard={dashboard} />
        </CardContent>
      </Card>
    </div>
  );
}
