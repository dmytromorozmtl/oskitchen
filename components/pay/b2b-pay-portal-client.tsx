"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, CreditCard, Loader2 } from "lucide-react";

import type { B2bPayPortalView } from "@/lib/integrations/shopify-b2b-pay-portal-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function B2bPayPortalClient({
  token,
  view,
  paidFromRedirect,
  canceled,
}: {
  token: string;
  view: B2bPayPortalView;
  paidFromRedirect?: boolean;
  canceled?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (view.paid || paidFromRedirect) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-950 dark:text-emerald-100">
            <CheckCircle2 className="size-5" aria-hidden />
            Payment received
          </CardTitle>
          <CardDescription>
            Invoice {view.invoiceNumber} has been paid. Thank you for your business.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/80 bg-card/95 shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{view.businessName}</CardTitle>
            <Badge variant="outline" className="rounded-full">
              B2B invoice
            </Badge>
          </div>
          <CardDescription>{view.honesty}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <p className="font-mono text-xs text-muted-foreground">{view.invoiceNumber}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{view.amountDueLabel}</p>
            <p className="mt-1 text-muted-foreground">{view.currency.toUpperCase()} due</p>
            {view.dueLabel ? <p className="mt-2 text-muted-foreground">Due {view.dueLabel}</p> : null}
            {view.companyName ? <p className="mt-2">Company: {view.companyName}</p> : null}
            {view.poNumber ? (
              <p className="mt-1">
                PO# <span className="font-mono">{view.poNumber}</span>
              </p>
            ) : null}
            {view.paymentTermsLabel ? <p className="mt-1">{view.paymentTermsLabel}</p> : null}
          </div>

          {canceled ? (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-amber-950 dark:text-amber-100">
              Checkout was canceled. You can try again or use the wire instructions below.
            </p>
          ) : null}

          {view.stripeCheckoutAvailable ? (
            <div className="space-y-2">
              <Button
                className="w-full rounded-full"
                disabled={pending}
                onClick={() => {
                  setError(null);
                  startTransition(async () => {
                    const res = await fetch(`/api/pay/b2b/${encodeURIComponent(token)}/checkout`, {
                      method: "POST",
                    });
                    const data = (await res.json().catch(() => null)) as
                      | { url?: string; error?: string }
                      | null;
                    if (!res.ok || !data?.url) {
                      setError(data?.error ?? "Unable to start checkout.");
                      return;
                    }
                    window.location.href = data.url;
                  });
                }}
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <CreditCard className="size-4" aria-hidden />
                )}
                <span className="ml-2">Pay with card</span>
              </Button>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
          ) : null}

          <div className="rounded-xl border border-border/70 p-4">
            <p className="font-medium">Wire / ACH instructions</p>
            <p className="mt-2 text-muted-foreground">{view.achInstructions}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
