/** /get-started — segment-aware conversion hub (single CTA orchestration). */

export type GetStartedPath = {
  id: string;
  segment: string;
  headline: string;
  description: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  proof: string;
  proofHref?: string;
};

export const GET_STARTED_COPY = {
  metaTitle: 'Get Started with OS Kitchen — Choose Your Path',
  metaDescription:
    'Start a 14-day trial, book a walkthrough, or explore solutions by business type. Restaurant POS and kitchen operations for US & Canada.',
  eyebrow: 'Get started',
  headline: 'Pick the path that matches how you run food today',
  subheadline:
    'Whether you ship weekly meal prep or run a Friday dining room, start with the workflow that hurts most — then expand channels when integrations are verified.',
  trustLine: '14-day trial · No credit card · Paid pilot onboarding available',
} as const;

export const GET_STARTED_PATHS: GetStartedPath[] = [
  {
    id: 'meal-prep',
    segment: 'Meal prep & weekly preorders',
    headline: 'Connect preorders to production and packing',
    description:
      'Best when Sunday spreadsheets and mispacks are your bottleneck. Start with menu cutoffs and a production board.',
    primary: { label: 'Start free trial', href: '/signup?utm_source=get-started&utm_campaign=meal-prep' },
    secondary: { label: 'Meal prep solution', href: '/solutions/meal-prep' },
    proof: 'See meal prep software comparison',
    proofHref: '/compare/meal-prep-software',
  },
  {
    id: 'restaurant',
    segment: 'Restaurant & full-service dining',
    headline: 'Unify floor POS, QR, and kitchen display',
    description:
      'Best when expo and servers disagree about ticket status. Web-based POS on tablets you already own.',
    primary: { label: 'Start free trial', href: '/signup?utm_source=get-started&utm_campaign=restaurant' },
    secondary: { label: 'See POS comparison', href: '/compare/restaurant-pos' },
    proof: 'Toast vs Square comparison guide',
    proofHref: '/compare/restaurant-pos',
  },
  {
    id: 'ghost',
    segment: 'Ghost & multi-brand kitchens',
    headline: 'One KDS across virtual brands',
    description:
      'Best when each brand has its own tablet chaos. Brand-tagged tickets with shared production.',
    primary: { label: 'Start free trial', href: '/signup?utm_source=get-started&utm_campaign=ghost' },
    secondary: { label: 'Ghost kitchen solution', href: '/solutions/ghost-kitchens' },
    proof: 'Ghost kitchen solution deep-dive',
    proofHref: '/solutions/ghost-kitchens',
  },
  {
    id: 'catering',
    segment: 'Catering & events',
    headline: 'Quotes, prep lists, and deposits in one place',
    description:
      'Best when events live in email threads. Catering deposits are beta — disclosed in onboarding.',
    primary: { label: 'Talk to sales', href: '/contact-sales?utm_source=get-started&utm_campaign=catering' },
    secondary: { label: 'Catering solution', href: '/solutions/catering' },
    proof: 'Capability sign-off required for deposit timelines',
    proofHref: '/capabilities',
  },
  {
    id: 'enterprise',
    segment: 'Multi-location & enterprise',
    headline: 'Custom rollout with a capability sheet',
    description:
      'Best for 3+ locations, SSO roadmap interest, or scoped integrations. White-glove paid pilot.',
    primary: { label: 'Contact sales', href: '/contact-sales?utm_source=get-started&utm_campaign=enterprise' },
    secondary: { label: 'Book a demo', href: '/book-demo' },
    proof: 'SSO / SOC2 not sold as live today',
    proofHref: '/trust',
  },
];

export const GET_STARTED_FOOTER_LINKS = [
  { label: 'Interactive demo', href: '/demo' },
  { label: 'Pricing & TCO calculator', href: '/pricing' },
  { label: 'All solutions', href: '/solutions' },
  { label: 'Trust & security', href: '/trust' },
] as const;
