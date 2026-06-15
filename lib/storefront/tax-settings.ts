import { z } from "zod";
/** How checkout computes tax lines at payment time. */
export const taxJurisdictionModes = [
  "single",
  "us_sales",
  "ca_sales",
  "eu_vat",
] as const;

export type TaxJurisdictionMode = (typeof taxJurisdictionModes)[number];

export const taxComponentSchema = z.object({
  id: z.string().min(1).max(32),
  label: z.string().min(1).max(80),
  ratePercent: z.number().min(0).max(100),
  /** goods = subtotal after discount; delivery = delivery fee only; all = goods + delivery */
  appliesTo: z.enum(["goods", "delivery", "all"]).optional().default("goods"),
});

export type TaxComponent = z.infer<typeof taxComponentSchema>;

export const storefrontTaxSettingsSchema = z.object({
  mode: z.enum(taxJurisdictionModes).default("single"),
  taxIncludedInPrices: z.boolean().optional().default(false),
  /** ISO region hint for receipts (US-CA, CA-ON, DE, etc.) */
  regionCode: z.string().max(16).optional(),
  components: z.array(taxComponentSchema).min(0).max(8),
});

export type StorefrontTaxSettings = z.infer<typeof storefrontTaxSettingsSchema>;

export const DEFAULT_TAX_SETTINGS: StorefrontTaxSettings = {
  mode: "single",
  taxIncludedInPrices: false,
  components: [{ id: "tax", label: "Tax", ratePercent: 0, appliesTo: "goods" }],
};

export function parseStorefrontTaxSettings(raw: unknown): StorefrontTaxSettings {
  const r = storefrontTaxSettingsSchema.safeParse(raw);
  return r.success ? r.data : DEFAULT_TAX_SETTINGS;
}

export function parseTaxSettingsFromSettingsCenter(settingsCenterJson: unknown): StorefrontTaxSettings | null {
  if (!settingsCenterJson || typeof settingsCenterJson !== "object") return null;
  const sf = (settingsCenterJson as Record<string, unknown>).storefront;
  if (!sf || typeof sf !== "object") return null;
  const tax = (sf as Record<string, unknown>).tax;
  if (!tax) return null;
  return parseStorefrontTaxSettings(tax);
}

export const taxSettingsFromKitchenSettings = parseTaxSettingsFromSettingsCenter;

export function presetTaxSettings(mode: TaxJurisdictionMode): StorefrontTaxSettings {
  switch (mode) {
    case "us_sales":
      return {
        mode: "us_sales",
        taxIncludedInPrices: false,
        regionCode: "US",
        components: [
          { id: "federal", label: "Federal excise", ratePercent: 0, appliesTo: "goods" },
          { id: "state", label: "State sales tax", ratePercent: 0, appliesTo: "goods" },
        ],
      };
    case "ca_sales":
      return {
        mode: "ca_sales",
        taxIncludedInPrices: false,
        regionCode: "CA",
        components: [
          { id: "gst", label: "GST", ratePercent: 5, appliesTo: "goods" },
          { id: "pst", label: "PST / QST", ratePercent: 0, appliesTo: "goods" },
        ],
      };
    case "eu_vat":
      return {
        mode: "eu_vat",
        taxIncludedInPrices: true,
        regionCode: "EU",
        components: [{ id: "vat", label: "VAT", ratePercent: 20, appliesTo: "goods" }],
      };
    default:
      return {
        mode: "single",
        taxIncludedInPrices: false,
        components: [{ id: "tax", label: "Tax", ratePercent: 0, appliesTo: "goods" }],
      };
  }
}

export function mergeKitchenLegacyTax(
  settings: StorefrontTaxSettings | null,
  kitchen: {
    defaultTaxRate: number | null;
    taxDisplayName: string | null;
    taxIncludedInPrices: boolean;
  } | null,
): StorefrontTaxSettings {
  if (settings && settings.components.some((c) => c.ratePercent > 0)) {
    return {
      ...settings,
      taxIncludedInPrices: settings.taxIncludedInPrices ?? kitchen?.taxIncludedInPrices ?? false,
    };
  }
  const rate = kitchen?.defaultTaxRate ?? 0;
  const label = kitchen?.taxDisplayName?.trim() || "Tax";
  return {
    mode: "single",
    taxIncludedInPrices: kitchen?.taxIncludedInPrices ?? false,
    components: [{ id: "tax", label, ratePercent: rate, appliesTo: "goods" }],
  };
}
