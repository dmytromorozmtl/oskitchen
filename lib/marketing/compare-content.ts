/** Competitive comparison pages — honest positioning; verify vendor plans before purchase. */

export type ComparePageSlug =
  | 'restaurant-pos'
  | 'meal-prep-software'
  | 'toast'
  | 'square'
  | 'marketman'
  | 'deliverect'
  | 'restaurant365'
  | 'touchbistro'
  | 'olo'
  | 'kitchenos-vs-lightspeed'
  | 'kitchenos-vs-7shifts'
  | 'kitchenos-vs-meez';

export type CompareRow = {
  feature: string;
  kitchenos: string;
  competitorA: string;
  competitorB: string;
};

export type ComparePageContent = {
  slug: ComparePageSlug;
  path: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  methodology: string;
  comparisonTag: string;
  comparison: {
    title: string;
    competitorALabel: string;
    competitorBLabel: string;
    rows: CompareRow[];
  };
  disclaimer: string;
  whenToChoose: Array<{ title: string; body: string }>;
  faqs: Array<{ q: string; a: string }>;
  blogSlug?: string;
  primaryCta: { label: string; href: string };
};

export const COMPARE_PAGES: ComparePageContent[] = [
  {
    slug: 'restaurant-pos',
    path: '/compare/restaurant-pos',
    metaTitle: 'Restaurant POS Comparison 2026 — Toast vs Square vs OS Kitchen',
    metaDescription:
      'Compare restaurant POS systems: hardware, kitchen display, tables, and total cost. Honest feature matrix for US and Canadian operators.',
    eyebrow: 'Restaurant POS comparison',
    headline: 'Toast vs Square vs OS Kitchen — what actually matters in 2026',
    subheadline:
      'Payments are table stakes. The decision is whether your floor, kitchen, and production run on one ticket stream — or three apps that drift apart on a Friday night.',
    methodology:
      'We scored platforms on day-of-service POS, kitchen routing, table/QR workflows, back-of-house depth, and five-year total cost including hardware. Competitor cells reflect typical US positioning — confirm current plans with each vendor.',
    comparisonTag: 'Feature matrix',
    comparison: {
      title: 'Restaurant POS at a glance',
      competitorALabel: 'Toast',
      competitorBLabel: 'Square',
      rows: [
        { feature: 'Counter & table POS', kitchenos: '✅ Web-based', competitorA: '✅ Terminals', competitorB: '✅ Terminals' },
        { feature: 'Kitchen display (KDS)', kitchenos: '✅ Real-time bump', competitorA: '✅', competitorB: '✅ Add-ons vary' },
        { feature: 'QR table ordering', kitchenos: '✅ Same ticket stream', competitorA: '✅', competitorB: 'Limited / add-on' },
        { feature: 'Production & prep board', kitchenos: '✅ Built-in', competitorA: '❌', competitorB: '❌' },
        { feature: 'Costing (actual vs theoretical)', kitchenos: '✅ Beta', competitorA: '❌', competitorB: '❌' },
        { feature: 'Proprietary hardware required', kitchenos: '✅ No', competitorA: '❌ Often bundled', competitorB: '❌ Often bundled' },
        { feature: 'Multi-brand / ghost kitchen', kitchenos: '✅', competitorA: 'Limited', competitorB: 'Limited' },
        { feature: '14-day software trial', kitchenos: '✅ No credit card', competitorA: 'Varies by rep', competitorB: '✅' },
        { feature: 'Published software (from)', kitchenos: '$29/mo', competitorA: '$0 + hardware/processing', competitorB: '$0 + hardware/processing' },
      ],
    },
    disclaimer:
      'Toast® and Square® are trademarks of their respective owners. OS Kitchen is not affiliated with or endorsed by them. Matrix is directional for sales conversations — not a warranty of third-party features.',
    whenToChoose: [
      {
        title: 'Choose Toast when',
        body: 'You want established US restaurant hardware, deep partner marketplace, and are comfortable with terminal bundles and processing relationships.',
      },
      {
        title: 'Choose Square when',
        body: 'You run a simple counter-first operation, want familiar out-of-the-box hardware, and kitchen complexity is low.',
      },
      {
        title: 'Choose OS Kitchen when',
        body: 'You need web POS + KDS + production on devices you own, run meal prep or ghost brands, or want to avoid a multi-year terminal lease.',
      },
    ],
    faqs: [
      {
        q: 'Can OS Kitchen replace Toast on day one?',
        a: 'Many pilots start with kitchen + preorder while evaluating full floor POS. Migration depends on your payments setup and training bandwidth — we scope that in onboarding.',
      },
      {
        q: 'Do you support offline POS?',
        a: 'No. OS Kitchen is built for connected operations. If offline is mandatory, Toast or Square may be a better fit today.',
      },
      {
        q: 'How should we compare total cost?',
        a: 'Model five-year TCO: software, terminals, swaps, chargebacks, and add-ons. OS Kitchen shifts spend from hardware lease to software subscription on existing tablets.',
      },
    ],
    blogSlug: 'restaurant-pos-comparison-2026',
    primaryCta: { label: 'Start free trial', href: '/signup?utm_source=compare&utm_medium=organic&utm_campaign=restaurant-pos' },
  },
  {
    slug: 'meal-prep-software',
    path: '/compare/meal-prep-software',
    metaTitle: 'Meal Prep Software Comparison — OS Kitchen vs Spreadsheet Workflow',
    metaDescription:
      'Compare meal prep software for weekly menus, production, and packing vs spreadsheets and generic storefront tools.',
    eyebrow: 'Meal prep software comparison',
    headline: 'Spreadsheets vs storefront-only tools vs OS Kitchen',
    subheadline:
      'Weekly meal prep breaks when preorders, production quantities, and packing labels live in different places. Here is how operators typically stack options before a pilot.',
    methodology:
      'Compared on weekly menu cutoffs, production quantities from confirmed orders, packing by pickup window, and POS/counter when you also sell walk-ups. “Generic storefront” means cart/checkout without kitchen ops depth.',
    comparisonTag: 'Operator workflow matrix',
    comparison: {
      title: 'Meal prep operations compared',
      competitorALabel: 'Spreadsheet + manual',
      competitorBLabel: 'Storefront-only tool',
      rows: [
        { feature: 'Weekly menu + cutoffs', kitchenos: '✅', competitorA: 'Manual', competitorB: '✅' },
        { feature: 'Production from confirmed orders', kitchenos: '✅ Auto quantities', competitorA: 'Manual rebuild', competitorB: '❌ Export / manual' },
        { feature: 'Packing by pickup window', kitchenos: '✅', competitorA: 'Manual labels', competitorB: 'Limited' },
        { feature: 'Counter POS same system', kitchenos: '✅', competitorA: 'Separate app', competitorB: 'Often separate' },
        { feature: 'Kitchen display', kitchenos: '✅', competitorA: '❌', competitorB: '❌' },
        { feature: 'Costing / yield tracking', kitchenos: '✅ Beta', competitorA: '❌', competitorB: '❌' },
        { feature: '14-day trial', kitchenos: '✅', competitorA: 'N/A', competitorB: 'Varies' },
        { feature: 'Starting software (from)', kitchenos: '$29/mo', competitorA: '$0 + labor', competitorB: 'Varies' },
      ],
    },
    disclaimer:
      '“Storefront-only tool” describes category behavior, not a single vendor. OS Kitchen includes native storefront when Stripe is configured — see capability sign-off for beta labels.',
    whenToChoose: [
      {
        title: 'Stay on spreadsheets when',
        body: 'You ship under ~40 meals/week, one pickup window, and errors are cheap to fix. Upgrade when mispacks cost you customers.',
      },
      {
        title: 'Use storefront-only when',
        body: 'You only need cart/checkout and will run kitchen ops elsewhere — accept manual production rebuilds each week.',
      },
      {
        title: 'Choose OS Kitchen when',
        body: 'Preorder volume justifies one flow from menu → production → packing, with optional counter POS in the same workspace.',
      },
    ],
    faqs: [
      {
        q: 'We already use Shopify for orders — do we replace it?',
        a: 'Many pilots use OS Kitchen as the kitchen system of record while keeping Shopify for marketing. WooCommerce/Shopify import is beta — disclose timelines in sales.',
      },
      {
        q: 'Is production planning included?',
        a: 'Yes — quantities derive from confirmed preorders. You still set recipes and yields; the board is your Sunday-morning source of truth.',
      },
      {
        q: 'What about delivery apps?',
        a: 'Native Uber Eats/DoorDash sync is not sold as live today. Consolidate via integrations or manual orders per capability matrix.',
      },
    ],
    blogSlug: 'how-to-start-meal-prep-business',
    primaryCta: { label: 'Start free trial', href: '/signup?utm_source=compare&utm_medium=organic&utm_campaign=meal-prep' },
  },
  {
    slug: 'toast',
    path: '/compare/toast',
    metaTitle: 'OS Kitchen vs Toast — Restaurant POS Comparison 2026',
    metaDescription:
      'Compare OS Kitchen and Toast POS: hardware lock-in, kitchen display, table management, and total cost for US restaurants.',
    eyebrow: 'OS Kitchen vs Toast',
    headline: 'Toast vs OS Kitchen — when hardware POS is not the whole story',
    subheadline:
      'Toast wins on certified hardware and field support. OS Kitchen wins when you need owned commerce, production truth, and multi-channel ops without device lock-in.',
    methodology:
      'Feature matrix based on public positioning and OS Kitchen capability matrix. Verify Toast pricing and hardware bundles before purchase.',
    comparisonTag: 'Feature matrix',
    comparison: {
      title: 'Toast vs OS Kitchen',
      competitorALabel: 'Toast',
      competitorBLabel: 'Add-on stack',
      rows: [
        { feature: 'Payment hardware ecosystem', kitchenos: '✅ Stripe Connect (BYO devices)', competitorA: '✅ Native terminals', competitorB: '❌ Fragmented' },
        { feature: 'Table / QR ordering', kitchenos: '✅ Tables + QR generator', competitorA: '✅ Mature floor plans', competitorB: 'Limited' },
        { feature: 'Kitchen display (KDS)', kitchenos: '✅ Native + production board', competitorA: '✅ Native KDS', competitorB: 'Add-on' },
        { feature: 'Online storefront', kitchenos: '✅ Theme + page builder', competitorA: 'Add-ons', competitorB: 'Separate SaaS' },
        { feature: 'Production / commissary', kitchenos: '✅ Board, packing, routes', competitorA: '❌', competitorB: '❌' },
        { feature: 'Multi-brand / ghost kitchen', kitchenos: '✅ Command center', competitorA: 'Limited', competitorB: '❌' },
      ],
    },
    disclaimer: 'Toast is a strong fit for full-service restaurants that want bundled hardware and payments. OS Kitchen fits hybrid operators who prioritize flexible commerce + kitchen execution.',
    whenToChoose: [
      { title: 'Choose Toast when', body: 'You need certified hardware, local field support, and a payments-first rollout with minimal engineering.' },
      { title: 'Choose OS Kitchen when', body: 'You run meal prep, ghost kitchen, or hybrid models and need production + storefront + POS on one tenant graph.' },
    ],
    faqs: [
      { q: 'Can OS Kitchen replace Toast terminals?', a: 'OS Kitchen uses Stripe Connect — you bring compatible devices or counter checkout. No proprietary terminal lock-in.' },
      { q: 'Does OS Kitchen support tips?', a: 'POS supports tip lines on checkout; structured tipping flows are on the roadmap.' },
    ],
    primaryCta: { label: 'Compare in a demo', href: '/book-demo?utm_source=compare&utm_medium=organic&utm_campaign=toast' },
  },
  {
    slug: 'square',
    path: '/compare/square',
    metaTitle: 'OS Kitchen vs Square for Restaurants — 2026 Comparison',
    metaDescription:
      'Square vs OS Kitchen for restaurants and cafés: POS, online ordering, kitchen ops, and when to pick an operations OS over payments-first SMB software.',
    eyebrow: 'OS Kitchen vs Square',
    headline: 'Square vs OS Kitchen — payments ubiquity vs kitchen execution',
    subheadline:
      'Square optimizes for fast SMB signup and Cash App ecosystem effects. OS Kitchen optimizes for food-specific fulfillment after the sale.',
    methodology: 'Directional comparison from public vendor positioning. Confirm Square plan limits and app marketplace fees.',
    comparisonTag: 'Feature matrix',
    comparison: {
      title: 'Square vs OS Kitchen',
      competitorALabel: 'Square',
      competitorBLabel: 'Spreadsheet ops',
      rows: [
        { feature: 'SMB signup friction', kitchenos: '✅ 14-day trial', competitorA: '✅ Very low friction', competitorB: '❌ Manual' },
        { feature: 'App marketplace', kitchenos: '✅ 285 API routes', competitorA: '✅ Large ecosystem', competitorB: '❌' },
        { feature: 'Production planning', kitchenos: '✅ Native board', competitorA: '❌ Via apps', competitorB: '❌' },
        { feature: 'Meal prep / routes', kitchenos: '✅ Routes + subscriptions', competitorA: 'Limited', competitorB: '❌' },
        { feature: 'Inventory costing', kitchenos: '✅ AVT + theft', competitorA: 'Basic', competitorB: '❌' },
      ],
    },
    disclaimer: 'Square remains excellent for single-location cafés that primarily need payments. OS Kitchen targets operators with recurring production load.',
    whenToChoose: [
      { title: 'Choose Square when', body: 'You need the simplest counter POS and will add apps as you grow.' },
      { title: 'Choose OS Kitchen when', body: 'Orders drive production, packing, or delivery — you need one system of record.' },
    ],
    faqs: [
      { q: 'Does OS Kitchen integrate with Square?', a: 'Channel integrations are roadmap; today use native POS or Woo/Shopify storefront paths.' },
    ],
    primaryCta: { label: 'Start free trial', href: '/signup?utm_source=compare&utm_medium=organic&utm_campaign=square' },
  },
  {
    slug: 'marketman',
    path: '/compare/marketman',
    metaTitle: 'OS Kitchen vs MarketMan — Inventory & Costing Comparison',
    metaDescription:
      'MarketMan vs OS Kitchen for restaurant inventory, invoice OCR, and actual-vs-theoretical costing tied to live orders.',
    eyebrow: 'OS Kitchen vs MarketMan',
    headline: 'MarketMan vs OS Kitchen — back-office depth vs operational moment',
    subheadline:
      'MarketMan leads on invoice OCR and vendor item masters. OS Kitchen ties shortage signals to real orders on the production line.',
    methodology: 'Compares inventory/costing modules honestly; verify MarketMan OCR tiers separately.',
    comparisonTag: 'Feature matrix',
    comparison: {
      title: 'MarketMan vs OS Kitchen',
      competitorALabel: 'MarketMan',
      competitorBLabel: 'POS-only',
      rows: [
        { feature: 'Invoice OCR', kitchenos: 'Basic AP capture', competitorA: '✅ Mature OCR', competitorB: '❌' },
        { feature: 'Actual vs theoretical', kitchenos: '✅ AVT module', competitorA: '✅ Core strength', competitorB: '❌' },
        { feature: 'Order-driven demand', kitchenos: '✅ Order → production', competitorA: 'Periodic counts', competitorB: '❌' },
        { feature: 'POS + storefront', kitchenos: '✅ Included', competitorA: '❌ Not primary', competitorB: 'Partial' },
        { feature: 'Supplier charts', kitchenos: '✅ Purchasing module', competitorA: '✅ Strong', competitorB: '❌' },
      ],
    },
    disclaimer: 'MarketMan is stronger as a dedicated inventory back-office. OS Kitchen is stronger when inventory must reflect today\'s ticket volume.',
    whenToChoose: [
      { title: 'Choose MarketMan when', body: 'Accounting-grade inventory and invoice scanning are your primary pain.' },
      { title: 'Choose OS Kitchen when', body: 'You need costing plus POS, production, and storefront in one workspace.' },
    ],
    faqs: [
      { q: 'Can I use both?', a: 'Many operators use inventory specialists alongside an ops OS — evaluate integration maturity before committing.' },
    ],
    primaryCta: { label: 'See costing module', href: '/solutions/restaurants?utm_source=compare&utm_medium=organic&utm_campaign=marketman' },
  },
  {
    slug: 'deliverect',
    path: '/compare/deliverect',
    metaTitle: 'OS Kitchen vs Deliverect — Aggregator Middleware Comparison 2026',
    metaDescription:
      'Compare Deliverect aggregator middleware with OS Kitchen all-in-one ops: POS, KDS, production, storefront, and channel honesty for ghost kitchens.',
    eyebrow: 'OS Kitchen vs Deliverect',
    headline: 'Deliverect routes orders — OS Kitchen runs the kitchen',
    subheadline:
      'Deliverect excels at pushing menus to Uber Eats and DoorDash. OS Kitchen is the operations OS underneath: production, packing, POS, and owned storefront when you need more than middleware.',
    methodology: 'Category comparison — verify Deliverect plan and connector list before purchase.',
    comparisonTag: 'Ops depth vs middleware',
    comparison: {
      title: 'Deliverect vs OS Kitchen',
      competitorALabel: 'Deliverect',
      competitorBLabel: 'POS + spreadsheets',
      rows: [
        { feature: 'Aggregator menu sync', kitchenos: '⚠️ Scaffold (honest labels)', competitorA: '✅ Core product', competitorB: '❌ Manual' },
        { feature: 'In-house POS + tables', kitchenos: '✅ Native', competitorA: '❌ Partner POS', competitorB: 'Fragmented' },
        { feature: 'Production & packing', kitchenos: '✅ Board + verification', competitorA: '❌', competitorB: '❌' },
        { feature: 'Owned storefront', kitchenos: '✅ Theme builder', competitorA: '❌', competitorB: 'Separate SaaS' },
        { feature: 'Meal prep / batch logic', kitchenos: '✅ Cutoffs + yields', competitorA: '❌', competitorB: '❌' },
      ],
    },
    disclaimer: 'Many operators use Deliverect (or similar) **with** an ops platform. OS Kitchen can consolidate ops; native aggregator sync is roadmap — disclose in sales.',
    whenToChoose: [
      { title: 'Choose Deliverect when', body: 'You only need aggregator menu injection and already have a mature POS + kitchen stack.' },
      { title: 'Choose OS Kitchen when', body: 'You need one tenant graph for POS, KDS, production, packing, and preorder — especially meal prep and ghost kitchen.' },
    ],
    faqs: [
      { q: 'Will OS Kitchen replace Deliverect?', a: 'Not today for deep aggregator sync. Evaluate OS Kitchen as your kitchen OS; add middleware if channel volume requires it.' },
    ],
    primaryCta: { label: 'Book ghost kitchen demo', href: '/solutions/ghost-kitchens?utm_source=compare&utm_medium=organic&utm_campaign=deliverect' },
  },
  {
    slug: 'restaurant365',
    path: '/compare/restaurant365',
    metaTitle: 'OS Kitchen vs Restaurant365 — Restaurant Operations Comparison',
    metaDescription:
      'Restaurant365 vs OS Kitchen: accounting-heavy enterprise stack vs web-first POS, kitchen, and production for growing operators.',
    eyebrow: 'OS Kitchen vs Restaurant365',
    headline: 'Restaurant365 for finance — OS Kitchen for the line',
    subheadline:
      'R365 wins enterprise accounting and workforce at scale. OS Kitchen wins when you need fast rollout of POS, KDS, and production without a six-figure implementation.',
    methodology: 'Directional comparison — confirm R365 modules and services bundle with vendor.',
    comparisonTag: 'Enterprise accounting vs ops OS',
    comparison: {
      title: 'Restaurant365 vs OS Kitchen',
      competitorALabel: 'Restaurant365',
      competitorBLabel: 'QuickBooks + POS',
      rows: [
        { feature: 'Accounting / AP depth', kitchenos: '✅ P&L, AP (growing)', competitorA: '✅ Enterprise-grade', competitorB: 'Manual' },
        { feature: 'Time to first order', kitchenos: '✅ Days (trial)', competitorA: '⚠️ Months (impl)', competitorB: 'Weeks' },
        { feature: 'POS + KDS', kitchenos: '✅ Included', competitorA: 'Add-on / partner', competitorB: 'Separate' },
        { feature: 'Storefront / preorder', kitchenos: '✅ Native', competitorA: 'Limited', competitorB: 'Shopify' },
        { feature: 'Starting price', kitchenos: '✅ From $29/mo', competitorA: '⚠️ $300+/mo typical', competitorB: 'Varies' },
      ],
    },
    disclaimer: 'R365 is a strong fit for multi-unit groups with dedicated accounting teams. OS Kitchen fits 1–3 location operators optimizing kitchen execution first.',
    whenToChoose: [
      { title: 'Choose R365 when', body: 'You need deep GL, enterprise AP, and SOC2 vendor maturity at 20+ locations.' },
      { title: 'Choose OS Kitchen when', body: 'You need unified kitchen ops and commerce now, with honest upgrade path as you scale.' },
    ],
    faqs: [{ q: 'SOC2?', a: 'OS Kitchen SOC2 Type I targeted Q4 — see trust page. R365 carries enterprise compliance today.' }],
    primaryCta: { label: 'See pricing', href: '/pricing?utm_source=compare&utm_medium=organic&utm_campaign=r365' },
  },
  {
    slug: 'touchbistro',
    path: '/compare/touchbistro',
    metaTitle: 'OS Kitchen vs TouchBistro — iPad POS Comparison 2026',
    metaDescription:
      'TouchBistro vs OS Kitchen for restaurants and cafés: iPad POS vs web-first ops with production board and meal prep workflows.',
    eyebrow: 'OS Kitchen vs TouchBistro',
    headline: 'TouchBistro for the floor — OS Kitchen for floor + line',
    subheadline:
      'TouchBistro is a familiar iPad POS for dining rooms. OS Kitchen adds production truth, packing, meal prep cutoffs, and multi-brand when the kitchen is the bottleneck.',
    methodology: 'Feature matrix from public positioning — verify TouchBistro plan limits.',
    comparisonTag: 'POS vs ops platform',
    comparison: {
      title: 'TouchBistro vs OS Kitchen',
      competitorALabel: 'TouchBistro',
      competitorBLabel: 'Floor-only stack',
      rows: [
        { feature: 'iPad dining room POS', kitchenos: '✅ Browser POS', competitorA: '✅ Native iPad', competitorB: '❌' },
        { feature: 'Kitchen display', kitchenos: '✅ Realtime KDS', competitorA: '✅ KDS add-on', competitorB: 'Paper' },
        { feature: 'Production / batch', kitchenos: '✅ Board + yields', competitorA: '❌', competitorB: '❌' },
        { feature: 'Meal prep preorders', kitchenos: '✅ Native', competitorA: 'Limited', competitorB: '❌' },
        { feature: 'Hardware', kitchenos: '✅ BYOD', competitorA: '⚠️ iPad-focused', competitorB: 'Varies' },
      ],
    },
    disclaimer: 'TouchBistro remains a solid dining-room POS. OS Kitchen is the better fit when production, packing, or ghost kitchen complexity dominates.',
    whenToChoose: [
      { title: 'Choose TouchBistro when', body: 'You need a proven iPad floor POS and kitchen complexity is low.' },
      { title: 'Choose OS Kitchen when', body: 'Preorder volume, production boards, or multi-brand routing drive your week.' },
    ],
    faqs: [],
    primaryCta: { label: 'Start free trial', href: '/signup?utm_source=compare&utm_medium=organic&utm_campaign=touchbistro' },
  },
  {
    slug: 'olo',
    path: '/compare/olo',
    metaTitle: 'OS Kitchen vs Olo — Digital Ordering Comparison',
    metaDescription:
      'Olo vs OS Kitchen: enterprise digital ordering rails vs operator-owned storefront, POS, and kitchen execution for regional brands.',
    eyebrow: 'OS Kitchen vs Olo',
    headline: 'Olo powers enterprise ordering — OS Kitchen powers your kitchen',
    subheadline:
      'Olo serves large chains with ordering rails and marketplace partnerships. OS Kitchen serves independent and regional operators who need owned commerce plus kitchen ops in one workspace.',
    methodology: 'Category comparison — Olo typically requires enterprise sales cycle.',
    comparisonTag: 'Enterprise rails vs SMB ops',
    comparison: {
      title: 'Olo vs OS Kitchen',
      competitorALabel: 'Olo',
      competitorBLabel: 'Custom dev',
      rows: [
        { feature: 'Enterprise chain ordering', kitchenos: '❌ Not target ICP', competitorA: '✅ Core', competitorB: '❌' },
        { feature: 'Owned branded storefront', kitchenos: '✅ Included', competitorA: '✅', competitorB: 'Build' },
        { feature: 'In-store POS + KDS', kitchenos: '✅', competitorA: 'Partner ecosystem', competitorB: '❌' },
        { feature: 'Self-serve signup', kitchenos: '✅ 14-day trial', competitorA: '❌ Enterprise sales', competitorB: '❌' },
        { feature: 'Meal prep / commissary', kitchenos: '✅', competitorA: 'Limited', competitorB: 'Custom' },
      ],
    },
    disclaimer: 'Olo is not a direct substitute for 1–3 location operators evaluating OS Kitchen. Compare only if you are weighing enterprise ordering against an ops-first stack.',
    whenToChoose: [
      { title: 'Choose Olo when', body: 'You are a national brand needing standardized ordering rails and franchise governance.' },
      { title: 'Choose OS Kitchen when', body: 'You are an independent or regional operator optimizing kitchen execution and owned preorder.' },
    ],
    faqs: [],
    primaryCta: { label: 'Compare capabilities', href: '/capabilities?utm_source=compare&utm_medium=organic&utm_campaign=olo' },
  },
  {
    slug: 'kitchenos-vs-lightspeed',
    path: '/compare/kitchenos-vs-lightspeed',
    metaTitle: 'OS Kitchen vs Lightspeed — Restaurant POS Comparison 2026',
    metaDescription:
      'Lightspeed vs OS Kitchen: dining-room POS vs full kitchen ops — production boards, meal prep, storefront, and multi-brand ghost kitchens.',
    eyebrow: 'OS Kitchen vs Lightspeed',
    headline: 'Lightspeed for the floor — OS Kitchen for the whole kitchen',
    subheadline:
      'Lightspeed excels at hospitality POS and payments. OS Kitchen unifies POS, KDS, production, storefront, and delivery channels for operators who live in the back of house.',
    methodology: 'Feature matrix from public docs; verify pricing with vendors.',
    comparisonTag: 'Hospitality POS vs ops platform',
    comparison: {
      title: 'Lightspeed vs OS Kitchen',
      competitorALabel: 'Lightspeed',
      competitorBLabel: 'POS-only stack',
      rows: [
        { feature: 'Table / floor POS', kitchenos: '✅ Browser POS', competitorA: '✅ Strong', competitorB: 'Varies' },
        { feature: 'Production / batch planning', kitchenos: '✅ Native', competitorA: '❌', competitorB: 'Spreadsheets' },
        { feature: 'Meal prep preorders', kitchenos: '✅', competitorA: 'Add-ons', competitorB: '❌' },
        { feature: 'Ghost kitchen multi-brand', kitchenos: '✅', competitorA: 'Limited', competitorB: '❌' },
        { feature: 'Recipe costing depth', kitchenos: '✅ Costing module', competitorA: 'Basic', competitorB: 'Manual' },
      ],
    },
    disclaimer: 'Lightspeed is a strong choice for traditional dining rooms. OS Kitchen fits when production complexity and owned preorder drive margin.',
    whenToChoose: [
      { title: 'Choose Lightspeed when', body: 'Front-of-house speed and payments are the primary bottleneck.' },
      { title: 'Choose OS Kitchen when', body: 'Weekly menus, commissary production, or multi-channel fulfillment dominate your week.' },
    ],
    faqs: [
      { q: 'Can OS Kitchen replace Lightspeed POS?', a: 'For many meal prep and ghost kitchen operators, yes. Full-service dining rooms may keep a floor POS and use OS Kitchen for production and digital channels.' },
      { q: 'Does OS Kitchen support hardware?', a: 'Yes — BYOD tablets and printers; no proprietary terminal lock-in.' },
      { q: 'How does pricing compare?', a: 'OS Kitchen Starter from $29/mo with trial; compare total cost including add-ons you need on either stack.' },
    ],
    primaryCta: { label: 'Start free trial', href: '/signup?utm_source=compare&utm_medium=organic&utm_campaign=lightspeed' },
  },
  {
    slug: 'kitchenos-vs-7shifts',
    path: '/compare/kitchenos-vs-7shifts',
    metaTitle: 'OS Kitchen vs 7shifts — Workforce + Kitchen Ops',
    metaDescription:
      '7shifts vs OS Kitchen: scheduling and labor vs unified kitchen operations, POS, and production for food operators.',
    eyebrow: 'OS Kitchen vs 7shifts',
    headline: '7shifts schedules your team — OS Kitchen runs the kitchen',
    subheadline:
      '7shifts is built for shift scheduling and labor compliance. OS Kitchen includes staff tools plus orders, KDS, production, and storefront in one workspace.',
    methodology: 'Workforce vs full ops comparison; not a substitute for legal labor advice.',
    comparisonTag: 'Workforce vs kitchen OS',
    comparison: {
      title: '7shifts vs OS Kitchen',
      competitorALabel: '7shifts',
      competitorBLabel: 'Scheduling + spreadsheets',
      rows: [
        { feature: 'Shift scheduling', kitchenos: '✅ Staff module', competitorA: '✅ Core', competitorB: 'Manual' },
        { feature: 'Labor cost vs sales', kitchenos: '✅ Reports', competitorA: '✅', competitorB: '❌' },
        { feature: 'KDS + order flow', kitchenos: '✅ Native', competitorA: '❌', competitorB: 'Separate tools' },
        { feature: 'Production planning', kitchenos: '✅', competitorA: '❌', competitorB: '❌' },
        { feature: 'Storefront / preorders', kitchenos: '✅', competitorA: '❌', competitorB: '❌' },
      ],
    },
    disclaimer: 'Many operators use 7shifts alongside OS Kitchen for deep scheduling while running kitchen execution in OS Kitchen.',
    whenToChoose: [
      { title: 'Choose 7shifts when', body: 'Scheduling, availability, and labor law templates are your only gap.' },
      { title: 'Choose OS Kitchen when', body: 'You need scheduling plus kitchen throughput, menus, and channel orders in one system.' },
    ],
    faqs: [
      { q: 'Does OS Kitchen replace 7shifts?', a: 'For smaller teams, OS Kitchen staff tools may be enough. Larger teams often keep 7shifts for scheduling depth.' },
      { q: 'Is there an integration?', a: 'Export labor actuals from OS Kitchen reports; direct 7shifts sync is on the roadmap for enterprise pilots.' },
      { q: 'Who is the ideal OS Kitchen user?', a: 'Meal prep, ghost kitchen, and production-heavy restaurants with 5–50 staff.' },
    ],
    primaryCta: { label: 'Start free trial', href: '/signup?utm_source=compare&utm_medium=organic&utm_campaign=7shifts' },
  },
  {
    slug: 'kitchenos-vs-meez',
    path: '/compare/kitchenos-vs-meez',
    metaTitle: 'OS Kitchen vs meez — Recipe Costing & Kitchen Ops',
    metaDescription:
      'meez vs OS Kitchen: recipe development and costing vs end-to-end kitchen operations, POS, and fulfillment.',
    eyebrow: 'OS Kitchen vs meez',
    headline: 'meez nails recipes — OS Kitchen runs the business',
    subheadline:
      'meez helps chefs standardize recipes and food cost. OS Kitchen connects costing to live menus, production batches, orders, and margin reports.',
    methodology: 'Recipe tooling vs ops platform; verify meez plan features before purchase.',
    comparisonTag: 'Recipe intelligence vs ops',
    comparison: {
      title: 'meez vs OS Kitchen',
      competitorALabel: 'meez',
      competitorBLabel: 'Spreadsheets',
      rows: [
        { feature: 'Recipe & yield management', kitchenos: '✅ Recipes + costing', competitorA: '✅ Best-in-class', competitorB: 'Manual' },
        { feature: 'Live menu ↔ cost sync', kitchenos: '✅', competitorA: 'Partial', competitorB: '❌' },
        { feature: 'POS + KDS', kitchenos: '✅', competitorA: '❌', competitorB: '❌' },
        { feature: 'Production batches', kitchenos: '✅', competitorA: '❌', competitorB: '❌' },
        { feature: 'Storefront preorders', kitchenos: '✅', competitorA: '❌', competitorB: '❌' },
      ],
    },
    disclaimer: 'meez remains excellent for culinary R&D teams. OS Kitchen is the better fit when recipes must drive daily production and sales.',
    whenToChoose: [
      { title: 'Choose meez when', body: 'Your priority is recipe development, training, and theoretical food cost without daily ops.' },
      { title: 'Choose OS Kitchen when', body: 'Recipe cost must flow into weekly menus, packing, and P&L in real time.' },
    ],
    faqs: [
      { q: 'Can I import recipes from meez?', a: 'Use CSV import in OS Kitchen costing; dedicated meez connector is planned for pilots.' },
      { q: 'Does OS Kitchen do yield scaling?', a: 'Yes — production batches scale from recipe yields and par levels.' },
      { q: 'Which has better OCR for invoices?', a: 'OS Kitchen includes invoice OCR with human review under 85% confidence.' },
    ],
    primaryCta: { label: 'Start free trial', href: '/signup?utm_source=compare&utm_medium=organic&utm_campaign=meez' },
  },
];

export const COMPARE_SLUGS = COMPARE_PAGES.map((p) => p.slug);

export function comparePageBySlug(slug: string): ComparePageContent | undefined {
  return COMPARE_PAGES.find((p) => p.slug === slug);
}

export const COMPARE_HUB_COPY = {
  metaTitle: 'Compare OS Kitchen — Restaurant POS & Meal Prep Software',
  metaDescription:
    'Honest comparisons for restaurant POS and meal prep software. Feature matrices, TCO guidance, and when to choose each approach.',
  headline: 'Compare before you commit to a multi-year stack',
  subheadline:
    'Vendor sites optimize for demos. These pages optimize for fit — capability-level matrices, total-cost framing, and clear “choose X when” guidance.',
} as const;
