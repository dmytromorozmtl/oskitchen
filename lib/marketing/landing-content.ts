import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  ChefHat,
  ClipboardList,
  LayoutGrid,
  MonitorSmartphone,
  Package,
  QrCode,
  ScanLine,
  Store,
  Truck,
  Users,
  UtensilsCrossed,
} from 'lucide-react';

/** Homepage copy and structured content — single source of truth for marketing sections. */

export const LANDING_HERO = {
  badge: 'POS + kitchen operations platform',
  headline: 'Front-of-house and back-of-house, finally in sync',
  subheadline:
    'Take orders at the counter or table, route tickets to the kitchen display, and close the loop with production and dispatch — without proprietary terminals or a patchwork of apps.',
  primaryCta: { label: 'Start free trial', href: '/signup' },
  secondaryCta: { label: 'See product tour', href: '/demo' },
  trustLine: '14-day trial · No credit card · Cancel anytime',
  proofPoints: [
    'Counter and table POS on tablets you already own',
    'Kitchen display with live ticket routing',
    'Production, pickup, and dispatch in one workspace',
  ],
} as const;

export const LANDING_TRUSTED_BY = {
  tag: 'Trusted by operators',
  headline: 'Built for teams that cannot afford a slow service night',
  segments: [
    'Full-service restaurants',
    'Fast-casual & cafés',
    'Bars & nightlife',
    'Meal prep & catering',
    'Ghost & multi-brand kitchens',
  ],
} as const;

export const LANDING_HERO_METRICS = [
  { label: 'Active orders', value: '128', delta: '+18% vs yesterday', icon: UtensilsCrossed },
  { label: 'On-time production', value: '94%', delta: 'Kitchen in sync', icon: ChefHat },
  { label: 'Ready for dispatch', value: '56', delta: 'AM pickup window', icon: Truck },
  { label: 'Today’s revenue', value: '$4.2k', delta: 'POS + preorder', icon: BarChart3 },
] as const;

export const LANDING_PRODUCTION_INTELLIGENCE = {
  tag: 'Operational intelligence',
  title: 'See what matters before the rush hits',
  description:
    'One live view of orders, kitchen progress, and handoff — so managers act on facts, not walkie-talkie guesses.',
  cards: [
    {
      title: 'Order queue',
      description: 'Every channel — counter POS, QR table orders, and preorder — in one prioritized queue.',
      icon: ClipboardList,
    },
    {
      title: 'Kitchen display',
      description: 'Color-coded tickets, bump when ready, and sound alerts so expo stays ahead of the curve.',
      icon: MonitorSmartphone,
    },
    {
      title: 'Production board',
      description: 'Batch prep by menu item with yields and cutoffs — built for meal prep and high-volume kitchens.',
      icon: ChefHat,
    },
    {
      title: 'Dispatch & pickup',
      description: 'Pickup windows, route manifests, and customer notifications when delivery is in scope.',
      icon: Truck,
    },
  ],
} as const;

export type LandingFeatureItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const LANDING_POS_ECOSYSTEM = {
  tag: 'POS ecosystem',
  title: 'Everything guests and staff touch — connected to the kitchen',
  description:
    'Replace the patchwork of POS, spreadsheets, and group chats with one workspace. Features activate based on your plan and setup — we label maturity honestly.',
  features: [
    {
      title: 'Table management',
      description: 'Visual floor plan, table status, and order-to-table assignment for full-service dining.',
      icon: LayoutGrid,
    },
    {
      title: 'Handheld & counter POS',
      description: 'Browser-first ordering on any device. Same order stream as QR and online channels.',
      icon: ScanLine,
    },
    {
      title: 'QR table ordering',
      description: 'Guests scan, browse the menu, and send orders straight to the kitchen display.',
      icon: QrCode,
    },
    {
      title: 'Tab & split payments',
      description: 'Open tabs by table or name, add items through service, and close with tips in one flow.',
      icon: Users,
    },
    {
      title: 'Online preorder',
      description: 'Hosted storefront with cutoff times and prepared dates when you enable Stripe checkout.',
      icon: Store,
    },
    {
      title: 'Packing & labels',
      description: 'Lane-based packing sheets and verification for meal prep, catering, and delivery handoff.',
      icon: Package,
    },
  ] satisfies LandingFeatureItem[],
} as const;

export const LANDING_HOW_IT_WORKS = {
  tag: 'How it works',
  title: 'From first order to fulfilled — in four steps',
  description:
    'OS Kitchen connects the full service loop. Integrations and payment depth follow your credentials — never implied as universally live.',
  steps: [
    {
      step: '01',
      title: 'Capture every order',
      body: 'POS, QR, storefront preorders, and imports normalize into one order hub with clear channel labels.',
    },
    {
      step: '02',
      title: 'Run the kitchen',
      body: 'Tickets hit the KDS, production board, or station view — matched to how your team actually works.',
    },
    {
      step: '03',
      title: 'Pack and dispatch',
      body: 'Packing lanes, pickup windows, and routes when delivery is configured for your workspace.',
    },
    {
      step: '04',
      title: 'Improve with data',
      body: 'CRM, analytics, and costing foundations grounded in real orders — not vanity dashboards.',
    },
  ],
} as const;

export const LANDING_MULTI_LOCATION = {
  tag: 'Multi-location & multi-brand',
  title: 'One command center for every kitchen you run',
  description:
    'Switch between locations and brands without logging into five different tools. Ghost kitchen groups get brand-level visibility where enabled.',
  stats: [
    { value: 'Unlimited', label: 'team members on Team plan' },
    { value: 'Multi-brand', label: 'command center for virtual brands' },
    { value: 'API-ready', label: 'Enterprise integrations & SLA' },
  ],
  cta: { label: 'Talk to sales', href: '/contact-sales' },
} as const;

export const LANDING_TESTIMONIALS = {
  tag: 'Operator feedback',
  title: 'Designed with people who run real kitchens',
  disclaimer:
    'Illustrative quotes reflecting themes from pilot conversations. Named customer stories coming as we publish case studies.',
  quotes: [
    {
      quote:
        'We stopped reconciling three spreadsheets every Sunday. Production and packing finally read from the same order queue.',
      name: 'Emilia Santos',
      role: 'Owner, meal prep operator (pilot)',
    },
    {
      quote:
        'Table QR orders landing on the same KDS as counter sales changed our Friday night — fewer missed tickets, less expo chaos.',
      name: 'Marcus Chen',
      role: 'Operations lead, fast-casual (pilot)',
    },
    {
      quote:
        'Preorder cutoffs and prepared dates gave us predictable prep volumes. We cut overproduction without sacrificing fill rate.',
      name: 'Priya Nair',
      role: 'Founder, catering kitchen (pilot)',
    },
  ],
} as const;

export const LANDING_FINAL_CTA = {
  title: 'Ready to unify POS and kitchen operations?',
  description:
    'Start your 14-day trial on the plan that fits today. Compare vendors, review capabilities, or book a walkthrough — then upgrade when volume and channels grow.',
  primaryCta: { label: 'Start free trial', href: '/signup' },
  secondaryCta: { label: 'Book a walkthrough', href: '/book-demo' },
  tertiaryCta: { label: 'Find your path', href: '/get-started' },
} as const;

export const LANDING_PRICING = {
  tag: 'Pricing',
  title: 'Plans that scale with your kitchen — not your hardware budget',
  description:
    'Transparent monthly pricing. Start on Starter, move to Pro when channels and volume grow, unlock Team for unlimited throughput and roles.',
} as const;
