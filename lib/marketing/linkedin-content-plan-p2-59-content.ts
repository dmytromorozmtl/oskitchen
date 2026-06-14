import type { LinkedInContentPlanP259WeekdaySlot } from "@/lib/marketing/linkedin-content-plan-p2-59-policy";

export type LinkedInContentPlanP259Pillar =
  | "operator_clarity"
  | "honest_ai"
  | "integration_reality"
  | "build_in_public";

export type LinkedInFounderPostSlot = {
  weekday: LinkedInContentPlanP259WeekdaySlot;
  publishTimeLocal: string;
  pillar: LinkedInContentPlanP259Pillar;
  format: "text" | "carousel" | "screenshot" | "video";
  headline: string;
  bodyTemplate: string;
  ctaPath: string;
  utmCampaign: string;
  hashtags: readonly string[];
};

export const LINKEDIN_CONTENT_PLAN_P2_59_UTM_BASE =
  "?utm_source=linkedin&utm_medium=organic&utm_campaign=" as const;

/** Canonical 3-post/week founder-led rotation (Mon · Wed · Fri). */
export const LINKEDIN_FOUNDER_POSTS_PER_WEEK: readonly LinkedInFounderPostSlot[] = [
  {
    weekday: "monday",
    publishTimeLocal: "08:30",
    pillar: "operator_clarity",
    format: "text",
    headline: "Rush hour is an attention problem",
    bodyTemplate: `Rush hour isn't a dashboard problem — it's an attention problem.

We built Today Command Center so owners see:
→ Orders that need action
→ Kitchen + integration signals in one place
→ An AI-assisted briefing from real hub signals (not magic AGI)

Pilot-ready modules · BETA integrations labeled honestly.
**0 signed founding customers today** — building in public.

Try the demo: [DEMO_URL]

#RestaurantTech #MealPrep #KitchenOps`,
    ctaPath: "/demo",
    utmCampaign: "founder_operator_clarity",
    hashtags: ["#RestaurantTech", "#MealPrep", "#KitchenOps"],
  },
  {
    weekday: "wednesday",
    publishTimeLocal: "12:00",
    pillar: "honest_ai",
    format: "carousel",
    headline: "7 AI modules — each with honest limits",
    bodyTemplate: `Module spotlight (founder thread):

We ship **7 proprietary AI modules** in production — each at qualified maturity, not a blanket "AI-powered" claim.

What we say:
→ AI-assisted daily briefing on Today Command Center
→ Food cost alerts from your recipe data
→ BETA labels where smoke proof is incomplete

What we don't say:
→ Guaranteed margin lift
→ Live computer vision without your cameras connected
→ SOC 2 Type II certified (roadmap — not pilot term)

Honest map: [AI_HONESTY_URL]

#RestaurantAI #HoReCa #BuildInPublic`,
    ctaPath: "/ai",
    utmCampaign: "founder_honest_ai",
    hashtags: ["#RestaurantAI", "#HoReCa", "#BuildInPublic"],
  },
  {
    weekday: "friday",
    publishTimeLocal: "09:00",
    pillar: "build_in_public",
    format: "text",
    headline: "Weekly ship log + design partner ask",
    bodyTemplate: `Shipped this week @ OS Kitchen (founder log):

• Integration Health Center — PASS / SKIPPED / FAILED, not fake green
• Order hub → KDS bump path — BETA until your credentials pass smoke
• Design Partner Program — 90 days free platform for co-builders

Looking for ≤5 meal prep / ghost kitchen operators for weekly founder sync + honest BETA labels.

DM "partner" or book 15 min: [BOOK_DEMO_URL]

0 customer logos · LOI before production traffic · founder-led pilot.

#DesignPartner #GhostKitchen #MealPrepSoftware`,
    ctaPath: "/book-demo",
    utmCampaign: "founder_design_partner",
    hashtags: ["#DesignPartner", "#GhostKitchen", "#MealPrepSoftware"],
  },
] as const;

export const LINKEDIN_CONTENT_PLAN_P2_59_PILLAR_LABELS: Record<
  LinkedInContentPlanP259Pillar,
  string
> = {
  operator_clarity: "Operator clarity",
  honest_ai: "Honest AI",
  integration_reality: "Integration reality",
  build_in_public: "Build in public",
};

export const LINKEDIN_CONTENT_PLAN_P2_59_WEEKLY_ROTATION = [
  { week: 1, monday: "operator_clarity", wednesday: "honest_ai", friday: "build_in_public" },
  { week: 2, monday: "integration_reality", wednesday: "operator_clarity", friday: "honest_ai" },
  { week: 3, monday: "honest_ai", wednesday: "build_in_public", friday: "integration_reality" },
  { week: 4, monday: "build_in_public", wednesday: "integration_reality", friday: "operator_clarity" },
] as const;

export function getLinkedInFounderPostForWeekday(
  weekday: LinkedInContentPlanP259WeekdaySlot,
): LinkedInFounderPostSlot {
  const slot = LINKEDIN_FOUNDER_POSTS_PER_WEEK.find((post) => post.weekday === weekday);
  if (!slot) {
    throw new Error(`No founder post slot for weekday: ${weekday}`);
  }
  return slot;
}

export function buildLinkedInUtmUrl(path: string, utmCampaign: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `https://os-kitchen.com${normalized}${LINKEDIN_CONTENT_PLAN_P2_59_UTM_BASE}${utmCampaign}`;
}
