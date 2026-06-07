/**
 * Absolute Final Task 75 — local partner network onboarding.
 *
 * @see docs/local-partner-network-onboarding.md
 * @see docs/restaurant-partnerships-strategy.md
 */

export const LOCAL_PARTNER_NETWORK_ABSOLUTE_FINAL_POLICY_ID =
  "local-partner-network-absolute-final-v1" as const;

export const LOCAL_PARTNER_NETWORK_DOC = "docs/local-partner-network-onboarding.md" as const;

export const LOCAL_PARTNER_NETWORK_STRATEGY_DOC =
  "docs/restaurant-partnerships-strategy.md" as const;

export const LOCAL_PARTNER_NETWORK_REFERRAL_DOC = "docs/referral-program.md" as const;

export const LOCAL_PARTNER_NETWORK_ICP_DOC = "docs/icp-definition-final.md" as const;

export const LOCAL_PARTNER_NETWORK_PARTNER_SEGMENTS = [
  "restaurant_tech_consultant",
  "pos_installer_msp",
  "restaurant_accountant",
  "commissary_incubator",
  "culinary_ops_coach",
] as const;

export type LocalPartnerSegment = (typeof LOCAL_PARTNER_NETWORK_PARTNER_SEGMENTS)[number];

export const LOCAL_PARTNER_NETWORK_TIERS = ["Explorer", "Active", "Premier"] as const;

export type LocalPartnerTier = (typeof LOCAL_PARTNER_NETWORK_TIERS)[number];

export const LOCAL_PARTNER_NETWORK_MIN_SIGNED_FOR_PUBLIC = 3 as const;

export const LOCAL_PARTNER_NETWORK_MIN_LOIS_FOR_ENABLE = 1 as const;

export const LOCAL_PARTNER_NETWORK_ONBOARDING_STEPS = [
  "O1",
  "O2",
  "O3",
  "O4",
  "O5",
  "O6",
  "O7",
] as const;

export const LOCAL_PARTNER_NETWORK_REQUIRED_SECTIONS = [
  "## Program summary",
  "## Partner segments",
  "## Onboarding checklist",
  "## Partner tiers",
  "## Referral economics",
  "## Enable gate",
  "## Human gate checklist",
  "## Sales-safe wording",
  "## Slot tracker",
] as const;

export const LOCAL_PARTNER_NETWORK_HONESTY_MARKERS = [
  "Honesty rule",
  "PRE-LAUNCH",
  "not binding",
  "Do not say",
  "0 local partners signed",
] as const;

export const LOCAL_PARTNER_NETWORK_FORBIDDEN_CLAIMS = [
  "Certified OS Kitchen partner network nationwide",
  "Guaranteed referral income",
  "Thousands of local partners",
  "Production-certified partner program",
] as const;

export const LOCAL_PARTNER_NETWORK_WIRING_PATHS = [
  LOCAL_PARTNER_NETWORK_DOC,
  LOCAL_PARTNER_NETWORK_STRATEGY_DOC,
  LOCAL_PARTNER_NETWORK_REFERRAL_DOC,
  LOCAL_PARTNER_NETWORK_ICP_DOC,
  "lib/partners/local-partner-network-absolute-final-policy.ts",
  "lib/partners/local-partner-network-audit.ts",
  "tests/unit/local-partner-network-absolute-final.test.ts",
] as const;

export const LOCAL_PARTNER_NETWORK_UNIT_TEST =
  "tests/unit/local-partner-network-absolute-final.test.ts" as const;

export const LOCAL_PARTNER_NETWORK_CI_SCRIPTS = [
  "test:ci:local-partner-network",
  "test:ci:local-partner-network:cert",
] as const;

export function isLocalPartnerNetworkPublicEnabled(input: {
  signedLois: number;
  signedPartnerAcks: number;
  referredPilotsWeek4Plus: number;
}): boolean {
  return (
    input.signedLois >= LOCAL_PARTNER_NETWORK_MIN_LOIS_FOR_ENABLE &&
    input.signedPartnerAcks >= LOCAL_PARTNER_NETWORK_MIN_SIGNED_FOR_PUBLIC &&
    input.referredPilotsWeek4Plus >= 1
  );
}

export function localPartnerTierForReferrals(referralCount: number): LocalPartnerTier {
  if (referralCount >= 3) return "Premier";
  if (referralCount >= 1) return "Active";
  return "Explorer";
}
