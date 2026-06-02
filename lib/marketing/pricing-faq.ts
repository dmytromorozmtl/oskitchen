/** Truth-safe FAQ for pricing page JSON-LD (must match on-page copy). */
export const PRICING_FAQ_ITEMS: Array<{ question: string; answer: string }> = [
  {
    question: 'Do you replace Shopify?',
    answer:
      'No — OS Kitchen operationalizes the kitchen after orders exist. Many teams keep Shopify or WooCommerce for marketing and sync kitchen workflows.',
  },
  {
    question: 'Is OS Kitchen a Toast replacement?',
    answer:
      'Not a blanket replacement claim. OS Kitchen is strongest when you need web POS, kitchen display, and production in one workspace — especially without a terminal lease.',
  },
  {
    question: 'Are Uber Eats or DoorDash live by default?',
    answer:
      'No. Marketplace adapters are partner-gated or BETA until your credentials are verified. See Integration health after connecting.',
  },
  {
    question: 'Is Uber Direct included?',
    answer:
      'No. Uber Direct courier dispatch is on the roadmap and is not sold as a live feature on any plan. Use delivery routes for manual driver manifests today.',
  },
  {
    question: 'Do I need Stripe?',
    answer:
      'Required for hosted subscription billing and storefront card checkout when enabled — not for every counter cash workflow.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Starter, Pro, and Team include a 14-day trial with no credit card required at signup.',
  },
  {
    question: 'Are SOC 2, SSO, or SMS included?',
    answer:
      'No — formal SOC 2 attestation, enterprise SSO/SCIM, and SMS guest notifications are roadmap or require separate contracts.',
  },
  {
    question: 'Does POS work offline?',
    answer: 'No — POS and KDS require network connectivity for sale finalization and ticket sync.',
  },
  {
    question: 'How does annual billing work?',
    answer:
      'Annual toggle shows an approximate ~17% effective discount on published monthly list prices. Confirm final numbers with sales before enterprise contracts.',
  },
];
