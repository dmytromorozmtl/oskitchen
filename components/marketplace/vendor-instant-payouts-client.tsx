"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Zap } from "lucide-react";

import { requestInstantVendorPayoutAction } from "@/actions/vendor/instant-payouts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { InstantPayoutDashboard } from "@/services/marketplace/instant-payouts-service";

export function VendorInstantPayoutsClient({
  model,
  canRequestPayout,
}: {
  model: InstantPayoutDashboard;
  canRequestPayout: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onInstantPayout = () => {
    startTransition(async () => {
      const result = await requestInstantVendorPayoutAction();
      if (!result.ok) {
        toast.error("error" in result ? result.error : "Instant payout failed.");
        return;
      }
      toast.success(
        `Instant payout ${result.payoutId} — ${formatCurrency(result.netAmount)} to debit (fee ${formatCurrency(result.feeAmount)}).`,
      );
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-amber-200/60 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20">
        <CardContent className="pt-6 text-sm text-muted-foreground">{model.pilotHonesty}</CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Available balance</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(model.availableBalance)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Instant today</CardDescription>
            <CardTitle className="text-2xl">{model.instantPayoutsToday} / 3</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Standard bank ETA</CardDescription>
            <CardTitle className="text-base font-medium leading-snug">{model.standardPayoutEta}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-amber-500" />
            Instant payout to debit card
          </CardTitle>
          <CardDescription>
            ~{model.eligibility.estimatedMinutes} minutes when Stripe Connect instant is enabled — vs{" "}
            {model.standardPayoutEta.toLowerCase()}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {model.feeQuote ? (
            <dl className="grid gap-2 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Gross</dt>
                <dd className="font-medium">{formatCurrency(model.feeQuote.grossAmount)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Fee ({model.eligibility.feePercent}%)</dt>
                <dd className="font-medium">{formatCurrency(model.feeQuote.feeAmount)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">To debit</dt>
                <dd className="font-medium">{formatCurrency(model.feeQuote.netToDebit)}</dd>
              </div>
            </dl>
          ) : null}

          {model.eligibility.eligible ? (
            <Badge variant="secondary">Eligible for instant payout</Badge>
          ) : (
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {model.eligibility.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-2">
            {canRequestPayout && model.eligibility.eligible ? (
              <Button
                type="button"
                className="rounded-full"
                disabled={pending}
                onClick={onInstantPayout}
              >
                Request instant payout
              </Button>
            ) : null}
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/vendor/finance">Standard payout</Link>
            </Button>
          </div>

          {!model.connectEnabled ? (
            <p className="text-xs text-muted-foreground">
              Stripe Connect flag off — enable MARKETPLACE_VENDOR_STRIPE_CONNECT=1 for transfers.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
