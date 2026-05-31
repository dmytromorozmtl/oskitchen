import { readFileSync } from "fs";
import { join } from "path";
import { z } from "zod";

import {
  capitalPartnerSchema,
  CAPITAL_REGIONS,
  type CapitalOfferLifecycleStatus,
  type CapitalRegion,
} from "@/lib/commercial/capital-partners-schema";

export {
  CAPITAL_REGIONS,
  type CapitalOfferLifecycleStatus,
  type CapitalRegion,
} from "@/lib/commercial/capital-partners-schema";

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

function sortLenderPartners(partners: CapitalPartner[]): CapitalPartner[] {
  return [...partners].sort((a, b) => {
    const orderDiff = (a.sortOrder ?? 100) - (b.sortOrder ?? 100);
    if (orderDiff !== 0) return orderDiff;
    return a.name.localeCompare(b.name);
  });
}

export function listLenderOfferPartners(input?: {
  region?: CapitalRegion | null;
  includePaused?: boolean;
}): CapitalPartner[] {
  const region = input?.region ?? null;
  const includePaused = input?.includePaused ?? false;

  const partners = loadCapitalPartnersConfig().partners.filter((partner) => {
    if (!partner.offersEnabled) return false;
    if (!includePaused && partner.offerLifecycleStatus === "paused") return false;
    if (region && !partner.regions.includes(region)) return false;
    return true;
  });

  return sortLenderPartners(partners);
}

export function mapCountryToCapitalRegion(country: string | null | undefined): CapitalRegion {
  const normalized = country?.trim().toLowerCase() ?? "";
  if (!normalized) return "US";

  if (
    normalized === "us" ||
    normalized === "usa" ||
    normalized === "united states" ||
    normalized.includes("united states")
  ) {
    return "US";
  }
  if (normalized === "ca" || normalized === "canada" || normalized.includes("canada")) {
    return "CA";
  }
  if (
    normalized === "uk" ||
    normalized === "gb" ||
    normalized === "united kingdom" ||
    normalized.includes("united kingdom")
  ) {
    return "UK";
  }

  const euCountries = new Set([
    "at",
    "austria",
    "be",
    "belgium",
    "de",
    "germany",
    "fr",
    "france",
    "es",
    "spain",
    "it",
    "italy",
    "nl",
    "netherlands",
    "ie",
    "ireland",
    "pt",
    "portugal",
    "pl",
    "poland",
    "eu",
    "europe",
  ]);
  if (euCountries.has(normalized)) return "EU";

  return "US";
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
    if (partner.offersEnabled && !partner.offerApplyUrlTemplate?.trim()) {
      errors.push(`${partner.slug}: offersEnabled requires offerApplyUrlTemplate`);
    }
    if (partner.offersEnabled && !partner.offerDisclosure?.trim()) {
      errors.push(`${partner.slug}: offersEnabled requires offerDisclosure`);
    }
    for (const region of partner.regions) {
      if (!CAPITAL_REGIONS.includes(region as CapitalRegion)) {
        errors.push(`${partner.slug}: unsupported region code ${region}`);
      }
    }
  }
  return errors;
}

/** Reset cache for tests */
export function resetCapitalPartnersConfigCache(): void {
  cachedConfig = null;
}
