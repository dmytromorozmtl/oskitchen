import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderTrackingAnalyticsBeacon } from "@/components/storefront/order-tracking-analytics";
import { GuestOrderAccountClient } from "@/components/storefront/guest-order-account-client";
import { StorefrontPaymentRecoveryActions } from "@/components/storefront/storefront-payment-recovery-actions";
import { StorefrontReorderActions } from "@/components/storefront/storefront-reorder-actions";
import { getSessionUser } from "@/lib/auth";
import { getStorefrontDuplicateOrderNotice } from "@/lib/storefront/storefront-duplicate-order-notice";
import { applyStorefrontCheckoutCanceledIfNeeded } from "@/services/storefront/storefront-payment-recovery-service";
import { turnstileSiteKey } from "@/lib/storefront/turnstile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

const STATUS_ORDER: { key: string; label: string }[] = [
  { key: "SUBMITTED", label: "Received" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "IN_PRODUCTION", label: "In production" },
  { key: "READY", label: "Ready" },
  { key: "COMPLETED", label: "Completed" },
];

function statusIndex(status: string) {
  const i = STATUS_ORDER.findIndex((s) => s.key === status);
  return i >= 0 ? i : 0;
}

export default async function StorefrontOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string; token: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { storeSlug, token } = await params;
  const sp = searchParams ? await searchParams : {};
  const duplicate = sp.duplicate === "1";
  const paid = sp.paid === "1";
  const checkoutCanceled = sp.canceled === "1";
  const sessionUser = await getSessionUser();

  if (checkoutCanceled) {
    await applyStorefrontCheckoutCanceledIfNeeded({ publicToken: token, storeSlug });
  }

  const row = await prisma.storefrontOrder.findFirst({
    where: {
      publicToken: token,
      storefront: { storeSlug },
    },
    include: {
      internalOrder: true,
    },
  });

  if (!row) notFound();

  type CartLine = {
    title: string;
    quantity: number;
    unitPrice: number;
    variantId?: string;
    modifierLabels?: string[];
  };
  const cart = row.cartJson as CartLine[];
  const idx = statusIndex(row.status);
  const paymentFailed = row.paymentMode === "ONLINE_PAYMENT" && row.paymentStatus === "FAILED";
  const paymentPending = row.paymentMode === "ONLINE_PAYMENT" && row.paymentStatus === "PENDING";
  const duplicateNotice = getStorefrontDuplicateOrderNotice({
    duplicate,
    paymentMode: row.paymentMode,
    paymentStatus: row.paymentStatus,
  });

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <OrderTrackingAnalyticsBeacon storeSlug={storeSlug} orderToken={token} />
      {row.internalOrder?.id ? (
        <span
          data-testid="storefront-internal-order-id"
          data-order-id={row.internalOrder.id}
          className="sr-only"
          aria-hidden="true"
        />
      ) : null}
      {duplicateNotice ? (
        <p
          className={
            duplicateNotice.tone === "warning"
              ? "rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-950 dark:text-amber-100"
              : "rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-center text-sm text-sky-950 dark:text-sky-100"
          }
        >
          {duplicateNotice.message}
        </p>
      ) : null}
      {paid && row.paymentStatus === "PAID" ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-900 dark:text-emerald-100">
          Payment received — thank you.
        </p>
      ) : null}
      {paymentFailed ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-950 dark:text-rose-100">
          <p>
            {checkoutCanceled
              ? "Card checkout was canceled. Your order is saved — you can retry payment below."
              : "We saved your order, but online card checkout could not start."}
          </p>
          <p className="mt-1">Retry payment below or contact the kitchen with your order reference.</p>
          <StorefrontPaymentRecoveryActions orderToken={token} storeSlug={storeSlug} />
        </div>
      ) : null}
      {paymentPending ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-950 dark:text-amber-100">
          <p>
            Payment is still processing. Use the original Stripe checkout window if it is still open, or contact the
            kitchen with your order reference if confirmation does not arrive.
          </p>
        </div>
      ) : null}
      <div className="text-center">
        <Badge variant="secondary" className="rounded-full">
          Order {row.orderNumber ?? row.publicToken.slice(0, 8).toUpperCase()}
        </Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Thanks, {row.customerName}</h1>
        <p className="mt-2 text-muted-foreground">
          The kitchen has your request. Save this page to check status anytime.
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {STATUS_ORDER.map((s, i) => (
              <li key={s.key} className="flex items-center gap-3 text-sm">
                <span
                  className={
                    i <= idx
                      ? "flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      : "flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
                  }
                >
                  {i + 1}
                </span>
                <span className={i <= idx ? "font-medium" : "text-muted-foreground"}>{s.label}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ul className="space-y-2">
            {cart.map((line, i) => (
              <li key={`${line.title}-${i}`} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {line.quantity}× {line.title}
                  {line.modifierLabels?.length ? (
                    <span className="block text-xs">+ {line.modifierLabels.join(", ")}</span>
                  ) : null}
                </span>
                <span>{formatCurrency(line.quantity * line.unitPrice)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-border pt-3 font-semibold">
            <span>Total</span>
            <span>{formatCurrency(Number(row.total))}</span>
          </div>
          {row.customerNotes?.trim() ? (
            <div className="rounded-lg border border-border/80 bg-muted/40 p-3 text-sm">
              <p className="font-medium text-foreground">Your notes</p>
              <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{row.customerNotes.trim()}</p>
            </div>
          ) : null}
          {row.internalOrder?.publicLookupToken ? (
            <p className="pt-2 text-xs text-muted-foreground">
              OS Kitchen guest lookup:{" "}
              <Link
                className="text-primary underline-offset-4 hover:underline"
                href={`/order/${row.internalOrder.publicLookupToken}`}
              >
                Open full order status
              </Link>
            </p>
          ) : null}
        </CardContent>
      </Card>

      {!sessionUser && row.customerEmail ? (
        <GuestOrderAccountClient
          storeSlug={storeSlug}
          orderToken={token}
          turnstileSiteKey={turnstileSiteKey()}
        />
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <StorefrontReorderActions
          storeSlug={storeSlug}
          orderToken={token}
          className="w-full flex-1 rounded-full"
          variant="premium"
        />
        <Button asChild variant="outline" className="w-full flex-1 rounded-full">
          <Link href={`/s/${storeSlug}/menu`}>Browse menu</Link>
        </Button>
      </div>
    </div>
  );
}
