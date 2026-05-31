import { readFileSync } from "fs";
import { join } from "path";
import { z } from "zod";

const capitalPartnerSchema = z.object({
  slug: z.string().min(1).max(80),
  name: z.string().min(1).max(200),
  category: z.enum(["government", "education", "lender", "platform"]),
  description: z.string().min(1).max(800),
  href: z.string().min(1).max(500),
  regions: z.array(z.string().min(2).max(8)).min(1),
  disclosure: z.string().min(1).max(400),
  referralFee: z.boolean(),
  featured: z.boolean().optional().default(false),
  internal: z.boolean().optional().default(false),
});

const capitalPartnersConfigSchema = z.object({
  version: z.number().int().positive(),
  updatedAt: z.string(),
  hubTitle: z.string(),
  hubSubtitle: z.string(),
  referralFeeDisclosure: z.string(),
  hubDisclosures: z.array(z.string()).min(1),
  forbiddenMarketingClaims: z.array(z.string()).min(1),
  partners: z.array(capitalPartnerSchema).min(1),
  educationTopics: z.array(
    z.object({
      title: z.string(),
      body: z.string(),
    }),
  ),
});

export type CapitalPartner = z.infer<typeof capitalPartnerSchema>;
export type CapitalPartnersConfig = z.infer<typeof capitalPartnersConfigSchema>;

export const CAPITAL_PARTNERS_CONFIG_PATH = "config/commercial/capital-partners.json";

let cachedConfig: CapitalPartnersConfig | null = null;

export function loadCapitalPartnersConfig(): CapitalPartnersConfig {
  if (cachedConfig) return cachedConfig;
  const raw = readFileSync(join(process.cwd(), CAPITAL_PARTNERS_CONFIG_PATH), "utf8");
  const parsed = capitalPartnersConfigSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error(`Invalid ${CAPITAL_PARTNERS_CONFIG_PATH}: ${parsed.error.message}`);
  }
  cachedConfig = parsed.data;
  return parsed.data;
}

export function getCapitalPartnerBySlug(slug: string): CapitalPartner | null {
  const config = loadCapitalPartnersConfig();
  return config.partners.find((partner) => partner.slug === slug) ?? null;
}

export function listFeaturedCapitalPartners(): CapitalPartner[] {
  return loadCapitalPartnersConfig().partners.filter((partner) => partner.featured);
}

export function validateCapitalPartnersConfig(config: CapitalPartnersConfig): string[] {
  const errors: string[] = [];
  const slugs = new Set<string>();
  for (const partner of config.partners) {
    if (slugs.has(partner.slug)) {
      errors.push(`Duplicate partner slug: ${partner.slug}`);
    }
    slugs.add(partner.slug);
    if (!partner.internal && !partner.href.startsWith("https://") && !partner.href.startsWith("/")) {
      errors.push(`${partner.slug}: external partners must use https href or internal path`);
    }
  }
  return errors;
}

/** Reset cache for tests */
export function resetCapitalPartnersConfigCache(): void {
  cachedConfig = null;
}
