import type { BusinessType } from "@prisma/client";

export type LeadScoreInput = {
  weeklyOrderVolume?: string | null;
  businessType: BusinessType;
  currentChannels: unknown;
  biggestPain?: string | null;
  interestedFeatures?: unknown;
  country?: string | null;
  businessWebsite?: string | null;
};

export type QualificationLabel = "Hot" | "Warm" | "Cold" | "Poor fit";

const HIGH_FIT: BusinessType[] = [
  "MEAL_PREP",
  "CATERING",
  "GHOST_KITCHEN",
  "CLOUD_KITCHEN",
  "MULTI_BRAND",
  "BAKERY",
  "RESTAURANT",
  "CAFE",
  "BAR",
];

const PAIN_KEYWORDS =
  /\b(packing|mistakes?|manual|spreadsheet|chaos|delivery|production|prep|labels?|cutoff|orders?)\b/i;

const CHANNEL_BOOST =
  /\b(woocommerce|shopify|uber\s*eats|uber\s*direct)\b/i;

function parseWeeklyOrders(raw?: string | null): number | null {
  if (!raw?.trim()) return null;
  const s = raw.toLowerCase();
  const m = s.match(/(\d+)\s*[-–to]+\s*(\d+)/);
  if (m) return Math.max(Number(m[1]), Number(m[2]));
  const single = s.match(/(\d+)/g);
  if (single?.length) return Math.max(...single.map(Number));
  return null;
}

/** Score 0–100 plus qualification label for CRM display. */
export function scoreBetaLead(input: LeadScoreInput): {
  score: number;
  label: QualificationLabel;
} {
  let score = 35;

  const approxOrders = parseWeeklyOrders(input.weeklyOrderVolume);
  if (approxOrders != null) {
    if (approxOrders >= 100) score += 28;
    else if (approxOrders >= 50) score += 18;
    else if (approxOrders >= 20) score += 10;
    else if (approxOrders >= 5) score += 4;
  }

  if (HIGH_FIT.includes(input.businessType)) score += 14;
  else if (input.businessType === "BAKERY") score += 10;
  else if (input.businessType === "RESTAURANT") score += 6;
  else score += 2;

  let channels: string[] = [];
  if (Array.isArray(input.currentChannels)) {
    channels = input.currentChannels.map((c) => String(c).toLowerCase());
  } else if (
    typeof input.currentChannels === "object" &&
    input.currentChannels
  ) {
    channels = Object.keys(input.currentChannels as object).map((k) =>
      k.toLowerCase(),
    );
  }
  const channelStr = channels.join(" ");
  if (CHANNEL_BOOST.test(channelStr)) score += 12;
  if (channels.includes("manual") || channelStr.includes("manual")) score += 4;

  const pain = input.biggestPain ?? "";
  if (PAIN_KEYWORDS.test(pain)) score += 10;

  const feats = Array.isArray(input.interestedFeatures)
    ? (input.interestedFeatures as string[]).join(" ").toLowerCase()
    : String(input.interestedFeatures ?? "").toLowerCase();
  if (
    feats.includes("integration") ||
    feats.includes("order") ||
    feats.includes("production")
  ) {
    score += 6;
  }

  if (input.businessWebsite?.trim()) score += 4;

  const cc = (input.country ?? "").toUpperCase();
  if (cc === "US" || cc === "CA" || cc === "GB" || cc === "AU") score += 3;

  if (input.businessType === "OTHER" && (approxOrders ?? 0) < 10) score -= 12;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let label: QualificationLabel = "Cold";
  if (score >= 72) label = "Hot";
  else if (score >= 52) label = "Warm";
  else if (score < 30 || input.businessType === "OTHER") label = "Poor fit";

  return { score, label };
}
