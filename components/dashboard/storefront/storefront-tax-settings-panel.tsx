"use client";

import { useState } from "react";

import {
  applyStorefrontTaxPresetFormAction,
  saveStorefrontTaxSettingsFormAction,
} from "@/actions/storefront-tax-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StorefrontTaxSettings, TaxJurisdictionMode } from "@/lib/storefront/tax-settings";
import { taxJurisdictionModes } from "@/lib/storefront/tax-settings";

const MODE_LABELS: Record<TaxJurisdictionMode, string> = {
  single: "Single rate",
  us_sales: "United States (federal + state)",
  ca_sales: "Canada (GST + PST/QST)",
  eu_vat: "European Union (VAT)",
};

export function StorefrontTaxSettingsPanel({ initial }: { initial: StorefrontTaxSettings }) {
  const [mode, setMode] = useState<TaxJurisdictionMode>(initial.mode);
  const [componentsJson, setComponentsJson] = useState(
    JSON.stringify(initial.components, null, 2),
  );

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle>Sales tax &amp; VAT</CardTitle>
        <CardDescription>
          Configure how tax appears at checkout. Supports stacked US sales tax, Canadian GST/PST, and EU
          VAT. Legacy kitchen single-rate fields apply only when all component rates are zero.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {taxJurisdictionModes.map((m) => (
            <form key={m} action={applyStorefrontTaxPresetFormAction}>
              <input type="hidden" name="presetMode" value={m} />
              <Button type="submit" variant="outline" size="sm" className="rounded-full">
                Load {MODE_LABELS[m]} preset
              </Button>
            </form>
          ))}
        </div>

        <form action={saveStorefrontTaxSettingsFormAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="taxMode">Jurisdiction mode</Label>
              <select
                id="taxMode"
                name="mode"
                value={mode}
                onChange={(e) => setMode(e.target.value as TaxJurisdictionMode)}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                {taxJurisdictionModes.map((m) => (
                  <option key={m} value={m}>
                    {MODE_LABELS[m]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="regionCode">Region code (receipts)</Label>
              <Input
                id="regionCode"
                name="regionCode"
                defaultValue={initial.regionCode ?? ""}
                placeholder="US-CA, CA-ON, DE"
                className="rounded-xl font-mono text-sm"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="taxIncludedInPrices"
              value="on"
              defaultChecked={initial.taxIncludedInPrices}
              className="h-4 w-4 rounded border-input"
            />
            Prices include tax (common for EU VAT menus)
          </label>

          <div className="space-y-2">
            <Label htmlFor="componentsJson">Tax components (JSON)</Label>
            <Textarea
              id="componentsJson"
              name="componentsJson"
              rows={10}
              value={componentsJson}
              onChange={(e) => setComponentsJson(e.target.value)}
              className="rounded-xl font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Each component: id, label, ratePercent, appliesTo (goods | delivery | all). Rates stack and
              appear as separate lines at checkout.
            </p>
          </div>

          <Button type="submit" className="rounded-full">
            Save tax settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
