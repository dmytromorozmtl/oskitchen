"use client";

import * as React from "react";

import { CountrySelect } from "@/components/onboarding/country-select";
import { Label } from "@/components/ui/label";
import {
  ONBOARDING_CURRENCIES,
  ONBOARDING_TIMEZONE_GROUPS,
} from "@/lib/onboarding/onboarding-locale-options";
import { cn } from "@/lib/utils";

const selectClass =
  "flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type Props = {
  defaultCountry: string;
  defaultCurrency: string;
  defaultTimezone: string;
  defaultLocale: "en" | "fr";
  browserTimezone: string | null;
};

export function OnboardingLocaleFields({
  defaultCountry,
  defaultCurrency,
  defaultTimezone,
  defaultLocale,
  browserTimezone,
}: Props) {
  const resolvedTimezone =
    defaultTimezone && defaultTimezone !== "UTC"
      ? defaultTimezone
      : browserTimezone && browserTimezone.length > 0
        ? browserTimezone
        : "America/Toronto";

  const allZones = ONBOARDING_TIMEZONE_GROUPS.flatMap((g) => g.zones);
  const timezoneInList = allZones.some((z) => z.value === resolvedTimezone);
  const currencyValue = ONBOARDING_CURRENCIES.some((c) => c.code === defaultCurrency)
    ? defaultCurrency
    : "USD";

  return (
    <>
      <CountrySelect defaultValue={defaultCountry} name="country" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <select
            id="currency"
            name="currency"
            required
            defaultValue={currencyValue}
            className={cn(selectClass, "font-mono")}
          >
            {ONBOARDING_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <select
            id="timezone"
            name="timezone"
            required
            defaultValue={timezoneInList ? resolvedTimezone : "UTC"}
            className={cn(selectClass, "font-mono")}
          >
            {!timezoneInList && resolvedTimezone ? (
              <option value={resolvedTimezone}>{resolvedTimezone}</option>
            ) : null}
            {ONBOARDING_TIMEZONE_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.zones.map((z) => (
                  <option key={z.value} value={z.value}>
                    {z.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="locale">Language</Label>
          <select id="locale" name="locale" defaultValue={defaultLocale} className={selectClass}>
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Detected: {browserTimezone ?? "unknown"} — pick a canonical IANA zone (e.g. America/Toronto).
      </p>
    </>
  );
}
