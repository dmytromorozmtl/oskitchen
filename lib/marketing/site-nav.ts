/** Shared marketing site navigation — desktop header and mobile drawer. */

export const SITE_PRODUCT_NAV = [
  { label: 'Product overview', href: '/product' },
  { label: 'Integrations', href: '/integrations' },
  { label: 'Capability sheet', href: '/capabilities' },
] as const;

export const SITE_RESOURCES_NAV = [
  { label: 'Resource hub', href: '/resources' },
  { label: 'Interactive demo', href: '/demo' },
  { label: 'Compare vendors', href: '/compare' },
  { label: 'Trust & security', href: '/trust' },
  { label: 'Book a demo', href: '/book-demo' },
] as const;

/** Single top-level link in the header (between dropdowns). */
export const SITE_HEADER_LINKS = [{ label: 'Pricing', href: '/pricing' }] as const;

/** Prominent shortcuts at top of mobile drawer. */
export const SITE_MOBILE_QUICK_LINKS = [
  { label: 'Pricing', href: '/pricing', hint: 'Plans & TCO calculator' },
  { label: 'Get started', href: '/get-started', hint: 'Choose your workflow' },
] as const;

/** Flat list for mobile “Explore” and footer cross-links. */
export const SITE_MAIN_NAV = [
  ...SITE_PRODUCT_NAV,
  ...SITE_HEADER_LINKS,
  ...SITE_RESOURCES_NAV,
] as const;

export const SITE_HEADER_CTAS = {
  signIn: { label: 'Sign in', href: '/login' },
  trial: { label: 'Start free trial', href: '/signup' },
} as const;
