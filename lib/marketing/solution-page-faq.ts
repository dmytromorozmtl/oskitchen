import type { SolutionPageSlug } from '@/lib/demo-verticals';

export type FaqItem = { question: string; answer: string };

const MEAL_PREP_FAQ: FaqItem[] = [
  {
    question: 'Can OS Kitchen replace my meal prep spreadsheets?',
    answer:
      'Yes — for the operational loop. Weekly menus, preorder cutoffs, production quantities, and packing flow from confirmed orders instead of manual tab reconciliation.',
  },
  {
    question: 'Do customers order through my own website?',
    answer:
      'You can run a hosted storefront with Stripe checkout when configured. Orders land in the same hub as manual and counter entries.',
  },
  {
    question: 'How do production quantities get calculated?',
    answer:
      'The production board aggregates confirmed orders by SKU and supports batch-oriented prep when recipes and yields are configured in your workspace.',
  },
  {
    question: 'Can I still take walk-up or phone orders?',
    answer:
      'Yes. Manual and counter POS orders use the same catalog and production queue as online preorders.',
  },
  {
    question: 'What is included in the trial?',
    answer:
      '14 days on your selected plan with core menu, preorder, production, and packing workflows — no credit card required to start.',
  },
];

const CATERING_FAQ: FaqItem[] = [
  {
    question: 'Is OS Kitchen built for corporate catering?',
    answer:
      'Yes. Event-style orders, production planning, packing by drop, and optional routes are designed for B2B catering — not only retail counter service.',
  },
  {
    question: 'Can I import orders from Shopify or WooCommerce?',
    answer:
      'Beta channel imports are available when credentials are configured. All channels normalize into one Order hub with clear maturity labels.',
  },
  {
    question: 'How do delivery routes work?',
    answer:
      'Route modules activate when delivery is in scope for your workspace. Geography and partner access requirements are surfaced honestly in setup.',
  },
  {
    question: 'Does it replace my quoting CRM?',
    answer:
      'OS Kitchen focuses on operations after a quote is won — production, packing, and dispatch. Sales quoting may still live in your CRM until deeper integrations ship.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'Yes — 14-day trial to model one event type or recurring client before you scale channels.',
  },
];

const BAKERY_FAQ: FaqItem[] = [
  {
    question: 'Can I run retail counter and wholesale preorders together?',
    answer:
      'Yes. Counter POS and storefront preorders share one order stream so production sees total demand for each bake day.',
  },
  {
    question: 'How do pickup windows prevent overbooking?',
    answer:
      'Configure capacity per window so customers cannot select slots you cannot fulfill — especially for weekend drops.',
  },
  {
    question: 'Do I need a separate bakery POS terminal?',
    answer:
      'No. OS Kitchen runs in the browser on hardware you already own. Stripe Terminal native drivers are not integrated today.',
  },
  {
    question: 'Can I print labels for wholesale crates?',
    answer:
      'Packing and printable flows are available when enabled on your plan and workspace — confirm details during trial setup.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'Yes — 14 days to validate preorders, production board, and counter workflows on your actual SKU mix.',
  },
];

const RESTAURANT_FAQ: FaqItem[] = [
  {
    question: 'Do I need to buy proprietary terminals from OS Kitchen?',
    answer:
      'No. OS Kitchen runs in the browser on iPads, Android tablets, phones, or desktops you already own. There is no mandatory hardware lease or terminal bundle.',
  },
  {
    question: 'Can guests order from their table without an app?',
    answer:
      'Yes. Generate QR codes per table so guests scan, browse your menu, and submit orders that flow to the same kitchen display as staff-entered tickets.',
  },
  {
    question: 'How does table management work during service?',
    answer:
      'Use a visual floor plan with statuses (Available, Occupied, Reserved, Dirty) and assign open orders to tables so servers and expo share one source of truth.',
  },
  {
    question: 'How does OS Kitchen compare to Toast or Square?',
    answer:
      'OS Kitchen combines POS, kitchen display, table management, QR ordering, and production tools in one web platform — without requiring proprietary hardware. Many teams still use other tools for specific payment or marketplace needs; we are clear about what is live in your workspace.',
  },
  {
    question: 'What is included in the 14-day trial?',
    answer:
      'Full access to core restaurant workflows on the plan you choose. No credit card required to start. Plans begin at $29/month after the trial.',
  },
];

const BAR_FAQ: FaqItem[] = [
  {
    question: 'Can bartenders run multiple open tabs at once?',
    answer:
      'Yes. Open tabs by table or customer name, add items with quick-order drink buttons, and close with tip when the party leaves.',
  },
  {
    question: 'Does OS Kitchen support split checks?',
    answer:
      'Split tracking exists in the data model today. Full split-bill UI is rolling out — contact us if you need early access for high-volume bars.',
  },
  {
    question: 'Will food orders still reach the kitchen?',
    answer:
      'Yes. Bar POS and kitchen display share one order stream so food hits the pass with the same bump workflow as dining rooms.',
  },
  {
    question: 'What hardware do I need behind the bar?',
    answer:
      'Any tablet or phone with a modern browser. No proprietary payment terminal purchase is required to evaluate OS Kitchen.',
  },
  {
    question: 'Is there a free trial for bars?',
    answer:
      'Yes — 14 days with no credit card required to explore tabs, quick-order, and KDS workflows.',
  },
];

const CAFE_FAQ: FaqItem[] = [
  {
    question: 'Can customers order ahead for pickup?',
    answer:
      'Yes. Enable storefront checkout with pickup windows and capacity limits when you configure Stripe — orders land in the same queue as counter POS.',
  },
  {
    question: 'Is OS Kitchen only for coffee shops?',
    answer:
      'It is built for high-repeat counter service — coffee, bakery, and light food — with quick-order buttons and optional kitchen routing for warmed items.',
  },
  {
    question: 'When is loyalty available?',
    answer:
      'Customer CRM and order history are included today. Dedicated loyalty programs are on the Q4 2026 roadmap — we do not market them as live until shipped.',
  },
  {
    question: 'Do I need a separate kiosk app?',
    answer:
      'Counter and handheld POS run in the browser today. A dedicated self-service kiosk flow is planned for Q4 2026; QR ordering is available now.',
  },
  {
    question: 'What does the trial include?',
    answer:
      '14 days on your selected plan with quick-order POS, QR, and kitchen display — no proprietary hardware required.',
  },
];

const FAST_CASUAL_FAQ: FaqItem[] = [
  {
    question: 'Is OS Kitchen built for lunch rush volume?',
    answer:
      'Yes. Daily Service Mode, color-coded KDS, and quick-order buttons are designed for same-day throughput — not only weekly preorder workflows.',
  },
  {
    question: 'When will self-service kiosk be available?',
    answer:
      'A web-based kiosk on tablets is targeted for Q4 2026. Counter POS, QR ordering, and KDS are available in production today.',
  },
  {
    question: 'Can I prep in batches across the menu?',
    answer:
      'Yes — the production board supports batch-oriented prep and checkpoints when your recipes and menus are configured.',
  },
  {
    question: 'How do online and counter orders combine?',
    answer:
      'All channels normalize into one order hub so the kitchen sees a single prioritized queue during service.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'Yes — start a 14-day trial without a credit card to validate throughput on your actual menu.',
  },
];

const GHOST_FAQ: FaqItem[] = [
  {
    question: 'How many virtual brands can I operate?',
    answer:
      'Brand limits depend on plan — see pricing for Starter and Pro caps. Team supports multi-brand command center workflows at scale.',
  },
  {
    question: 'Can I see performance per brand?',
    answer:
      'Yes. Brand Command Center surfaces revenue, order volume, and product counts per virtual brand when multi-brand mode is enabled.',
  },
  {
    question: 'Are Uber Eats and DoorDash live for every account?',
    answer:
      'No. Marketplace adapters require partner access and verified credentials. OS Kitchen shows sync health honestly — we do not display fake “live” badges.',
  },
  {
    question: 'Can WooCommerce or Shopify orders import automatically?',
    answer:
      'Beta channel imports are available when you configure credentials. Orders normalize into the same Order hub as POS and manual rows.',
  },
  {
    question: 'How do I start a pilot?',
    answer:
      'Begin with a 14-day trial, connect your first brand, and add channels as credentials are verified — no inflated integration promises.',
  },
];

export const SOLUTION_PAGE_FAQ: Partial<Record<SolutionPageSlug, FaqItem[]>> = {
  'meal-prep': MEAL_PREP_FAQ,
  catering: CATERING_FAQ,
  bakeries: BAKERY_FAQ,
  restaurants: RESTAURANT_FAQ,
  bars: BAR_FAQ,
  cafes: CAFE_FAQ,
  'fast-casual': FAST_CASUAL_FAQ,
  'ghost-kitchens': GHOST_FAQ,
};

export function faqForSolution(slug: SolutionPageSlug): FaqItem[] {
  return (
    SOLUTION_PAGE_FAQ[slug] ?? [
      {
        question: 'Can I connect Shopify or WooCommerce?',
        answer:
          'Yes — channel imports are available in beta when credentials are configured. Orders sync into one Order hub.',
      },
      {
        question: 'Is onboarding self-serve?',
        answer:
          'Yes. Sign up, configure your workspace, and start a trial. Implementation packages are optional for complex rollouts.',
      },
      {
        question: 'Is there a free trial?',
        answer: 'Yes — 14-day free trial. See pricing for plan details after the trial period.',
      },
    ]
  );
}
