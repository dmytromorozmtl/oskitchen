import type { CompetitorBattleCardP1_85Slug } from "@/lib/marketing/competitor-battle-cards-p1-85-policy";

export type CompetitorBattleCardP1_85Entry = {
  slug: CompetitorBattleCardP1_85Slug;
  displayName: string;
  cardId: string;
  theyWin: string;
  trap: string;
  redirect: string;
  icpFit: string;
  talkTrack: string;
  comparePath: string;
};

/** Twenty-one one-page battle cards — aligned with full audit battle map. */
export const COMPETITOR_BATTLE_CARDS_P1_85_ENTRIES: readonly CompetitorBattleCardP1_85Entry[] = [
  {
    slug: "toast",
    displayName: "Toast",
    cardId: "BC01",
    theyWin:
      "Certified hardware (Toast Go), US restaurant field support, payments scale, xtraCHEF brand, thousands of reference customers.",
    trap: '"We replace Toast overnight" · "We beat Toast on hardware" · "Live DoorDash/Uber like Toast"',
    redirect:
      "Software-first POS on devices you own · order hub → production → packing depth · B2B marketplace scaffold · Integration Health honesty — verify BETA rows.",
    icpFit: "Ghost kitchen, meal prep, commissary — not full-service dining needing floor hardware day-one.",
    talkTrack:
      "Toast owns in-restaurant hardware and scale. We target operators who want a unified cloud OS with honest BETA labels — verify LIVE integrations before claiming parity.",
    comparePath: "/compare/toast",
  },
  {
    slug: "square",
    displayName: "Square",
    cardId: "BC02",
    theyWin:
      "SMB signup friction, Reader ecosystem, Cash App brand, offline card where offered, millions of sellers.",
    trap: '"We\'re cheaper than Square" · "Free tier matches Square" · "Same payments scale"',
    redirect:
      "Kitchen/production/packing workflow depth · meal-prep cutoffs + packing by window · Today Command Center · no terminal lease.",
    icpFit: "Operators where orders drive production — not simple counter-only cafés.",
    talkTrack:
      "Square is the default for simple retail POS. We build for operators who run production kitchens — typical pilot proof still required.",
    comparePath: "/compare/square",
  },
  {
    slug: "lightspeed",
    displayName: "Lightspeed",
    cardId: "BC03",
    theyWin:
      "Established restaurant + retail install base, partner/hardware channels, proven multi-location deployments.",
    trap: '"Better than Lightspeed in every way" · "Enterprise-ready day one" · "LIVE integrations parity"',
    redirect:
      "AI module breadth (BETA) · B2B HoReCa marketplace buyer · Today hub — not proven at Lightspeed enterprise scale.",
    icpFit: "1–3 location operators optimizing kitchen execution — not 20+ site enterprise RFP.",
    talkTrack:
      "Lightspeed has proven multi-site deployments. We match software ambition but verify LIVE integrations and customer proof before claiming parity.",
    comparePath: "/compare/lightspeed",
  },
  {
    slug: "poster",
    displayName: "Poster",
    cardId: "BC04",
    theyWin:
      "EU cloud POS footprint, simple venue onboarding, regional pricing familiarity for European operators.",
    trap: '"Poster parity overnight" · "Same EU compliance certified" · "Replace Poster on day one"',
    redirect:
      "Full-stack food ops OS — commissary, meal prep, Integration Health moat · English-first GTM with honest BETA posture.",
    icpFit: "Multi-channel food operators needing production depth — not EU counter-only seeking Poster simplicity.",
    talkTrack:
      "Poster wins simple EU venue POS. We sell a kitchen operating system with marketplace and AI modules — verify regional proof before expansion claims.",
    comparePath: "/compare/restaurant-pos",
  },
  {
    slug: "clover",
    displayName: "Clover",
    cardId: "BC05",
    theyWin:
      "Fiserv-backed payments, Clover Station/Mini/Flex hardware, simple in-venue counter POS maturity.",
    trap: '"Clover parity on production kitchen" · "Same payments bundle without hardware"',
    redirect:
      "Browser/tablet POS with order-to-fulfillment software depth — production board, packing, B2B supply marketplace angle.",
    icpFit: "Production kitchens and multi-channel fulfillment — not counter-only needing Fiserv bundle day-one.",
    talkTrack:
      "Clover wins simple counter POS and payments bundles. We target production kitchens — honest BETA labels, not affiliated with Fiserv.",
    comparePath: "/compare/restaurant-pos",
  },
  {
    slug: "touchbistro",
    displayName: "TouchBistro",
    cardId: "BC06",
    theyWin:
      "Proven iPad dining-room POS, familiar floor workflows, KDS add-on maturity for traditional restaurants.",
    trap: '"TouchBistro floor parity certified" · "Full-service table management day-one"',
    redirect:
      "Multi-channel order hub and kitchen production truth · order hub → KDS → packing · Integration Health for pre-LIVE posture.",
    icpFit: "Hybrid operators needing kitchen production truth — disqualify full-service floor-plan certification day-one.",
    talkTrack:
      "TouchBistro fits dine-in table service. OS Kitchen fits hybrid operators who need kitchen production truth and B2B supply.",
    comparePath: "/compare/touchbistro",
  },
  {
    slug: "revel",
    displayName: "Revel",
    cardId: "BC07",
    theyWin:
      "Legacy iPad POS install base, established reseller channels, proven QSR franchise deployments.",
    trap: '"Revel parity on day one" · "Migrate Revel franchise overnight"',
    redirect:
      "Cloud-native commissary and multi-brand OS — faster iteration UX for ≤5-location operators without legacy migration timeline.",
    icpFit: "Commissaries and multi-concept greenfield — disqualify established Revel franchise needing reseller support.",
    talkTrack:
      "Revel serves established QSR installs. We target commissaries starting fresh — no legacy parity claim.",
    comparePath: "/compare/restaurant-pos",
  },
  {
    slug: "oracle_micros",
    displayName: "Oracle MICROS",
    cardId: "BC08",
    theyWin:
      "Enterprise incumbency, Fortune 500 references, deep on-prem and cloud Simphony deployments at global scale.",
    trap: '"Oracle parity day one" · "Enterprise-ready SOC 2" · "Replace Simphony overnight"',
    redirect:
      "Modern UX and API-first cloud OS for ≤5-location operators — not enterprise RFP requiring Oracle references.",
    icpFit: "Independent operators upgrading from spreadsheets — not global enterprise needing Simphony SI partners.",
    talkTrack:
      "Oracle MICROS wins enterprise incumbency. We win operator UX for independent food ops — verify scope before enterprise claims.",
    comparePath: "/compare/restaurant-pos",
  },
  {
    slug: "ncr_aloha",
    displayName: "NCR Aloha",
    cardId: "BC09",
    theyWin:
      "Massive installed base, on-prem legacy familiarity, franchise QSR deployments, established support channels.",
    trap: '"Aloha migration overnight" · "Same on-prem reliability certified" · "NCR parity"',
    redirect:
      "Cloud KDS multi-station and production board — greenfield cloud path without on-prem legacy lift.",
    icpFit: "New concepts and ghost kitchens — disqualify franchise needing NCR field support continuity.",
    talkTrack:
      "NCR Aloha wins installed base. We offer cloud-native kitchen ops — not a certified Aloha replacement program.",
    comparePath: "/compare/restaurant-pos",
  },
  {
    slug: "spoton",
    displayName: "SpotOn",
    cardId: "BC10",
    theyWin:
      "Mid-market restaurant POS + payments bundle, US field sales, marketing and loyalty add-on packages.",
    trap: '"SpotOn parity on payments bundle" · "Same mid-market field support"',
    redirect:
      "Unified order-to-fulfillment software with Owner Daily Briefing · Today hub + marketplace buyer catalog (BETA).",
    icpFit: "Kitchen OS buyers — not payments-first mid-market restaurant POS RFP.",
    talkTrack:
      "SpotOn competes on bundled payments. We sell a kitchen operating system with AI modules — still proving pilot KPIs.",
    comparePath: "/compare/restaurant-pos",
  },
  {
    slug: "olo",
    displayName: "Olo",
    cardId: "BC11",
    theyWin:
      "Dispatch and delivery network at scale, enterprise digital ordering brand, proven aggregator partnerships.",
    trap: '"Olo dispatch parity" · "Enterprise digital ordering day-one" · "Same aggregator network"',
    redirect:
      "White-label storefront and order hub in one operator OS · own-your-channel story · storefront + KDS with sync health UI.",
    icpFit: "Independent operators owning storefront + kitchen — not enterprise needing Olo dispatch network.",
    talkTrack:
      "Olo wins dispatch network. We help independents own storefront + kitchen ops — not Olo dispatch parity.",
    comparePath: "/compare/olo",
  },
  {
    slug: "chownow",
    displayName: "ChowNow",
    cardId: "BC12",
    theyWin:
      "Commission-friendly storefront builder, consumer brand recognition, simple online ordering for independents.",
    trap: '"ChowNow parity" · "Zero commission guaranteed" · "Same consumer marketplace reach"',
    redirect:
      "Full kitchen OS underneath owned channel — production, packing, POS, Integration Health · commission comparison as illustration only.",
    icpFit: "Operators needing kitchen execution after the order — not ordering-only with mature kitchen elsewhere.",
    talkTrack:
      "ChowNow wins owned online ordering UX. We run what happens after the order hits the kitchen — verify commission math, not guaranteed savings.",
    comparePath: "/compare/restaurant-pos",
  },
  {
    slug: "7shifts",
    displayName: "7shifts",
    cardId: "BC13",
    theyWin:
      "Standalone labor scheduling brand, manager-friendly shift tools, restaurant HR category leadership.",
    trap: '"7shifts parity on labor" · "Best-in-class scheduling certified" · "Replace 7shifts overnight"',
    redirect:
      "Native scheduling inside food ops OS — orders, production, and labor context in one tenant · integration path where configured.",
    icpFit: "Operators consolidating ops stack — not HR-only buyer satisfied with standalone scheduling.",
    talkTrack:
      "7shifts wins standalone scheduling brand. We embed labor beside orders and KDS — verify integration maturity before LIVE claims.",
    comparePath: "/integrations",
  },
  {
    slug: "homebase",
    displayName: "Homebase",
    cardId: "BC14",
    theyWin:
      "SMB labor scheduling and time clocks, simple hourly workforce UX, broad small-business brand.",
    trap: '"Homebase certified everywhere" · "Unified HR production-ready" · "Same labor depth"',
    redirect:
      "Unified ops OS with LIVE integration where smoke PASS — kitchen and orders remain system of record, not labor-only.",
    icpFit: "Food operators wanting one ops login — not labor-only buyer with separate kitchen stack.",
    talkTrack:
      "Homebase wins labor-only SMB workflows. We unify kitchen ops with labor hooks — verify tenant integration status on Integration Health.",
    comparePath: "/integrations",
  },
  {
    slug: "quickbooks",
    displayName: "QuickBooks",
    cardId: "BC15",
    theyWin:
      "Accountant ecosystem, SMB bookkeeping standard, widespread QBO familiarity and app marketplace.",
    trap: '"QuickBooks GL parity" · "R365-level accounting depth" · "Period close certified"',
    redirect:
      "In-app accounting sync and export paths — operator-friendly finance hooks, not full GL replacement vs R365.",
    icpFit: "Operators needing kitchen-first OS with bookkeeping sync — not CFO-led R365 RFP.",
    talkTrack:
      "QuickBooks wins accountant ecosystem. We sync operational truth outward — verify GL depth before finance parity claims.",
    comparePath: "/integrations",
  },
  {
    slug: "doordash",
    displayName: "DoorDash",
    cardId: "BC16",
    theyWin:
      "Aggregator demand, consumer brand, delivery network scale, merchant familiarity with DoorDash tablets.",
    trap: '"DoorDash LIVE for every tenant" · "Zero commission" · "Replace DoorDash marketplace"',
    redirect:
      "Order hub + KDS after webhook ingest — Integration Health shows PASS/SKIPPED per workspace · verify smoke artifact before LIVE claim.",
    icpFit: "Operators centralizing channel orders into production — not aggregator-only with no kitchen OS need.",
    talkTrack:
      "DoorDash wins demand aggregation. We ingest orders into kitchen truth — show Integration Health; SKIPPED means verify credentials before claiming LIVE.",
    comparePath: "/integrations",
  },
  {
    slug: "uber_eats",
    displayName: "Uber Eats",
    cardId: "BC17",
    theyWin:
      "Global delivery brand, rider network, merchant tablet workflows, marketplace consumer habit.",
    trap: '"Uber Eats LIVE everywhere" · "Same commission economics beat" · "Native menu sync certified"',
    redirect:
      "Multi-channel hub with webhook health monitoring — honest BETA/SKIPPED rows · verify staging smoke before customer claims.",
    icpFit: "Multi-channel kitchens — not single-channel operator with no production complexity.",
    talkTrack:
      "Uber Eats wins delivery brand. We unify channel tickets into KDS — verify integration status; typical pilot requires staging proof.",
    comparePath: "/integrations",
  },
  {
    slug: "shopify",
    displayName: "Shopify",
    cardId: "BC18",
    theyWin:
      "Best-in-class ecommerce, marketing apps, merchant trust, hybrid retail + food merchandising.",
    trap: '"Replace Shopify entirely" · "Unified inventory LIVE cross-channel" · "Shopify integration production-certified"',
    redirect:
      "Kitchen system of record — production from confirmed orders · Woo/Shopify test shop path · verify live smoke before LIVE claim.",
    icpFit: "Meal prep, ghost kitchen, commissary copying Shopify orders into sheets daily.",
    talkTrack:
      "Keep Shopify for marketing if you want — OS Kitchen is where orders become production tickets. We do not claim unified inventory depletion today.",
    comparePath: "/shopify",
  },
  {
    slug: "woocommerce",
    displayName: "WooCommerce",
    cardId: "BC19",
    theyWin:
      "Open-source ecommerce flexibility, WordPress ecosystem, low entry cost, plugin marketplace.",
    trap: '"WooCommerce certified production" · "Plugin-free forever" · "Unified ledger LIVE"',
    redirect:
      "Webhook ingest → KDS with health UI · open-source friendly ops layer — verify plugin + webhook smoke before LIVE claims.",
    icpFit: "WordPress merchants with weekly preorder volume — not pure retail with no kitchen.",
    talkTrack:
      "WooCommerce wins open ecommerce. We operationalize orders into kitchen workflows — verify webhook smoke; plugin fragility is real.",
    comparePath: "/integrations",
  },
  {
    slug: "marketman",
    displayName: "MarketMan",
    cardId: "BC20",
    theyWin:
      "Inventory and purchasing depth, vendor catalog familiarity, food-cost category focus for restaurants.",
    trap: '"MarketMan parity on inventory" · "Deeper inventory than MarketMan today" · "Guaranteed food cost savings"',
    redirect:
      "Full OS — including marketplace buyer, production, POS, and invoice AI — MarketMan depth is a feature slice, not the whole OS.",
    icpFit: "Operators wanting unified ops + B2B supply — not inventory-only buyer with separate kitchen stack.",
    talkTrack:
      "MarketMan wins inventory category depth. OS Kitchen is the full stack including marketplace — verify invoice and inventory maturity per module.",
    comparePath: "/compare/marketman",
  },
  {
    slug: "marginedge",
    displayName: "MarginEdge",
    cardId: "BC21",
    theyWin:
      "Invoice capture category focus, AP workflow familiarity, food-cost operator brand in invoice AI.",
    trap: '"MarginEdge accuracy certified" · "Better invoice AI proven" · "Replace MarginEdge overnight"',
    redirect:
      "Invoice AI is a feature inside full food ops OS — production, POS, marketplace surround AP · verify accuracy benchmarks before superiority claims.",
    icpFit: "Operators needing ops OS with invoice module — not AP-only buyer with separate kitchen platform.",
    talkTrack:
      "MarginEdge wins invoice-first positioning. We embed invoice AI inside the operating system — verify accuracy proof; not affiliated with MarginEdge.",
    comparePath: "/compare/marginedge",
  },
] as const;

export function getCompetitorBattleCardP1_85(
  slug: CompetitorBattleCardP1_85Slug,
): CompetitorBattleCardP1_85Entry | undefined {
  return COMPETITOR_BATTLE_CARDS_P1_85_ENTRIES.find((entry) => entry.slug === slug);
}
