import type { SolutionPageSlug } from '@/lib/demo-verticals';

export type SolutionFeature = {
  title: string;
  description: string;
};

export type SolutionComparisonRow = {
  feature: string;
  kitchenos: string;
  competitorA: string;
  competitorB: string;
};

export type RichSolutionLanding = {
  badge: string;
  h1: string;
  subtitle: string;
  features: SolutionFeature[];
  comparison?: {
    title: string;
    competitorALabel: string;
    competitorBLabel: string;
    rows: SolutionComparisonRow[];
  };
  ctaTitle: string;
  ctaSubtitle: string;
};

export const RICH_SOLUTION_SLUGS = [
  'restaurants',
  'bars',
  'cafes',
  'fast-casual',
  'ghost-kitchens',
  'meal-prep',
  'catering',
  'bakeries',
] as const satisfies readonly SolutionPageSlug[];

export type RichSolutionSlug = (typeof RICH_SOLUTION_SLUGS)[number];

export function isRichSolutionSlug(slug: SolutionPageSlug): slug is RichSolutionSlug {
  return (RICH_SOLUTION_SLUGS as readonly string[]).includes(slug);
}

export const RICH_SOLUTION_LANDING: Record<RichSolutionSlug, RichSolutionLanding> = {
  'meal-prep': {
    badge: 'For meal prep & subscription kitchens',
    h1: 'Meal Prep Software — From Weekly Menu to Packed Delivery',
    subtitle:
      'Publish menus with preorder cutoffs, translate orders into production quantities, and generate packing labels — without reconciling spreadsheets every Sunday night.',
    features: [
      {
        title: 'Weekly menu publishing',
        description:
          'Lock preorder deadlines and prepared dates so your kitchen knows exactly what to cook each production day.',
      },
      {
        title: 'Production board',
        description:
          'Batch prep by SKU with yield factors. See what to make today based on confirmed orders — not guesses.',
      },
      {
        title: 'Packing & labels',
        description:
          'Lane-based packing sheets grouped by customer, route, or fulfillment type. Reduce mispacks during handoff.',
      },
      {
        title: 'Storefront preorders',
        description:
          'Hosted checkout with Stripe when configured. Customers order online; your team runs one production queue.',
      },
      {
        title: 'Ingredient demand',
        description:
          'Roll up recipe needs from confirmed orders when recipes exist — a foundation for purchasing, not a full ERP replacement.',
      },
      {
        title: 'Pickup & delivery windows',
        description:
          'Capacity-aware pickup slots and route handoff when delivery modules are enabled for your workspace.',
      },
    ],
    comparison: {
      title: 'How KitchenOS compares for meal prep',
      competitorALabel: 'Spreadsheets',
      competitorBLabel: 'Generic POS',
      rows: [
        { feature: 'Weekly preorder cutoffs', kitchenos: '✅', competitorA: 'Manual', competitorB: '❌' },
        { feature: 'Production quantities', kitchenos: '✅', competitorA: 'Manual', competitorB: 'Limited' },
        { feature: 'Packing labels', kitchenos: '✅', competitorA: '❌', competitorB: 'Limited' },
        { feature: 'Online storefront', kitchenos: '✅ With Stripe', competitorA: '❌', competitorB: 'Add-on' },
        { feature: 'Counter POS', kitchenos: '✅', competitorA: '❌', competitorB: '✅' },
        { feature: '14-day trial', kitchenos: '✅', competitorA: 'N/A', competitorB: 'Varies' },
      ],
    },
    ctaTitle: 'Run your meal prep week on one system',
    ctaSubtitle:
      'Start a 14-day trial. Import your menu, set cutoffs, and see production and packing from real preorder volume.',
  },
  catering: {
    badge: 'For catering & event kitchens',
    h1: 'Catering Management Software — Quote to Production to Delivery',
    subtitle:
      'Turn accepted quotes into production plans, packing sheets, and dispatch — so event day runs from one order hub instead of inbox threads and PDFs.',
    features: [
      {
        title: 'Order hub for events',
        description:
          'Corporate lunches, buffets, and drop-offs in one prioritized queue with channel labels you can trust.',
      },
      {
        title: 'Production planning',
        description:
          'Translate headcount and menu selections into batch-friendly prep lists aligned to event timing.',
      },
      {
        title: 'Packing by drop',
        description:
          'Group items by client, floor, or delivery window. Reduce last-minute repacks before drivers leave.',
      },
      {
        title: 'Routes & handoff',
        description:
          'Manifests and geography-aware modules when delivery is in scope — configured honestly per workspace.',
      },
      {
        title: 'CRM touchpoints',
        description:
          'Customer profiles and order history for repeat corporate accounts — not a full sales CRM replacement.',
      },
      {
        title: 'Counter & on-site POS',
        description:
          'Browser POS for day-of add-ons or walk-up sales that still feed the same kitchen queue.',
      },
    ],
    comparison: {
      title: 'Catering software comparison',
      competitorALabel: 'Spreadsheets + email',
      competitorBLabel: 'Legacy catering tools',
      rows: [
        { feature: 'Event-to-production flow', kitchenos: '✅', competitorA: 'Manual', competitorB: 'Varies' },
        { feature: 'Packing sheets', kitchenos: '✅', competitorA: '❌', competitorB: '✅' },
        { feature: 'Delivery routes', kitchenos: '✅ When configured', competitorA: '❌', competitorB: 'Varies' },
        { feature: 'E-commerce channels', kitchenos: '✅ Beta imports', competitorA: '❌', competitorB: 'Varies' },
        { feature: 'No hardware bundle', kitchenos: '✅', competitorA: 'N/A', competitorB: 'Varies' },
        { feature: '14-day trial', kitchenos: '✅', competitorA: 'N/A', competitorB: 'Varies' },
      ],
    },
    ctaTitle: 'Coordinate your next catering season in one place',
    ctaSubtitle:
      '14-day free trial. Start with one recurring client or event type — expand channels as you configure integrations.',
  },
  bakeries: {
    badge: 'For bakeries & wholesale bake shops',
    h1: 'Bakery Order Management — Preorders, Bake Schedules & Pickup Waves',
    subtitle:
      'Align retail counter, wholesale preorders, and bake schedules so production knows what to pull from the oven — and packing knows what leaves on which wave.',
    features: [
      {
        title: 'Preorder storefront',
        description:
          'Weekly or daily drops with cutoff times and prepared dates — customers order ahead; bakers see totals early.',
      },
      {
        title: 'Production board',
        description:
          'Batch-oriented prep for doughs, fillings, and finishing. Built for high-SKU bakery operations.',
      },
      {
        title: 'Pickup windows',
        description:
          'Capacity limits per window so you do not overpromise Saturday pickup slots.',
      },
      {
        title: 'Counter POS',
        description:
          'Walk-up sales on tablet or desktop that feed the same order stream as preorders.',
      },
      {
        title: 'Packing & labels',
        description:
          'Printable flows for wholesale crates and retail bags when your workspace enables them.',
      },
      {
        title: 'Kitchen display',
        description:
          'Route warmed items and finishing tickets to a small BOH screen during service peaks.',
      },
    ],
    comparison: {
      title: 'Bakery software comparison',
      competitorALabel: 'Square',
      competitorBLabel: 'Spreadsheets',
      rows: [
        { feature: 'Preorder + counter unified', kitchenos: '✅', competitorA: 'Partial', competitorB: '❌' },
        { feature: 'Bake-day production view', kitchenos: '✅', competitorA: '❌', competitorB: 'Manual' },
        { feature: 'Pickup wave limits', kitchenos: '✅', competitorA: 'Limited', competitorB: '❌' },
        { feature: 'Wholesale + retail', kitchenos: '✅', competitorA: '✅', competitorB: 'Manual' },
        { feature: 'No proprietary terminal', kitchenos: '✅', competitorA: '❌', competitorB: 'N/A' },
        { feature: '14-day trial', kitchenos: '✅', competitorA: '✅', competitorB: 'N/A' },
      ],
    },
    ctaTitle: 'Bake and fulfill from one operations hub',
    ctaSubtitle:
      'Try KitchenOS free for 14 days. Start with preorders or counter — add production depth as your recipes are configured.',
  },
  restaurants: {
    badge: 'For full-service restaurants',
    h1: 'Restaurant POS & Kitchen Operations — All in One',
    subtitle:
      'Take orders at the table, route to the kitchen display, manage your floor plan, and let guests order via QR — without juggling three different systems.',
    features: [
      {
        title: 'Table Management',
        description:
          'Visual floor plan. Assign orders to tables. Track status: Available, Occupied, Reserved, Dirty. One-click status changes.',
      },
      {
        title: 'Kitchen Display System',
        description:
          'Real-time KDS with sound alerts. Color-coded by wait time. Bump orders when ready. No more paper tickets.',
      },
      {
        title: 'QR Table Ordering',
        description:
          'Generate QR codes per table. Guests scan, browse your menu, and order from their phone. Orders go straight to KDS.',
      },
      {
        title: 'Handheld POS',
        description:
          'Waitstaff take orders tableside on any phone or tablet. Orders sync instantly to the kitchen.',
      },
      {
        title: 'Tab Management',
        description:
          'Open tabs per table or customer name. Add drinks and dishes throughout the night. Close with tip — one click.',
      },
      {
        title: 'Daily Service Mode',
        description:
          "Designed for day-of operations. Today's queue shows all active orders. Switch from weekly preorder mode in Settings.",
      },
    ],
    comparison: {
      title: 'How KitchenOS compares',
      competitorALabel: 'Toast',
      competitorBLabel: 'Square',
      rows: [
        { feature: 'Table Management', kitchenos: '✅', competitorA: '✅', competitorB: '✅' },
        { feature: 'Kitchen Display', kitchenos: '✅ Real-time', competitorA: '✅', competitorB: '✅' },
        { feature: 'QR Ordering', kitchenos: '✅ Built-in', competitorA: '✅', competitorB: '❌' },
        { feature: 'Handheld POS', kitchenos: '✅ Web-based', competitorA: '✅ Hardware', competitorB: '✅ Hardware' },
        { feature: 'Production Board', kitchenos: '✅', competitorA: '❌', competitorB: '❌' },
        { feature: 'Costing A vs T', kitchenos: '✅', competitorA: '❌', competitorB: '❌' },
        { feature: 'No Hardware Required', kitchenos: '✅', competitorA: '❌', competitorB: '❌' },
        { feature: 'Multi-Brand', kitchenos: '✅', competitorA: '❌', competitorB: '❌' },
        { feature: 'Free Trial', kitchenos: '✅ 14 days', competitorA: '❌', competitorB: '✅' },
        { feature: 'Starting Price', kitchenos: '$29/mo', competitorA: '$0 + hardware', competitorB: '$0 + hardware' },
      ],
    },
    ctaTitle: 'Ready to run your restaurant on one system?',
    ctaSubtitle:
      'Start your 14-day free trial. No hardware needed. Works on any device. Cancel anytime.',
  },
  bars: {
    badge: 'For bars & nightlife',
    h1: 'Bar POS with Tab Management — Built for High Volume',
    subtitle:
      'Open tabs, add rounds fast with quick-order buttons, split checks, and keep the kitchen in sync when food hits the pass.',
    features: [
      {
        title: 'Tab Management',
        description: 'Open tabs by table or name. Add drinks and food all night. Close with tip in one step.',
      },
      {
        title: 'Split Bills',
        description: 'Schema-ready split tracking per guest. Assign line items before close (full split UI rolling out).',
      },
      {
        title: 'Quick-Order Buttons',
        description: 'Beer, wine, cocktails, shots — one tap adds to the active tab. Built for speed at the bar.',
      },
      {
        title: 'Daily Service Mode',
        description: "Today's active orders in one queue. Built for night-of service, not weekly preorders.",
      },
      {
        title: 'Kitchen Display',
        description: 'Food orders route to KDS with bump and color by wait time. Bar stays focused on pours.',
      },
      {
        title: 'QR Ordering',
        description: 'Optional QR menus for patio tables. Guests order from their phone; tabs stay in sync.',
      },
    ],
    comparison: {
      title: 'Bar POS comparison',
      competitorALabel: 'Toast',
      competitorBLabel: 'Square',
      rows: [
        { feature: 'Tab Management', kitchenos: '✅', competitorA: '✅', competitorB: '✅' },
        { feature: 'Quick-Order Drinks', kitchenos: '✅', competitorA: '✅', competitorB: '✅' },
        { feature: 'Web-Based (No Terminal)', kitchenos: '✅', competitorA: '❌', competitorB: '❌' },
        { feature: 'Kitchen Display', kitchenos: '✅', competitorA: '✅', competitorB: 'Limited' },
        { feature: 'Production / Costing', kitchenos: '✅', competitorA: '❌', competitorB: '❌' },
        { feature: '14-Day Trial', kitchenos: '✅', competitorA: 'Varies', competitorB: '✅' },
      ],
    },
    ctaTitle: 'Run your bar on one fast system',
    ctaSubtitle: '14-day free trial. Any tablet or phone. No proprietary hardware lock-in.',
  },
  cafes: {
    badge: 'For cafés & coffee bars',
    h1: 'Café POS & Order-Ahead — Counter to Kitchen',
    subtitle:
      'Quick-order buttons for coffee and pastries, QR ordering for pickup, and a kitchen thread that never loses a ticket.',
    features: [
      {
        title: 'Quick-Order Buttons',
        description: 'Espresso, lattes, pastries — tap to add. Perfect for morning rush and repeat items.',
      },
      {
        title: 'QR Ordering',
        description: 'Guests scan, order ahead, and pick up. Orders land in the same queue as counter POS.',
      },
      {
        title: 'Daily Service Mode',
        description: 'Built for same-day service. Switch off weekly preorder workflows when you do not need them.',
      },
      {
        title: 'Kitchen Display',
        description: 'Route food items to a small BOH screen. Bump when ready for handoff.',
      },
      {
        title: 'Handheld POS',
        description: 'Roam the floor with a phone or tablet. Same catalog as the counter.',
      },
      {
        title: 'Storefront Preorders',
        description: 'Optional online menu with pickup windows and capacity limits for bakery-style drops.',
      },
    ],
    comparison: {
      title: 'How KitchenOS compares for cafés',
      competitorALabel: 'Square',
      competitorBLabel: 'Toast',
      rows: [
        { feature: 'Quick-order POS', kitchenos: '✅', competitorA: '✅', competitorB: '✅' },
        { feature: 'QR / order-ahead', kitchenos: '✅ Built-in', competitorA: 'Add-on', competitorB: '✅' },
        { feature: 'Kitchen display', kitchenos: '✅', competitorA: 'Limited', competitorB: '✅' },
        { feature: 'No proprietary terminal', kitchenos: '✅', competitorA: '❌', competitorB: '❌' },
        { feature: 'Production board', kitchenos: '✅', competitorA: '❌', competitorB: '❌' },
        { feature: '14-day free trial', kitchenos: '✅', competitorA: '✅', competitorB: 'Varies' },
      ],
    },
    ctaTitle: 'Modernize your café operations',
    ctaSubtitle: 'Try KitchenOS free for 14 days. Works on devices you already own.',
  },
  'fast-casual': {
    badge: 'For fast-casual & QSR',
    h1: 'Fast-Casual POS & Self-Service Ready',
    subtitle:
      'High-throughput quick-order POS, kitchen display, and production board — built for lines, not only weekly menus.',
    features: [
      {
        title: 'Quick-Order Buttons',
        description: 'Configure bestsellers for one-tap adds at the register or handheld.',
      },
      {
        title: 'Kitchen Display',
        description: 'Color-coded tickets by age. Bump and sound alerts keep the line moving.',
      },
      {
        title: 'QR Ordering',
        description: 'Optional scan-to-order for dine-in or pickup lines.',
      },
      {
        title: 'Daily Service Mode',
        description: "Today's queue for all channels — counter, web, and QR in one place.",
      },
      {
        title: 'Production Board',
        description: 'Prep quantities and batch-friendly checkpoints for commissary-style production.',
      },
      {
        title: 'Self-Service Kiosk',
        description: 'Coming Q4 — web kiosk flow on any tablet (roadmap; not GA yet).',
      },
    ],
    comparison: {
      title: 'Fast-casual POS comparison',
      competitorALabel: 'Square',
      competitorBLabel: 'Toast',
      rows: [
        { feature: 'High-volume KDS', kitchenos: '✅', competitorA: '✅', competitorB: '✅' },
        { feature: 'Quick-order buttons', kitchenos: '✅', competitorA: '✅', competitorB: '✅' },
        { feature: 'Production board', kitchenos: '✅', competitorA: '❌', competitorB: '❌' },
        { feature: 'Web kiosk (roadmap)', kitchenos: 'Q4 2026', competitorA: 'Varies', competitorB: 'Varies' },
        { feature: 'No hardware bundle', kitchenos: '✅', competitorA: '❌', competitorB: '❌' },
        { feature: '14-day trial', kitchenos: '✅', competitorA: '✅', competitorB: 'Varies' },
      ],
    },
    ctaTitle: 'Speed up your fast-casual line',
    ctaSubtitle: '14-day trial. No hardware bundle required to get started.',
  },
  'ghost-kitchens': {
    badge: 'For ghost & virtual brands',
    h1: 'Ghost Kitchen & Multi-Brand Command Center',
    subtitle:
      'Operate multiple virtual brands from one kitchen with cross-brand analytics, channel imports, and honest integration maturity.',
    features: [
      {
        title: 'Multi-Brand Command Center',
        description: 'Cross-brand revenue, orders, and product counts in one dashboard.',
      },
      {
        title: 'Brand P&L Snapshot',
        description: 'See which virtual brands perform — without exporting spreadsheets.',
      },
      {
        title: 'WooCommerce / Shopify',
        description: 'Beta channel imports when configured. Orders normalize into one Order hub.',
      },
      {
        title: 'Daily Service Mode',
        description: 'Pass-through queue for delivery-heavy day-of volume.',
      },
      {
        title: 'Kitchen Display',
        description: 'One KDS for all brands. Bump by ticket, filter by source when needed.',
      },
      {
        title: 'Production Board',
        description: 'Batch prep across brands sharing ingredients and stations.',
      },
    ],
    comparison: {
      title: 'Multi-brand kitchen comparison',
      competitorALabel: 'Spreadsheets',
      competitorBLabel: 'Legacy POS',
      rows: [
        { feature: 'Multi-brand dashboard', kitchenos: '✅', competitorA: '❌', competitorB: 'Limited' },
        { feature: 'Per-brand P&L view', kitchenos: '✅', competitorA: 'Manual', competitorB: '❌' },
        { feature: 'Channel import hub', kitchenos: '✅ When configured', competitorA: '❌', competitorB: 'Varies' },
        { feature: 'Shared KDS', kitchenos: '✅', competitorA: '❌', competitorB: '✅' },
        { feature: 'Honest integration status', kitchenos: '✅', competitorA: 'N/A', competitorB: 'Varies' },
        { feature: '14-day trial', kitchenos: '✅', competitorA: 'N/A', competitorB: 'Varies' },
      ],
    },
    ctaTitle: 'Scale virtual brands without chaos',
    ctaSubtitle: 'Start free. Connect channels as you grow. No fake marketplace claims.',
  },
};
