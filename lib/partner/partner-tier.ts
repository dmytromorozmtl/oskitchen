import type { PartnerTier } from "@prisma/client";

export const PARTNER_TIER_LABEL: Record<PartnerTier, string> = {
  FOUNDING: "Founding",
  STANDARD: "Standard",
  PREMIUM: "Premium",
  ENTERPRISE: "Enterprise",
};
