import { readFileSync } from "fs";
import { join } from "path";
import { z } from "zod";

const capitalPartnerBillingRateSchema = z.object({
  partnerSlug: z.string().min(1).max(80),
  referralFeeBps: z.number().int().min(0).max(10_000).optional(),
  currency: z.string().min(3).max(8).optional(),
});

const capitalPartnerBillingConfigSchema = z.object({
  version: z.number().int().positive(),
  updatedAt: z.string(),
  defaultCurrency: z.string().min(3).max(8),
  defaultReferralFeeBps: z.number().int().min(0).max(10_000),
  disclosure: z.string().min(1).max(800),
  partners: z.array(capitalPartnerBillingRateSchema),
});

export type CapitalPartnerBillingConfig = z.infer<typeof capitalPartnerBillingConfigSchema>;

export const CAPITAL_PARTNER_BILLING_CONFIG_PATH = "config/commercial/capital-partner-billing.json";

let cachedConfig: CapitalPartnerBillingConfig | null = null;

export function loadCapitalPartnerBillingConfig(): CapitalPartnerBillingConfig {
  if (cachedConfig) return cachedConfig;
  const raw = readFileSync(join(process.cwd(), CAPITAL_PARTNER_BILLING_CONFIG_PATH), "utf8");
  const parsed = capitalPartnerBillingConfigSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error(`Invalid ${CAPITAL_PARTNER_BILLING_CONFIG_PATH}: ${parsed.error.message}`);
  }
  cachedConfig = parsed.data;
  return parsed.data;
}

export function resetCapitalPartnerBillingConfigCache(): void {
  cachedConfig = null;
}

export function currentCapitalBillingPeriodMonth(from = new Date()): string {
  const year = from.getUTCFullYear();
  const month = String(from.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function resolveCapitalPartnerBillingRates(partnerSlug: string): {
  referralFeeBps: number;
  currency: string;
} {
  const config = loadCapitalPartnerBillingConfig();
  const override = config.partners.find((row) => row.partnerSlug === partnerSlug);
  return {
    referralFeeBps: override?.referralFeeBps ?? config.defaultReferralFeeBps,
    currency: override?.currency ?? config.defaultCurrency,
  };
}
