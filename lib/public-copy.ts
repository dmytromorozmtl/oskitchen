export const integrationPages = {
  woocommerce: {
    title: "WooCommerce food order operations",
    status: "BETA — test shop certification required",
    description:
      "Connect WooCommerce order and product data to OS Kitchen production, packing, and fulfillment workflows. Available as BETA: signed webhooks, REST sync, and tenant-isolated ingest — not marketed as marketplace-certified until your test shop passes the in-app certification checklist.",
    for: "Meal prep, bakeries, and catering teams already selling through WooCommerce.",
    credentials: "WooCommerce REST API keys, webhook signing secret, and HTTPS store URL.",
    limitations:
      "BETA: refunds/cancel automation may be limited; high-volume stores should enable async webhook queue. No fake verified badge — run certification in the dashboard after connecting a test shop.",
  },
  shopify: {
    title: "Shopify meal prep fulfillment",
    status: "BETA — test shop certification required",
    description:
      "Bring Shopify orders into a kitchen operations hub for menus, packing, labels, and reports. BETA custom-app integration with HMAC webhooks and Admin API sync — Shopify App Store listing approval is not claimed.",
    for: "Food brands using Shopify checkout but running fulfillment in-house.",
    credentials: "Custom app Admin API token, *.myshopify.com domain, and webhook signing secret.",
    limitations:
      "BETA: inventory reservations and some fulfillment topics may be out of scope. GDPR/redact webhooks required for public apps. Certification on a test shop is required before pilot marketing.",
  },
  "uber-eats": {
    title: "Uber Eats operational architecture",
    status: "Partner access required",
    description: "Prepare kitchen workflows for Uber Eats order payloads once appropriate partner/API access is available.",
    for: "Operators coordinating delivery marketplaces with internal production.",
    credentials: "Appropriate Uber partner/API access and marketplace credentials.",
    limitations:
      "Production Uber Eats ingestion requires Uber partnership, contract, and signing schemes finalized for your tenant. In-repo routes may include stub/evaluation paths — treat traffic as non-production until Uber approves.",
  },
  "uber-direct": {
    title: "Uber Direct delivery dispatch",
    status: "Roadmap / setup foundation",
    description:
      "OS Kitchen includes routing placeholders and documentation for a future Uber Direct handoff — not live courier dispatch out of the box.",
    for: "Teams evaluating how OS Kitchen could sit beside a future Uber Direct contract.",
    credentials: "Uber Direct developer credentials when you have an approved Uber program.",
    limitations:
      "Live dispatch, pricing, and SLA depend on Uber Direct onboarding and geography. Do not market as production-ready delivery until Uber confirms your integration.",
  },
  "manual-orders": {
    title: "Manual order entry",
    status: "Live ready",
    description: "Create kitchen-ready orders without a connected sales channel.",
    for: "Teams migrating from spreadsheets, Google Forms, phone orders, and weekly lists.",
    credentials: "No external credentials required.",
    limitations: "Manual entry depends on staff process quality; bulk imports should use the import center.",
  },
  "public-storefront": {
    title: "Public preorder storefront",
    status: "Live ready",
    description: "Publish preorder menus with pickup/delivery rules and order confirmation flow.",
    for: "Weekly preorder businesses that want a lightweight ordering surface.",
    credentials: "OS Kitchen account and configured menu/storefront settings.",
    limitations: "Advanced payment capture depends on Stripe setup and local business requirements.",
  },
} as const;

export const solutionPages = {
  "meal-prep": {
    title: "Meal prep operations software",
    description: "Plan weekly menus, forecast prep quantities, pack accurately, and manage pickup/delivery from one dashboard.",
    whoFor: "Weekly menu teams, macro kitchens, and high-volume preorder operators.",
    pain: ["Spreadsheet menus drift from real orders", "Packing mistakes create refunds", "Prep teams lack one source of truth"],
    workflow: "Publish weekly menu -> import/storefront orders -> forecast quantities -> cook/pack/label -> route delivery.",
    modules: ["Order hub", "Menu planner", "Production", "Packing", "Routes", "Storefront"],
    limitations: [
      "Delivery marketplaces require your credentials and appropriate partner access where applicable.",
      "Ingredient-level shortage blockers only activate when recipes, stock, and demand runs are configured.",
    ],
  },
  catering: {
    title: "Catering production workflow",
    description: "Turn quotes into production plans, packing sheets, and delivery routes.",
    whoFor: "Catering coordinators, commissary teams, and event-heavy operators.",
    pain: ["Quotes are disconnected from kitchen prep", "Event changes get lost", "Delivery manifests are rebuilt manually"],
    workflow: "Create quote -> approve menu -> production plan -> packing sheet -> delivery route.",
    modules: ["Catering quotes", "Order hub", "Production", "Packing", "Routes", "CRM tasks"],
    limitations: [
      "Payment capture for large events follows your Stripe and approval workflow — not a full ERP replacement.",
    ],
  },
  "ghost-kitchens": {
    title: "Ghost kitchen order hub",
    description: "Operate multiple virtual brands while keeping production, labels, and exceptions in one queue.",
    whoFor: "Virtual-brand operators juggling delivery channels and shared prep lines.",
    pain: ["Many channels, one kitchen line", "Marketplace sync failures are hard to triage", "Brand menus duplicate prep work"],
    workflow: "Connect channels -> normalize orders -> map products -> produce by station -> verify packing.",
    modules: ["Sales channels", "Product mapping", "Order hub", "Production", "Packing", "Integration health"],
    limitations: [
      "Uber Eats and similar channels remain partner-gated; OS Kitchen surfaces architecture and readiness, not fake live menus.",
    ],
  },
  bakeries: {
    title: "Bakery preorder management",
    description: "Manage weekly drops, preorder cutoffs, labels, and pickup queues.",
    whoFor: "Retail bakeries, micro-bakeries, and preorder-heavy bake schedules.",
    pain: ["Cutoff windows move by product", "Bake quantities are hard to forecast", "Pickup queues need labeled bags"],
    workflow: "Plan drop -> close preorders -> bake schedule -> label -> pickup handoff.",
    modules: ["Storefront", "Order hub", "Nutrition labels", "Production", "Packing"],
    limitations: [
      "Allergen and nutrition outputs depend on accurate recipe data entered by your team.",
    ],
  },
  "weekly-preorders": {
    title: "Weekly preorder operations",
    description: "Coordinate recurring preorder cycles from menu planning to production day.",
    whoFor: "Teams running fixed weekly cycles and cutoff-driven menus.",
    pain: ["Preorder deadlines are hard to enforce", "Menu changes confuse customers", "Kitchen quantities are manually counted"],
    workflow: "Open preorder -> close cutoff -> freeze menu -> generate production/packing lists.",
    modules: ["Menu planner", "Storefront", "Order hub", "Ingredient demand", "Production"],
    limitations: [
      "Forecast quality depends on historical orders and configured recipes — not magic demand guarantees.",
    ],
  },
  "cloud-kitchens": {
    title: "Cloud kitchen fulfillment control",
    description: "Centralize multi-brand production and dispatch without replacing your sales channels.",
    whoFor: "Cloud kitchens consolidating many brands into one pass-through line.",
    pain: ["Brands share ingredients and staff", "Orders arrive from many tools", "Managers need lane-level visibility"],
    workflow: "Normalize channels -> assign production lanes -> verify packing -> dispatch.",
    modules: ["Sales channels", "Order hub", "Production", "Packing", "Routes"],
    limitations: [
      "OS Kitchen does not replace Toast or other legacy POS suites; it coordinates operational truth once orders exist.",
    ],
  },
  "corporate-lunch": {
    title: "Corporate lunch operations",
    description: "Coordinate recurring office meals, boxed lunches, and delivery manifests.",
    whoFor: "B2B lunch programs, office catering, and recurring drop clients.",
    pain: ["Order changes land late", "Dietary notes need clear labels", "Routes need reliable handoff"],
    workflow: "Capture order -> confirm dietary notes -> produce boxed meals -> route delivery.",
    modules: ["Order hub", "Catering quotes", "Production", "Packing", "Routes", "CRM"],
    limitations: [
      "SOC 2 / formal compliance attestations are roadmap unless separately documented for your tenant.",
    ],
  },
  cafes: {
    title: "Cafe operations",
    description: "Blend counter POS, made-to-order items, and light production without losing the ticket thread.",
    whoFor: "Cafés, coffee bars, and counter-service spots with a small BOH.",
    pain: ["POS and online orders diverge", "Barista and kitchen queues collide", "Labels and handoff get rushed"],
    workflow: "POS sale -> kitchen routing -> pickup handoff -> CRM follow-up when linked.",
    modules: ["POS Terminal", "Order hub", "Production", "KDS", "CRM"],
    limitations: [
      "Stripe Terminal hardware is not claimed; payments follow your configured Stripe and cash workflows.",
    ],
  },
  restaurants: {
    title: "Restaurant POS and floor operations",
    description: "Table management, KDS, QR ordering, and handheld POS in one web-based platform.",
    whoFor: "Full-service restaurants, bistros, and dine-in operators.",
    pain: ["POS and kitchen use different systems", "Table status lives on paper", "QR ordering is a separate vendor"],
    workflow: "Seat guest -> take order -> KDS -> bump -> close tab or check.",
    modules: ["POS Terminal", "Table management", "KDS", "QR generator", "Tab management"],
    limitations: ["Stripe Terminal hardware is not included — use web POS on your devices."],
  },
  bars: {
    title: "Bar POS with tabs",
    description: "Tabs, quick-order drinks, and kitchen routing for high-volume bars.",
    whoFor: "Bars, pubs, and nightlife venues.",
    pain: ["Tabs get lost between POS and kitchen", "Drink keys are slow at peak", "Split checks are manual"],
    workflow: "Open tab -> quick adds -> kitchen food tickets -> close with tip.",
    modules: ["POS Terminal", "Tab management", "KDS", "Daily service mode"],
    limitations: ["Full split-bill UI is rolling out; schema supports paid-by tracking."],
  },
  "fast-casual": {
    title: "Fast-casual throughput",
    description: "Quick-order POS, KDS, and production for high-volume lines.",
    whoFor: "Fast-casual, QSR, and counter-heavy concepts.",
    pain: ["Line busts during lunch", "KDS not synced with web orders", "Prep quantities are guessed"],
    workflow: "Order -> KDS -> bump -> handoff; production board for prep.",
    modules: ["POS Terminal", "KDS", "Production", "QR ordering"],
    limitations: ["Self-service kiosk is on the roadmap for Q4 2026."],
  },
  "multi-brand": {
    title: "Multi-brand and commissary throughput",
    description: "Run multiple brands from one kitchen with honest channel maturity and mapping discipline.",
    whoFor: "Shared kitchens, commissary production, and multi-brand groups.",
    pain: ["Menus duplicate prep", "Channel errors hide in one inbox", "Brand mix is hard to explain"],
    workflow: "Normalize channels -> map SKUs -> produce by brand -> verify packing -> dispatch.",
    modules: ["Brands", "Sales channels", "Product mapping", "Production", "Reports"],
    limitations: [
      "Brand filters and workload views require consistent catalog and channel configuration.",
    ],
  },
} as const;

export const resourcePages = {
  "meal-prep-operations": "How to run meal prep operations without spreadsheet chaos",
  "kitchen-production-planning": "Kitchen production planning for preorder businesses",
  "packing-labels-for-meal-prep": "Packing labels for meal prep teams",
  "woocommerce-food-orders": "How to operationalize WooCommerce food orders",
  "shopify-meal-prep-store": "Running a Shopify meal prep store after checkout",
  "catering-production-workflow": "Catering production workflow from quote to route",
} as const;
