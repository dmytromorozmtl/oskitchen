/**
 * P0-7 — 10 meal prep design partner targets + founder outreach drafts.
 *
 * @see docs/design-partner-outreach-meal-prep-p0-7.md
 */

export const DESIGN_PARTNER_MEAL_PREP_P0_7_POLICY_ID =
  "p0-7-design-partner-meal-prep-outreach-v1" as const;

export const DESIGN_PARTNER_MEAL_PREP_P0_7_DOC =
  "docs/design-partner-outreach-meal-prep-p0-7.md" as const;

export const DESIGN_PARTNER_MEAL_PREP_P0_7_OPERATOR_COUNT = 10 as const;

export const DESIGN_PARTNER_MEAL_PREP_P0_7_FOUNDER_NAME = "Dmytro" as const;

export const DESIGN_PARTNER_MEAL_PREP_P0_7_BOOK_DEMO_URL =
  "https://os-kitchen.com/book-demo?utm_source=founder_outreach&utm_medium=email&utm_campaign=p0-7-meal-prep" as const;

export type DesignPartnerMealPrepP0_7Target = {
  id: string;
  name: string;
  city: string;
  province: string;
  contactRole: string;
  painHook: string;
  status: "research_target";
  founderSubject: string;
  founderBody: string;
};

export const DESIGN_PARTNER_MEAL_PREP_P0_7_TARGETS: DesignPartnerMealPrepP0_7Target[] = [
  {
    id: "dynamite-cuisine-mtl",
    name: "Dynamite Cuisine",
    city: "Montreal",
    province: "QC",
    contactRole: "Owner / head of ops",
    painHook: "Thursday preorder cutoff → Friday production list → Sunday delivery trays",
    status: "research_target",
    founderSubject: "Dynamite Cuisine — still bridging Shopify cutoffs to the prep line?",
    founderBody: `Hi [FIRST_NAME],

I'm Dmytro, founder of OS Kitchen. I follow Montreal meal prep operators who run weekly cutoffs at volume — Dynamite Cuisine came up in our Quebec ICP research.

Most teams your size still copy subscription orders into spreadsheets before the prep line sees a single tray list. We're building a web ops layer that pulls Shopify/Woo webhooks into one order hub → production list → KDS bump — with honest BETA labels when an integration is not live yet.

I'm recruiting ≤5 founding design partners this quarter (not logo buyers). If Thursday cutoff → Friday production list → Sunday delivery trays is still manual, I'd value 15 minutes of your ops reality:

${DESIGN_PARTNER_MEAL_PREP_P0_7_BOOK_DEMO_URL}

Honest scope: 0 signed founding customers today · marketplace ingest is BETA · no fake green integration tiles.

— Dmytro
Founder, OS Kitchen`,
  },
  {
    id: "les-plats-du-chef-mtl",
    name: "Les Plats du Chef",
    city: "Montreal",
    province: "QC",
    contactRole: "Operations lead",
    painHook: "Subscription renewals vs kitchen capacity — webhook → KDS without a spreadsheet bridge",
    status: "research_target",
    founderSubject: "Les Plats du Chef — subscription kitchen without the spreadsheet bridge?",
    founderBody: `Hi [FIRST_NAME],

I'm Dmytro, founder of OS Kitchen. Les Plats du Chef is on our short list of Quebec subscription meal brands where the pain is familiar: web orders land in one system, labels and prep tickets live somewhere else.

We're co-building with ≤5 meal prep operators who will run a staging workspace, give weekly feedback, and accept honest SKIPPED/BETA labels on channels we have not proven in their stack yet.

If webhook → kitchen ticket is still a copy-paste step for your team, reply "interested" or book 15 minutes:

${DESIGN_PARTNER_MEAL_PREP_P0_7_BOOK_DEMO_URL}

No customer logos claimed · 0 signed founding customers · pilot LOI before production traffic.

— Dmytro
Founder, OS Kitchen`,
  },
  {
    id: "yumba-mtl",
    name: "Yumba",
    city: "Montreal",
    province: "QC",
    contactRole: "Founder",
    painHook: "Healthy meal subscription scaling — menu rotation + allergen labels on prep day",
    status: "research_target",
    founderSubject: "Yumba — menu rotation day still a whiteboard problem?",
    founderBody: `Hi [FIRST_NAME],

I'm Dmytro, founder of OS Kitchen. Yumba stood out in our Montreal meal prep scan — healthy subscription volume with the classic scaling pain: menu rotation, prep lists, and allergen clarity on the same morning.

We're not selling a finished POS. We're recruiting design partners who want order hub + production routing + packing clarity without enterprise lock-in. You would see exactly which integrations are LIVE vs BETA in our Integration Health Center — no fake connected badges.

Worth a 15-minute fit call if prep-day chaos still starts in a spreadsheet?

${DESIGN_PARTNER_MEAL_PREP_P0_7_BOOK_DEMO_URL}

0 signed founding customers · honest BETA/SKIPPED integration labels · no logo claims.

— Dmytro
Founder, OS Kitchen`,
  },
  {
    id: "wecook-mtl",
    name: "WeCook",
    city: "Montreal",
    province: "QC",
    contactRole: "COO / kitchen manager",
    painHook: "Meal kit + prepared meal hybrid — SKU sync between storefront and commissary prep",
    status: "research_target",
    founderSubject: "WeCook — storefront SKUs vs commissary prep lists aligned?",
    founderBody: `Hi [FIRST_NAME],

I'm Dmytro, founder of OS Kitchen. WeCook is exactly the Montreal profile we built for: meal kit and prepared meals where the storefront SKU catalog and the commissary prep list drift apart every menu cycle.

I'm opening ≤5 founding design partner slots for operators who will test staging weekly and tell us where production + Today Command Center breaks. Integrations stay honestly labeled — Shopify/Woo paths are our first proof focus.

If SKU sync between web orders and prep is still a weekly fire drill, I'd appreciate 15 minutes:

${DESIGN_PARTNER_MEAL_PREP_P0_7_BOOK_DEMO_URL}

0 signed founding customers · BETA on marketplace channels until your pilot proves otherwise.

— Dmytro
Founder, OS Kitchen`,
  },
  {
    id: "mtl-meal-prep-archetype",
    name: "Montreal Sunday-batch meal prep operator (200–500 meals/week)",
    city: "Montreal",
    province: "QC",
    contactRole: "Owner-operator",
    painHook: "Sunday cutoff chaos — weekly menu publish + tray packing without a second hire",
    status: "research_target",
    founderSubject: "Montreal meal prep — Sunday cutoff without hiring an ops coordinator?",
    founderBody: `Hi [FIRST_NAME],

I'm Dmytro, founder of OS Kitchen. I'm reaching out to owner-operators running ~200–500 meals/week in Montreal — the stage where Sunday cutoff chaos usually forces a second ops hire.

We built OS Kitchen for that wedge: weekly menu publish → preorder cutoff → production list → packing labels → KDS bump, with honest integration status instead of vaporware marketplace claims.

Looking for ≤5 design partners this quarter. If you're still copying orders from DMs + Shopify into prep sheets, reply or book 15 minutes:

${DESIGN_PARTNER_MEAL_PREP_P0_7_BOOK_DEMO_URL}

Internal research outreach — not a mass blast · 0 signed founding customers today.

— Dmytro
Founder, OS Kitchen`,
  },
  {
    id: "fresh-city-tor",
    name: "Fresh City",
    city: "Toronto",
    province: "ON",
    contactRole: "Head of fulfillment",
    painHook: "Organic meal prep subscription — storefront ingest + fulfillment health visibility",
    status: "research_target",
    founderSubject: "Fresh City — fulfillment health you can trust (not green tiles)?",
    founderBody: `Hi [FIRST_NAME],

I'm Dmytro, founder of OS Kitchen. Fresh City is on our Toronto meal prep short list — organic subscription volume where fulfillment truth matters more than another dashboard tile.

Our Integration Health Center shows why ingest failed (signature, mapping, SKIPPED channel) instead of pretending DoorDash/Uber are LIVE. We're recruiting ≤5 Canadian design partners to co-build order hub + production for meal prep operators.

If storefront → kitchen handoff still needs manual reconciliation, I'd value 15 minutes of your stack reality:

${DESIGN_PARTNER_MEAL_PREP_P0_7_BOOK_DEMO_URL}

Honest BETA labels · 0 signed founding customers · pilot LOI before production traffic.

— Dmytro
Founder, OS Kitchen`,
  },
  {
    id: "chef-on-call-can",
    name: "Chef On Call",
    city: "Toronto",
    province: "ON",
    contactRole: "Regional ops director",
    painHook: "Multi-city prep routing — workspace-per-hub rollup without losing cutoff discipline",
    status: "research_target",
    founderSubject: "Chef On Call — multi-city prep with one honest ops view?",
    founderBody: `Hi [FIRST_NAME],

I'm Dmytro, founder of OS Kitchen. Chef On Call is a rare national meal delivery profile — multi-city prep where each hub still needs cutoff discipline and a rollup view that does not lie.

We're pilot-scoping ≤5 locations max for founding partners. You would get workspace-per-hub routing plus Today Command Center rollup, with integrations labeled LIVE/BETA/SKIPPED per channel.

If hub-level prep lists still diverge from the national menu calendar, open to a 15-minute discovery call?

${DESIGN_PARTNER_MEAL_PREP_P0_7_BOOK_DEMO_URL}

0 signed founding customers · design partner program, not enterprise shelfware.

— Dmytro
Founder, OS Kitchen`,
  },
  {
    id: "power-kitchen-van",
    name: "Power Kitchen",
    city: "Vancouver",
    province: "BC",
    contactRole: "Founder / ops",
    painHook: "West Coast meal prep volume — Shopify ingest + Sunday batch KDS",
    status: "research_target",
    founderSubject: "Power Kitchen — Shopify orders → prep line without the Sunday scramble?",
    founderBody: `Hi [FIRST_NAME],

I'm Dmytro, founder of OS Kitchen. Power Kitchen is on our BC meal prep target list — West Coast subscription volume where Shopify ingest and Sunday batch prep often meet in a spreadsheet.

We're building webhook → order hub → production → KDS with artifacts we can show in staging (not slide deck promises). Looking for ≤5 design partners across Canada; Pacific timezone feedback is valuable even with the 3-hour delta from Montreal.

15-minute fit call if Sunday batch still starts with CSV exports?

${DESIGN_PARTNER_MEAL_PREP_P0_7_BOOK_DEMO_URL}

BETA on unproven channels · 0 signed founding customers · LOI before go-live.

— Dmytro
Founder, OS Kitchen`,
  },
  {
    id: "heart-to-home-meals",
    name: "Heart to Home Meals",
    city: "Mississauga",
    province: "ON",
    contactRole: "Director of operations",
    painHook: "Senior-focused meal prep at scale — recurring menus + production calendar discipline",
    status: "research_target",
    founderSubject: "Heart to Home — recurring menus vs production calendar drift?",
    founderBody: `Hi [FIRST_NAME],

I'm Dmytro, founder of OS Kitchen. Heart to Home Meals matches our meal prep ICP: recurring menus, high weekly volume, and production calendar discipline that breaks when orders shift mid-week.

We're recruiting design partners who need order hub + production routing without buying a legacy POS ecosystem. You would see Integration Health honestly — not a wall of green marketplace logos.

If production calendar and live orders still reconcile manually, I'd welcome 15 minutes:

${DESIGN_PARTNER_MEAL_PREP_P0_7_BOOK_DEMO_URL}

Founding cohort ≤5 slots · 0 signed founding customers · forbidden-claims trained sales only.

— Dmytro
Founder, OS Kitchen`,
  },
  {
    id: "ottawa-meal-prep-archetype",
    name: "Ottawa-Gatineau bilingual meal prep operator",
    city: "Ottawa",
    province: "ON",
    contactRole: "Owner",
    painHook: "Bilingual storefront + weekly prep — honest BETA labels for Quebec buyers",
    status: "research_target",
    founderSubject: "Ottawa-Gatineau meal prep — bilingual ops without double entry?",
    founderBody: `Hi [FIRST_NAME],

I'm Dmytro, founder of OS Kitchen. I'm targeting Ottawa-Gatineau owner-operators running bilingual meal prep — weekly menus, subscription cutoffs, and the usual double-entry between French storefront and English prep sheets.

We're co-building with ≤5 Canadian design partners and label integrations honestly for Quebec buyers (BETA/SKIPPED until proven in your stack).

If bilingual menu publish → prep list is still two workflows, reply "interested" or book 15 minutes:

${DESIGN_PARTNER_MEAL_PREP_P0_7_BOOK_DEMO_URL}

Research outreach · not contacted at scale · 0 signed founding customers.

— Dmytro
Founder, OS Kitchen`,
  },
] as const;
