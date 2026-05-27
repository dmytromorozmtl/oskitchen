import Link from "next/link";

import { updateStorefrontOrderingSettingsFormAction } from "@/actions/storefront-pillar-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireStorefrontAdminPageAccess } from "@/lib/storefront/storefront-admin-page-access";
import { prisma } from "@/lib/prisma";
import { StripeConnectButton } from "@/components/dashboard/storefront/stripe-connect-button";
import { StorefrontCheckoutExtensionsPanel } from "@/components/dashboard/storefront/storefront-checkout-extensions-panel";
import { StorefrontTaxSettingsPanel } from "@/components/dashboard/storefront/storefront-tax-settings-panel";
import { checkoutExtensionsFromKitchenSettings } from "@/lib/storefront/checkout-extensions";
import { mergeKitchenLegacyTax, parseTaxSettingsFromSettingsCenter } from "@/lib/storefront/tax-settings";
import { storefrontPaymentReadiness } from "@/services/storefront/storefront-payment-service";

export default async function StorefrontOrderingPage() {
  const pageAccess = await requireStorefrontAdminPageAccess("storefront.settings");
  if (!pageAccess.ok) return pageAccess.deny;

  const [settings, kitchen] = await Promise.all([
    prisma.storefrontSettings.findUnique({
      where: { id: pageAccess.access.storefront.id },
    }),
    prisma.kitchenSettings.findUnique({
      where: { userId: pageAccess.userId },
      select: {
        settingsCenterJson: true,
        defaultTaxRate: true,
        taxDisplayName: true,
        taxIncludedInPrices: true,
      },
    }),
  ]);
  const checkoutExtensions = checkoutExtensionsFromKitchenSettings(kitchen?.settingsCenterJson);
  const taxSettings = mergeKitchenLegacyTax(parseTaxSettingsFromSettingsCenter(kitchen?.settingsCenterJson), {
    defaultTaxRate: kitchen?.defaultTaxRate != null ? Number(kitchen.defaultTaxRate) : null,
    taxDisplayName: kitchen?.taxDisplayName ?? null,
    taxIncludedInPrices: kitchen?.taxIncludedInPrices === true,
  });

  if (!settings) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">Ordering</h1>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle>Not set up yet</CardTitle>
            <CardDescription>Save the storefront overview first.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full">
              <Link href="/dashboard/storefront">Open overview</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pay = storefrontPaymentReadiness(settings);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Ordering &amp; checkout rules</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Minimum order, daily caps, and same-day cutoff are enforced server-side. Checkout terms live on{" "}
          <Link href="/dashboard/storefront" className="text-primary underline-offset-4 hover:underline">
            Overview
          </Link>
          .
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Stripe readiness</CardTitle>
          <CardDescription>
            Pilot uses platform Stripe keys. Merchant payouts via Stripe Connect are documented in{" "}
            <code className="rounded bg-muted px-1 text-xs">docs/roadmap/STOREFRONT_STRIPE_CONNECT_OPTION_B.md</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Online payments:</span>{" "}
            {pay.allowed && pay.stripeReady ? (
              <span className="text-emerald-700 dark:text-emerald-400">Ready for guests ({pay.stripeMode})</span>
            ) : pay.stripeReady ? (
              <span className="text-amber-800 dark:text-amber-300">Stripe configured — checkout still blocked</span>
            ) : (
              <span className="text-amber-800 dark:text-amber-300">Not ready</span>
            )}
          </p>
          <p className="text-muted-foreground">{pay.stripeMessage}</p>
          {pay.connect.connectEnabled ? (
            <p>
              <span className="font-medium">Stripe Connect:</span>{" "}
              <span className={pay.connect.ready ? "text-emerald-700 dark:text-emerald-400" : "text-amber-800"}>
                {pay.connect.label}
              </span>
            </p>
          ) : null}
          {pay.connect.connectEnabled && pay.connect.status !== "ready" ? (
            <StripeConnectButton />
          ) : null}
          {!pay.allowed && settings.onlinePaymentEnabled && !settings.payLaterOnly ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive">
              Online payments are enabled in settings but checkout will stay disabled for guests until Stripe is ready
              and the webhook confirms payments.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Stripe checkout currency</CardTitle>
          <CardDescription>Public totals and Stripe must use the same minor-unit currency — misalignment blocks online pay.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Storefront currency:</span>{" "}
            <span className="font-mono">{pay.storefrontCurrency}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Stripe session currency:</span>{" "}
            <span className="font-mono">{pay.stripeCheckoutCurrency ?? "—"}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Alignment:</span>{" "}
            <span className="font-mono">{pay.currencyStatus}</span>
          </p>
          {pay.currencyMessage ? <p className="text-muted-foreground">{pay.currencyMessage}</p> : null}
        </CardContent>
      </Card>

      <StorefrontCheckoutExtensionsPanel
        extensions={checkoutExtensions}
        stripeApplicationFeeBps={settings.stripeApplicationFeeBps}
      />

      <StorefrontTaxSettingsPanel initial={taxSettings} />

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Rules</CardTitle>
          <CardDescription>Align with how your kitchen accepts preorders.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateStorefrontOrderingSettingsFormAction} className="space-y-6">
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="preorderEnabled" value="on" defaultChecked={settings.preorderEnabled} className="h-4 w-4 rounded border-input" />
                Preorders enabled
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="payLaterOnly" value="on" defaultChecked={settings.payLaterOnly} className="h-4 w-4 rounded border-input" />
                Pay later / request only
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="onlinePaymentEnabled"
                  value="on"
                  defaultChecked={settings.onlinePaymentEnabled}
                  className="h-4 w-4 rounded border-input"
                />
                Online payments (requires Stripe in production)
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minimumOrderAmount">Minimum order ({settings.currency})</Label>
                <Input
                  id="minimumOrderAmount"
                  name="minimumOrderAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={settings.minimumOrderAmount != null ? settings.minimumOrderAmount.toString() : ""}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderCutoffTime">Same-day order cutoff (HH:mm)</Label>
                <Input id="orderCutoffTime" name="orderCutoffTime" defaultValue={settings.orderCutoffTime ?? ""} placeholder="14:00" className="rounded-xl font-mono text-sm" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="maxOrdersPerDay">Max orders per day (optional)</Label>
                <Input
                  id="maxOrdersPerDay"
                  name="maxOrdersPerDay"
                  type="number"
                  min="1"
                  defaultValue={settings.maxOrdersPerDay != null ? String(settings.maxOrdersPerDay) : ""}
                  className="rounded-xl"
                />
              </div>
            </div>
            <Button type="submit" className="rounded-full">
              Save ordering
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
