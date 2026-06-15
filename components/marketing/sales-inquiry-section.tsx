'use client';

import { submitSalesInquiryFormAction } from '@/actions/external';
import {
  HubSpotEmbed,
  hasHubSpotPortal,
  hubSpotSalesFormId,
} from '@/components/marketing/hubspot-embed';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const BUSINESS_TYPES = [
  'Meal prep',
  'Restaurant',
  'Catering',
  'Ghost kitchen',
  'Bakery',
  'Bar / café',
  'Other',
] as const;

export function SalesInquirySection() {
  const hsFormId = hubSpotSalesFormId();

  if (hasHubSpotPortal() && hsFormId) {
    return (
      <div>
        <p className="mb-6 text-sm text-muted-foreground">
          Submit the form below — our team typically responds within one business day (US/CA time zones).
        </p>
        <HubSpotEmbed formId={hsFormId} />
      </div>
    );
  }

  return (
    <form action={submitSalesInquiryFormAction} className="grid gap-4">
      <input name="company_hp" className="hidden" tabIndex={-1} autoComplete="off" />
      <Input name="fullName" placeholder="Full name" required autoComplete="name" />
      <Input name="email" type="email" placeholder="Work email" required autoComplete="email" />
      <Input name="phone" placeholder="Phone (optional)" autoComplete="tel" />
      <Input name="company" placeholder="Company / kitchen name" />
      <Input name="website" placeholder="Website (optional)" type="url" />
      <div className="grid gap-4 md:grid-cols-3">
        <select
          name="businessType"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          defaultValue=""
          required
        >
          <option value="" disabled>
            Business type
          </option>
          {BUSINESS_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <Input name="locations" placeholder="# Locations" />
        <Input name="weeklyOrders" placeholder="Weekly orders (approx.)" />
      </div>
      <Textarea
        name="currentSystems"
        placeholder="Current stack (POS, Shopify, spreadsheets, marketplaces…)"
        rows={3}
      />
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Channels to connect (optional)</legend>
        <div className="grid gap-2 text-sm md:grid-cols-2">
          {[
            ['woocommerce', 'WooCommerce'],
            ['shopify', 'Shopify'],
            ['manual_orders', 'Manual / phone orders'],
            ['public_storefront', 'Own storefront'],
          ].map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 rounded-md border border-border/80 p-3">
              <input type="checkbox" name="integrationsNeeded" value={value} className="rounded" />
              {label}
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Uber Eats / DoorDash native sync is not sold as live today — we will only scope what is in the
          capability matrix.
        </p>
      </fieldset>
      <Textarea name="message" placeholder="Timeline, locations, and what success looks like in 90 days" rows={4} />
      <Button type="submit">Request custom quote</Button>
    </form>
  );
}
