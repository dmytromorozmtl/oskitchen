/** Truth-safe FAQ for pricing page JSON-LD (must match on-page copy). */
export const PRICING_FAQ_ITEMS: Array<{ question: string; answer: string }> = [
  {
    question: "What's not included?",
    answer:
      'Card processing fees (Stripe), third-party marketplace commissions, SMS guest notifications, and formal SOC 2 attestation are not bundled in subscription list prices. You pay Stripe processing on card checkout when enabled; delivery marketplace fees are charged by Uber Eats, DoorDash, or Grubhub directly.',
  },
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
    question: 'What is the Design Partner tier?',
    answer:
      'Design Partner (SKU LOI-DP-001) is a public pilot offer for qualified meal prep, ghost kitchen, and commissary operators: $0 platform fee during a 3-month non-binding LOI, staging workspace, weekly feedback sync, and Integration Health onboarding. Request via /book-demo — not self-serve Stripe checkout. Paid pilot SOW is optional at term end.',
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
  {
    question: 'Does the HoReCa marketplace cost restaurants extra?',
    answer:
      'No separate marketplace subscription for buyers — catalog browse and PO workflow are included in Starter, Pro, Team, and Enterprise. You pay vendor list price plus Stripe processing at checkout. OS Kitchen commission is charged to suppliers, not as an extra line on your invoice.',
  },
  {
    question: 'How do marketplace vendor fees work?',
    answer:
      'Suppliers choose a vendor tier: Free ($0/mo, 5% commission), Growth ($99/mo, 3.5%), or Enterprise ($299/mo, 2%). Featured placement slots are optional add-ons for Growth+. Payouts require Stripe Connect onboarding after platform approval. Marketplace checkout is BETA until design-partner vendors are live.',
  },
  {
    question: 'Is the B2B marketplace live?',
    answer:
      'Marketplace is BETA — catalog and checkout are in design-partner onboarding on staging. We do not claim a live national supplier network until seeded vendors and buyer POs are verified. See /vendor for supplier recruitment.',
  },
];
