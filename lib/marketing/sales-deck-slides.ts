export type SalesDeckSlide = {
  id: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
  cta?: { label: string; href: string }[];
};

/** Source of truth for /deck print view — keep in sync with docs/sales-deck.md */
export const SALES_DECK_SLIDES: SalesDeckSlide[] = [
  {
    id: "title",
    title: "OS Kitchen",
    subtitle:
      "Kitchen Operations Platform for Meal Prep, Ghost Kitchens & Preorder Businesses — one system for the floor, the line, and production on devices you already own.",
  },
  {
    id: "problem",
    title: "The problem",
    bullets: [
      "Kitchens lose 3–8% revenue on food waste and rework",
      "Orders from multiple channels create chaos",
      "Production planning is manual — spreadsheets and whiteboards",
      "Packing mistakes cost time, refunds, and reputation",
      "Legacy POS vendors lock you into $2K–5K hardware leases",
    ],
  },
  {
    id: "solution",
    title: "The solution",
    subtitle: "One platform: POS + Storefront + Production + Packing + Delivery",
    bullets: [
      "Real-time sync from order arrival to dispatch",
      "Web-first — tablets and laptops you already own",
      "Stripe Connect — no card data on your servers",
    ],
  },
  {
    id: "who",
    title: "Who it's for",
    table: {
      headers: ["Segment", "Fit"],
      rows: [
        ["Meal prep", "Weekly preorder → production → packing"],
        ["Ghost kitchen", "Multi-brand routing, shared KDS"],
        ["Weekly preorder brands", "Cutoff times, batch production"],
        ["Catering", "Quotes, deposits, routes"],
        ["Small producers", "Inventory, costing, storefront"],
      ],
    },
    subtitle: "ICP: 1–3 locations, $500K–$3M/year, preorder or production complexity.",
  },
  {
    id: "before-after",
    title: "Before / After",
    table: {
      headers: ["Before", "After"],
      rows: [
        ["Spreadsheets for demand", "Automated production board"],
        ["WhatsApp chaos", "Unified order hub"],
        ["Paper tickets", "Real-time KDS"],
        ["Manual packing lists", "Verification + labels"],
        ["POS + website + ops tools", "One dashboard"],
      ],
    },
  },
  {
    id: "modules",
    title: "Core modules",
    bullets: [
      "POS Terminal — counter, cash + Stripe, handheld",
      "Online Storefront — branded preorder, Stripe checkout, QR",
      "Production Board — batch planning, yield, stations",
      "Packing & Verification — checklists, labels, waves",
      "KDS — Supabase Realtime kitchen queue",
      "Inventory & Costing — margins, purchasing demand",
    ],
  },
  {
    id: "storefront",
    title: "Storefront",
    bullets: [
      "Theme builder and custom domains",
      "Preorder cutoffs and pickup windows",
      "Stripe Connect checkout (SAQ-A path)",
      "QR menus and embeddable widgets",
      "SEO-ready pages — included in Pro",
    ],
  },
  {
    id: "production",
    title: "Production & packing",
    bullets: [
      "Batch production with yield",
      "Station routing to KDS",
      "Lane packing with item verification",
      "Label printing and waves",
      "Lifecycle: confirmed → preparing → ready → completed",
    ],
  },
  {
    id: "pricing",
    title: "Pricing",
    table: {
      headers: ["Plan", "Price", "Best for"],
      rows: [
        ["Starter", "$29/mo", "POS + storefront"],
        ["Pro", "$79/mo", "Production + packing + integrations"],
        ["Team", "$199/mo", "Multi-staff, analytics"],
      ],
    },
    subtitle: "14-day free trial · No hardware required · BYOD",
  },
  {
    id: "pilot",
    title: "Pilot offer",
    bullets: [
      "3 months at 50% off ($15–100/mo depending on plan)",
      "White-glove onboarding — menu, products, storefront",
      "Weekly 30-minute check-in",
      "Priority feature requests",
      "Written case study permission (named or anonymized)",
    ],
  },
  {
    id: "compare",
    title: "Why not Toast / Square?",
    table: {
      headers: ["OS Kitchen", "Legacy POS"],
      rows: [
        ["$0 hardware upfront", "Terminal lease $50–100/mo"],
        ["Built for production kitchens", "Built for payment capture"],
        ["Storefront included", "Website is extra"],
        ["Multi-brand ready", "Single-brand default"],
        ["Web-first, any device", "Proprietary hardware"],
      ],
    },
    subtitle: "Replace the second system — kitchen ops + preorder — even if you keep legacy POS for payments.",
  },
  {
    id: "cta",
    title: "Next step",
    cta: [
      { label: "Book a demo", href: "https://os-kitchen.com/demo" },
      { label: "Start free trial", href: "https://os-kitchen.com/signup" },
      { label: "Compare plans", href: "https://os-kitchen.com/compare" },
    ],
    subtitle: "support@os-kitchen.com",
  },
];
