import type { RichSolutionSlug } from '@/lib/marketing/solution-landing-content';

export type SolutionSegmentMeta = {
  emoji: string;
  trustLine: string;
  featuresTag: string;
  featuresTitle: string;
  featuresDescription: string;
  comparisonTag: string;
  faqTag: string;
  faqTitle: string;
  faqDescription: string;
};

export const SOLUTION_SEGMENT_META: Record<RichSolutionSlug, SolutionSegmentMeta> = {
  'meal-prep': {
    emoji: '🥗',
    trustLine: '14-day free trial · Built for weekly preorder cycles',
    featuresTag: 'Built for meal prep',
    featuresTitle: 'Stop reconciling orders in spreadsheets',
    featuresDescription:
      'OS Kitchen connects your menu, preorders, production, and packing — so Sunday prep reflects what customers actually bought.',
    comparisonTag: 'Meal prep comparison',
    faqTag: 'Meal prep FAQ',
    faqTitle: 'Questions from meal prep operators',
    faqDescription:
      'Cutoffs, storefront checkout, production board, and trial scope — answered without overpromising automation.',
  },
  catering: {
    emoji: '🍱',
    trustLine: '14-day free trial · Events to dispatch in one hub',
    featuresTag: 'Built for catering',
    featuresTitle: 'Event catering without inbox chaos',
    featuresDescription:
      'From accepted quote to packed trays — one queue for corporate drops, buffets, and recurring clients.',
    comparisonTag: 'Catering comparison',
    faqTag: 'Catering FAQ',
    faqTitle: 'FAQ for catering & event kitchens',
    faqDescription:
      'Production planning, routes, channels, and honest limitations for complex events.',
  },
  bakeries: {
    emoji: '🥐',
    trustLine: '14-day free trial · Retail + wholesale in one queue',
    featuresTag: 'Built for bakeries',
    featuresTitle: 'Preorder drops that production can actually hit',
    featuresDescription:
      'Align bake schedules, counter sales, and pickup waves so Saturday service does not surprise the bench.',
    comparisonTag: 'Bakery comparison',
    faqTag: 'Bakery FAQ',
    faqTitle: 'Questions bakery operators ask',
    faqDescription:
      'Preorders, pickup capacity, POS, and production — realistic answers for retail and wholesale models.',
  },
  restaurants: {
    emoji: '🍽️',
    trustLine: '14-day free trial · No proprietary hardware · Cancel anytime',
    featuresTag: 'Built for dining rooms',
    featuresTitle: 'Everything your floor and kitchen need in one flow',
    featuresDescription:
      'From table assignment to bumped tickets — designed for full-service teams that cannot afford missed fires during peak service.',
    comparisonTag: 'Compare POS options',
    faqTag: 'Restaurant FAQ',
    faqTitle: 'Common questions from restaurant operators',
    faqDescription:
      'Straight answers on hardware, table service, trials, and how OS Kitchen fits alongside tools you may already use.',
  },
  bars: {
    emoji: '🍸',
    trustLine: '14-day free trial · Run on iPads you already own',
    featuresTag: 'Built for the bar',
    featuresTitle: 'Speed at the rail without losing kitchen sync',
    featuresDescription:
      'Tabs, quick pours, and food tickets that reach the pass — so bartenders stay on the rail and expo stays calm.',
    comparisonTag: 'Bar POS comparison',
    faqTag: 'Bar FAQ',
    faqTitle: 'Questions bar owners ask before switching',
    faqDescription:
      'Tabs, splits, hardware, and trial details — without overselling features still on the roadmap.',
  },
  cafes: {
    emoji: '☕',
    trustLine: '14-day free trial · Counter + pickup in one queue',
    featuresTag: 'Built for cafés',
    featuresTitle: 'Morning rush throughput without ticket chaos',
    featuresDescription:
      'Repeatable one-tap items, order-ahead pickup, and a kitchen thread that keeps pastry and sandwich stations aligned.',
    comparisonTag: 'Café POS comparison',
    faqTag: 'Café FAQ',
    faqTitle: 'FAQ for café & coffee bar operators',
    faqDescription:
      'Order-ahead, loyalty roadmap, and what is included in your trial — answered clearly.',
  },
  'fast-casual': {
    emoji: '🥗',
    trustLine: '14-day free trial · Built for lunch rush volume',
    featuresTag: 'Built for fast-casual',
    featuresTitle: 'Keep the line moving from register to kitchen',
    featuresDescription:
      'High-throughput POS, color-coded KDS, and production checkpoints for teams that optimize for speed and accuracy.',
    comparisonTag: 'Fast-casual comparison',
    faqTag: 'Fast-casual FAQ',
    faqTitle: 'Questions from QSR and fast-casual operators',
    faqDescription:
      'Throughput, kiosk roadmap, and trial scope — realistic expectations for day-one setup.',
  },
  'ghost-kitchens': {
    emoji: '👻',
    trustLine: '14-day free trial · Multi-brand when you are ready',
    featuresTag: 'Built for virtual brands',
    featuresTitle: 'One kitchen, many brands — without spreadsheet chaos',
    featuresDescription:
      'Cross-brand visibility, channel imports, and honest integration status so operators scale virtual menus with confidence.',
    comparisonTag: 'Multi-brand comparison',
    faqTag: 'Ghost kitchen FAQ',
    faqTitle: 'FAQ for ghost & multi-brand operators',
    faqDescription:
      'Brand limits, P&L views, marketplace maturity, and trial setup — no inflated integration claims.',
  },
};
