import Link from "next/link";
import { AlertCircle, CheckCircle2, Globe2 } from "lucide-react";

import {
  updateLocationCurrencyFormAction,
  updateWorkspaceCurrencyFormAction,
} from "@/actions/finance/multi-currency-settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID,
  DESIGN_POLISH_BADGE_ROW_CLASS,
  DESIGN_POLISH_CARD_CLASS,
  DESIGN_POLISH_HERO_BANNER_CLASS,
  DESIGN_POLISH_ROW_SURFACE_CLASS,
  DESIGN_POLISH_STRIPE_OK_CLASS,
} from "@/lib/design/absolute-final-design-polish-tokens";
import {
  formatMultiCurrencyAmount,
  MULTI_CURRENCY_NETWORK_ROLLUP_LABEL,
  MULTI_CURRENCY_SUPPORTED_CURRENCIES,
  multiCurrencyStorefrontSettingsHref,
} from "@/lib/finance/multi-currency-policy";
import type { MultiCurrencySettingsModel } from "@/services/finance/multi-currency-service";

export function MultiCurrencySettingsPanel({ model }: { model: MultiCurrencySettingsModel }) {
  const { assessment } = model;

  return (
    <div className="space-y-6" data-testid="multi-currency-settings-panel">
      <div className={DESIGN_POLISH_HERO_BANNER_CLASS} role="note">
        <p className="font-medium text-foreground">Multi-currency network (Beta)</p>
        <p className="mt-1 text-muted-foreground dark:text-muted-foreground/90">
          Lightspeed-style per-location display currency.{" "}
          {MULTI_CURRENCY_NETWORK_ROLLUP_LABEL.toLowerCase()}.
        </p>
      </div>

      <div className={DESIGN_POLISH_BADGE_ROW_CLASS}>
        <Badge variant="outline" className="rounded-full">
          <Globe2 className="mr-1 h-3 w-3" aria-hidden />
          Workspace: {assessment.workspaceCurrency}
        </Badge>
        <Badge variant={assessment.isMultiCurrency ? "secondary" : "outline"} className="rounded-full">
          {assessment.distinctCurrencies.length} currenc
          {assessment.distinctCurrencies.length === 1 ? "y" : "ies"}
        </Badge>
        {assessment.isMultiCurrency ? (
          <Badge variant="outline" className="rounded-full text-xs">
            {MULTI_CURRENCY_NETWORK_ROLLUP_LABEL}
          </Badge>
        ) : null}
      </div>

      <Card className={DESIGN_POLISH_CARD_CLASS}>
        <CardHeader>
          <CardTitle className="text-base">Workspace base currency</CardTitle>
          <CardDescription>
            Default for POS, reporting, and locations without an override. Storefronts keep their own
            ISO code — align each with Stripe on Ordering settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateWorkspaceCurrencyFormAction} className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="workspaceCurrency">Base currency</Label>
              <select
                id="workspaceCurrency"
                name="currency"
                defaultValue={assessment.workspaceCurrency}
                className="flex h-10 min-w-[140px] rounded-xl border border-input bg-background px-3 py-2 text-sm dark:border-border/60 dark:bg-background/95"
              >
                {MULTI_CURRENCY_SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="rounded-full">
              Save base currency
            </Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            Example format: {formatMultiCurrencyAmount(1234.5, assessment.workspaceCurrency)}
          </p>
        </CardContent>
      </Card>

      <Card className={DESIGN_POLISH_CARD_CLASS}>
        <CardHeader>
          <CardTitle className="text-base">Per-location currency</CardTitle>
          <CardDescription>
            Lightspeed-style location display currency. Stored on each location — network analytics
            do not auto-convert across codes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {assessment.locationRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No locations yet.{" "}
              <Link href="/dashboard/enterprise/multi-location" className="text-primary underline-offset-4 hover:underline">
                Add a location
              </Link>{" "}
              to assign per-site currencies.
            </p>
          ) : (
            assessment.locationRows.map((row) => (
              <form
                key={row.locationId}
                action={updateLocationCurrencyFormAction}
                className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between ${DESIGN_POLISH_ROW_SURFACE_CLASS}`}
                data-testid={`multi-currency-location-${row.locationId}`}
              >
                <input type="hidden" name="locationId" value={row.locationId} />
                <div>
                  <p className="font-medium">{row.locationName}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {row.inheritsWorkspace ? (
                      <span>Inherits workspace default</span>
                    ) : (
                      <span>Location override</span>
                    )}
                    {row.stripeSupported ? (
                      <Badge variant="outline" className="rounded-full text-[10px]">
                        <CheckCircle2
                          className={`mr-1 h-3 w-3 ${DESIGN_POLISH_STRIPE_OK_CLASS}`}
                          aria-hidden
                        />
                        Stripe card OK
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="rounded-full text-[10px]">
                        <AlertCircle className="mr-1 h-3 w-3" aria-hidden />
                        Stripe unsupported
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-end gap-2">
                  <div className="space-y-1">
                    <Label htmlFor={`currency-${row.locationId}`} className="sr-only">
                      Currency for {row.locationName}
                    </Label>
                    <select
                      id={`currency-${row.locationId}`}
                      name="currency"
                      defaultValue={row.currency}
                      className="flex h-10 min-w-[120px] rounded-xl border border-input bg-background px-3 py-2 text-sm dark:border-border/60 dark:bg-background/95"
                    >
                      {MULTI_CURRENCY_SUPPORTED_CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" size="sm" variant="outline" className="rounded-full">
                    Save
                  </Button>
                </div>
              </form>
            ))
          )}
        </CardContent>
      </Card>

      <Card className={DESIGN_POLISH_CARD_CLASS}>
        <CardHeader>
          <CardTitle className="text-base">Storefront checkout currency</CardTitle>
          <CardDescription>
            One ISO code per storefront — must match Stripe Checkout minor units on Ordering settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {assessment.storefrontRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No storefronts configured.{" "}
              <Link href="/dashboard/storefront" className="text-primary underline-offset-4 hover:underline">
                Set up storefront
              </Link>
              .
            </p>
          ) : (
            assessment.storefrontRows.map((row) => (
              <div
                key={row.storefrontId}
                className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${DESIGN_POLISH_ROW_SURFACE_CLASS}`}
                data-testid={`multi-currency-storefront-${row.storefrontId}`}
              >
                <div>
                  <p className="font-medium">{row.storeSlug}</p>
                  <p className="text-sm text-muted-foreground">{row.currency}</p>
                </div>
                <div className="flex items-center gap-2">
                  {row.stripeAligned ? (
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      Stripe aligned
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="rounded-full text-[10px]">
                      Check Stripe
                    </Badge>
                  )}
                  <Button asChild size="sm" variant="ghost" className="rounded-full">
                    <Link href={multiCurrencyStorefrontSettingsHref(row.storeSlug)}>
                      Regional settings
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <p className="sr-only">{DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID}</p>
    </div>
  );
}
