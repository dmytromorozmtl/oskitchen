import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VISUAL_TEST_CHECKOUT_LINES } from "@/lib/storefront/visual-test-fixtures";
import { formatCurrency } from "@/lib/utils";

/**
 * Static checkout layout for Playwright visual baselines — no cart storage or server actions.
 * Mirrors {@link import("@/components/storefront/store-checkout-client").StoreCheckoutClient} structure with fixed data.
 */
export function VisualCheckoutShell({
  slug = "visual-demo",
  currency = "USD",
}: {
  slug?: string;
  currency?: string;
}) {
  const subtotal = VISUAL_TEST_CHECKOUT_LINES.reduce((s, r) => s + r.lineTotal, 0);
  const deliveryFee = 5;
  const total = subtotal + deliveryFee;

  return (
    <div className="space-y-8" data-testid="visual-checkout-shell">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-2 text-muted-foreground">
          Submit a preorder request — the kitchen confirms fulfillment windows directly with you when needed.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            <Label className="text-base font-medium">Fulfillment</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="button" variant="default" className="rounded-xl">
                Pickup
              </Button>
              <Button type="button" variant="outline" className="rounded-xl">
                Delivery
              </Button>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            <Label className="text-base font-medium">Payment</Label>
            <div className="space-y-3 text-sm">
              <label className="flex items-start gap-3 rounded-xl border border-border/60 p-3">
                <input type="radio" name="checkoutPaymentUi" className="mt-1" defaultChecked readOnly />
                <span>
                  <span className="font-medium">Pay later / request</span>
                  <span className="mt-0.5 block text-muted-foreground">
                    Submit your preorder — the kitchen confirms details with you.
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-xl border border-border/60 p-3 opacity-70">
                <input type="radio" name="checkoutPaymentUi" className="mt-1" disabled readOnly />
                <span>
                  <span className="font-medium">Pay online with card</span>
                  <span className="mt-0.5 block text-muted-foreground">Stripe (test mode) — snapshot baseline.</span>
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="visual-customerName">Name</Label>
                <Input id="visual-customerName" defaultValue="Alex Baker" className="rounded-xl" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visual-customerEmail">Email</Label>
                <Input
                  id="visual-customerEmail"
                  type="email"
                  defaultValue="alex@example.com"
                  className="rounded-xl"
                  readOnly
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="flex items-start gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" defaultChecked readOnly className="mt-1 h-4 w-4 rounded border-input" />
                  <span>Email me order updates and occasional offers from this kitchen (optional).</span>
                </label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="visual-customerPhone">Phone</Label>
                <Input id="visual-customerPhone" defaultValue="+1 555 0100" className="rounded-xl" readOnly />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="visual-pickupDate">Preferred pickup date</Label>
              <Input id="visual-pickupDate" type="date" defaultValue="2026-06-01" className="rounded-xl" readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visual-customerNotes">Notes for the kitchen (optional)</Label>
              <Textarea
                id="visual-customerNotes"
                rows={3}
                defaultValue="Leave at side door."
                className="rounded-xl"
                readOnly
              />
            </div>
          </div>

          <label className="flex items-start gap-3 text-sm">
            <Checkbox defaultChecked />
            <span>I agree to the kitchen&apos;s preorder terms.</span>
          </label>

          <Button type="button" size="lg" className="w-full rounded-full shadow-sm sm:w-auto">
            Place preorder request
          </Button>
          <p className="text-xs text-muted-foreground">
            <Link href={`/s/${slug}/menu`} className="text-primary underline-offset-4 hover:underline">
              ← Back to menu
            </Link>
          </p>
        </div>

        <aside className="lg:col-span-2">
          <div className="sticky top-24 space-y-4 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            <h2 className="font-semibold">Order summary</h2>
            <ul className="space-y-2 text-sm">
              {VISUAL_TEST_CHECKOUT_LINES.map((r) => (
                <li key={r.title} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {r.quantity}× {r.title}
                  </span>
                  <span>{formatCurrency(r.lineTotal, currency)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span>{formatCurrency(deliveryFee, currency)}</span>
            </div>
            <div className="flex justify-between border-t border-border/80 pt-3 text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
