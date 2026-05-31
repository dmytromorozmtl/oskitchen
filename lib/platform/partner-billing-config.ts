import { readFileSync } from "fs";
import { join } from "path";
import { z } from "zod";

const partnerBillingAppSchema = z.object({
  clientId: z.string().min(1).max(128),
  publisherKey: z.string().min(1).max(120),
  revenueShareBps: z.number().int().min(0).max(10_000).optional(),
  monthlyPlatformFeeCentsPerInstall: z.number().int().min(0).max(1_000_000).optional(),
});

const partnerBillingConfigSchema = z.object({
  version: z.number().int().positive(),
  updatedAt: z.string(),
  defaultCurrency: z.string().min(3).max(8),
  defaultRevenueShareBps: z.number().int().min(0).max(10_000),
  defaultMonthlyPlatformFeeCentsPerInstall: z.number().int().min(0).max(1_000_000),
  installActivationFeeCents: z.number().int().min(0).max(1_000_000),
  disclosure: z.string().min(1).max(800),
  apps: z.array(partnerBillingAppSchema),
});

export type PartnerBillingConfig = z.infer<typeof partnerBillingConfigSchema>;
export type PartnerBillingAppRate = z.infer<typeof partnerBillingAppSchema>;

export const PARTNER_BILLING_CONFIG_PATH = "config/platform/partner-billing.json";

let cachedConfig: PartnerBillingConfig | null = null;

export function loadPartnerBillingConfig(): PartnerBillingConfig {
  if (cachedConfig) return cachedConfig;
  const raw = readFileSync(join(process.cwd(), PARTNER_BILLING_CONFIG_PATH), "utf8");
  const parsed = partnerBillingConfigSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error(`Invalid ${PARTNER_BILLING_CONFIG_PATH}: ${parsed.error.message}`);
  }
  cachedConfig = parsed.data;
  return parsed.data;
}

export function resetPartnerBillingConfigCache(): void {
  cachedConfig = null;
}

export function normalizePublisherKey(publisher: string): string {
  const slug = publisher
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return slug || "unknown-publisher";
}

export function resolvePartnerBillingRates(input: {
  clientId: string;
  publisher: string;
}): {
  publisherKey: string;
  revenueShareBps: number;
  monthlyPlatformFeeCentsPerInstall: number;
  currency: string;
} {
  const config = loadPartnerBillingConfig();
  const appOverride = config.apps.find((app) => app.clientId === input.clientId);
  const publisherKey = appOverride?.publisherKey ?? normalizePublisherKey(input.publisher);
  return {
    publisherKey,
    revenueShareBps: appOverride?.revenueShareBps ?? config.defaultRevenueShareBps,
    monthlyPlatformFeeCentsPerInstall:
      appOverride?.monthlyPlatformFeeCentsPerInstall ??
      config.defaultMonthlyPlatformFeeCentsPerInstall,
    currency: config.defaultCurrency,
  };
}

export function currentBillingPeriodMonth(from = new Date()): string {
  const year = from.getUTCFullYear();
  const month = String(from.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
