import { z } from "zod";

export const CAPITAL_REGIONS = ["US", "CA", "UK", "EU"] as const;
export type CapitalRegion = (typeof CAPITAL_REGIONS)[number];

export const CAPITAL_OFFER_LIFECYCLE_STATUSES = ["sandbox", "live", "paused"] as const;
export type CapitalOfferLifecycleStatus = (typeof CAPITAL_OFFER_LIFECYCLE_STATUSES)[number];

export const capitalPartnerSchema = z.object({
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
  offersEnabled: z.boolean().optional().default(false),
  offerProgramName: z.string().max(200).optional(),
  offerApplyUrlTemplate: z.string().max(500).optional(),
  offerDisclosure: z.string().max(800).optional(),
  offerAmountLabel: z.string().max(200).optional(),
  webhookSecretEnvKey: z.string().max(80).optional(),
  applyUrlEnvKey: z.string().max(80).optional(),
  offerLifecycleStatus: z.enum(CAPITAL_OFFER_LIFECYCLE_STATUSES).optional().default("sandbox"),
  sortOrder: z.number().int().min(0).max(9999).optional().default(100),
  /** ISO date when partner agreement became effective — required for live lenders. */
  partnerAgreementEffectiveDate: z.string().max(32).optional(),
  /** Partner-hosted state lending ad disclosures URL — shown on merchant cards when live. */
  stateDisclosureUrl: z.string().max(500).optional(),
  /** Referral fee in basis points — accrual-only billing on FUNDED webhook. */
  referralFeeBps: z.number().int().min(0).max(10_000).optional(),
  contactEmail: z.string().email().max(255).optional(),
  /** Optional CIDR allowlist for partner pull API — empty means no IP restriction. */
  pullIpAllowlist: z.array(z.string().max(64)).optional(),
});
