/** Hero badge — exported for tests. */
export const VENDOR_RECRUITMENT_BADGE = "B2B HoReCa marketplace · BETA" as const;

export const VENDOR_RECRUITMENT_HEADLINE =
  "Sell to restaurants on the OS Kitchen marketplace" as const;

export const VENDOR_RECRUITMENT_SUBHEADLINE =
  "List packaging, cleaning, kitchenware, and more for commissary buyers — platform verification and Stripe Connect required before go-live." as const;

export const VENDOR_RECRUITMENT_TRUST_LINE =
  "Marketplace scaffold is live in engineering — vendor seeding and pilot tenants in progress. Not a national supplier network yet." as const;

export const VENDOR_RECRUITMENT_PAIN_POINTS = [
  {
    title: "Restaurant buyers live in fragmented tools",
    description:
      "Operators order supplies through phone calls, email threads, and legacy portals — your catalog is hard to discover when they run ops in OS Kitchen.",
  },
  {
    title: "Manual PO chasing slows fulfillment",
    description:
      "Without a shared order spine, confirmations, packing slips, and status updates happen outside the buyer's kitchen workflow.",
  },
  {
    title: "Payout setup is another onboarding hurdle",
    description:
      "Suppliers need a clear Connect path and honest scope — not a promise of instant marketplace revenue on day one.",
  },
] as const;

export const VENDOR_RECRUITMENT_BENEFITS = [
  {
    title: "Reach commissary buyers in OS Kitchen",
    description:
      "When your workspace is approved, catalog SKUs appear to buyers browsing HoReCa categories in their marketplace hub.",
  },
  {
    title: "Vendor cabinet for catalog & orders",
    description:
      "Manage products, view purchase orders, and track fulfillment from /vendor — same platform spine as buyer checkout.",
  },
  {
    title: "Stripe Connect Express (test scope)",
    description:
      "Connect payouts when MARKETPLACE_VENDOR_STRIPE_CONNECT is enabled in staging — production payout policy follows pilot review.",
  },
  {
    title: "8 HoReCa parent categories",
    description:
      "Packaging, cleaning, kitchenware, equipment, dry goods, services, uniforms, and training — map SKUs to the taxonomy buyers filter by.",
  },
  {
    title: "Platform verification gate",
    description:
      "We review company profile and compliance documents before listing — honest status badges, not fake LIVE supplier claims.",
  },
  {
    title: "Design partner path",
    description:
      "Early suppliers help seed staging catalogs and pilot metrics — labeled clearly when demo inventory is used.",
  },
] as const;

export const VENDOR_RECRUITMENT_STEPS = [
  {
    step: "1",
    title: "Create or join a workspace",
    description: "OS Kitchen vendor onboarding is workspace-scoped — one application per supplier workspace.",
  },
  {
    step: "2",
    title: "Submit at /vendor/register",
    description: "Company profile, tax details, and at least one compliance document for platform review.",
  },
  {
    step: "3",
    title: "Platform approval",
    description: "Ops reviews at /platform/marketplace/vendor-verification — typical path: PENDING → UNDER_REVIEW → APPROVED.",
  },
  {
    step: "4",
    title: "Connect Stripe & list products",
    description: "Complete Connect at /vendor/finance, add 8–15 SKUs at /vendor/products — moderation before ACTIVE catalog.",
  },
  {
    step: "5",
    title: "Receive purchase orders",
    description: "Buyers checkout from /dashboard/marketplace — orders land in /vendor/orders when catalog is live.",
  },
] as const;

export const VENDOR_RECRUITMENT_LIMITATIONS = [
  "Marketplace is BETA — 0 signed marketplace customers at pre-scale; not Sysco or Amazon Business parity.",
  "Platform verification required before listing — not instant go-live on submit.",
  "Stripe Connect payouts follow staging test keys until production payout policy is signed off.",
  "Buyer demand depends on pilot restaurant workspaces — no guaranteed order volume.",
  "Equipment-heavy vendors may deprioritize for v1 seed unless committed design partner.",
] as const;

export const VENDOR_RECRUITMENT_FAQ = [
  {
    q: "Who can apply?",
    a: "HoReCa suppliers with a real company profile and compliance documents. Applications are workspace-scoped — one vendor record per supplier workspace.",
  },
  {
    q: "How long does review take?",
    a: "Pilot SLA targets manual review within a few business days — not an automated instant approval. Check status at /vendor/register/status.",
  },
  {
    q: "What categories are supported?",
    a: "Eight parent categories: Packaging & Disposables, Cleaning & Sanitation, Kitchenware & Tools, Equipment, Dry Goods & Ingredients, Services, Uniforms & Workwear, Training & Certification.",
  },
  {
    q: "Do I need Stripe?",
    a: "Stripe Connect Express is required for the checkout and payout path when enabled in your environment. Staging uses test mode — see docs/stripe-connect-vendor-test-plan.md.",
  },
  {
    q: "Is there a fee to join?",
    a: "Marketplace pricing for vendors is pilot-dependent — confirm commercial terms with OS Kitchen before scaling. This landing does not promise zero-fee or revenue guarantees.",
  },
] as const;

export const VENDOR_RECRUITMENT_CTA = {
  title: "Apply to become a marketplace vendor",
  subtitle:
    "Submit your application in about five minutes. Platform verification required before your catalog goes live to buyers.",
} as const;
