import {
  STOREFRONT_COMMON_CURRENCIES,
  STOREFRONT_SUPPORTED_LOCALES,
} from "@/lib/storefront/regional";
import { updateStorefrontRegionalSettingsFormAction } from "@/actions/storefront-regional";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Mexico_City",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Warsaw",
  "Europe/Kyiv",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
] as const;

export function RegionalSettingsForm({
  currency,
  locale,
  timezone,
}: {
  currency: string;
  locale: string;
  timezone: string;
}) {
  return (
    <form action={updateStorefrontRegionalSettingsFormAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="currency">Store currency</Label>
          <select
            id="currency"
            name="currency"
            defaultValue={currency}
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          >
            {STOREFRONT_COMMON_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            One currency per storefront. Stripe checkout must use the same ISO code.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="locale">Default language</Label>
          <select
            id="locale"
            name="locale"
            defaultValue={locale.split("-")[0] ?? "en"}
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          >
            {STOREFRONT_SUPPORTED_LOCALES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">Guests can switch language on the public site when enabled.</p>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="timezone">Kitchen timezone</Label>
          <Input
            id="timezone"
            name="timezone"
            list="storefront-timezones"
            defaultValue={timezone}
            className="rounded-xl font-mono text-sm"
            placeholder="America/New_York"
          />
          <datalist id="storefront-timezones">
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz} value={tz} />
            ))}
          </datalist>
          <p className="text-xs text-muted-foreground">Used for order cutoffs and blackout dates (IANA format).</p>
        </div>
      </div>
      <Button type="submit" className="rounded-full">
        Save regional settings
      </Button>
    </form>
  );
}
