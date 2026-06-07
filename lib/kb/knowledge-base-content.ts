export type KbLocale = "en" | "fr" | "es";

export type LocalizedString = Record<KbLocale, string>;

export type KbArticle = {
  slug: string;
  categoryId: string;
  title: LocalizedString;
  summary: LocalizedString;
  body: LocalizedString;
  tags: string[];
  relatedSlugs: string[];
};

export type KbCategory = {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  articleSlugs: string[];
};

export const KB_SUPPORTED_LOCALES: { code: KbLocale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
];

export const KB_CATEGORIES: KbCategory[] = [
  {
    id: "getting-started",
    title: { en: "Getting started", fr: "Premiers pas", es: "Primeros pasos" },
    description: {
      en: "Launch your workspace in under 15 minutes.",
      fr: "Lancez votre espace en moins de 15 minutes.",
      es: "Lanza tu espacio en menos de 15 minutos.",
    },
    articleSlugs: [
      "getting-started/quick-start",
      "getting-started/first-menu",
      "getting-started/first-order",
    ],
  },
  {
    id: "operations",
    title: { en: "Daily operations", fr: "Opérations quotidiennes", es: "Operaciones diarias" },
    description: {
      en: "Orders, kitchen display, and production workflows.",
      fr: "Commandes, écran cuisine et production.",
      es: "Pedidos, pantalla de cocina y producción.",
    },
    articleSlugs: [
      "operations/order-hub",
      "operations/production-board",
      "operations/kds",
      "operations/pos-terminal",
    ],
  },
  {
    id: "integrations",
    title: { en: "Integrations", fr: "Intégrations", es: "Integraciones" },
    description: {
      en: "Connect sales channels honestly — credentials required.",
      fr: "Connectez vos canaux — identifiants requis.",
      es: "Conecta canales de venta — credenciales requeridas.",
    },
    articleSlugs: [
      "integrations/woocommerce",
      "integrations/shopify",
      "integrations/stripe-connect",
      "integrations/marketplaces",
    ],
  },
  {
    id: "inventory-finance",
    title: { en: "Inventory & finance", fr: "Stock & finance", es: "Inventario y finanzas" },
    description: {
      en: "Purchasing, invoice scanning, and bank reconciliation.",
      fr: "Achats, scan de factures et rapprochement bancaire.",
      es: "Compras, escaneo de facturas y conciliación bancaria.",
    },
    articleSlugs: [
      "inventory-finance/invoice-scanner",
      "inventory-finance/bank-import",
      "inventory-finance/purchasing",
    ],
  },
  {
    id: "billing",
    title: { en: "Billing & plans", fr: "Facturation", es: "Facturación" },
    description: {
      en: "Trials, plans, and Stripe checkout.",
      fr: "Essais, forfaits et paiement Stripe.",
      es: "Pruebas, planes y pago con Stripe.",
    },
    articleSlugs: ["billing/plans-and-trials", "billing/limits-and-upgrades"],
  },
];

export const KB_ARTICLES: KbArticle[] = [
  {
    slug: "getting-started/quick-start",
    categoryId: "getting-started",
    title: {
      en: "15-minute Quick Start wizard",
      fr: "Assistant Quick Start — 15 minutes",
      es: "Asistente Quick Start — 15 minutos",
    },
    summary: {
      en: "Name your restaurant, add a menu item, and ring your first POS order — no vault blockers.",
      fr: "Nommez votre restaurant, ajoutez un plat et encaissez votre première commande POS.",
      es: "Nombra tu restaurante, añade un plato y registra tu primer pedido POS.",
    },
    body: {
      en: `Open **Dashboard → Quick Start** for a three-step wizard with a live timer (~15 minutes).

**Step 1 — Account and location:** Sign up at os-kitchen.com/signup (14-day trial, no card). Complete onboarding — business name, vertical, timezone. Confirm **Settings → Locations**. Bookmark **Today** (\`/dashboard/today\`) as your command center.

**Step 2 — First menu item:** From **Menus**, create an active menu and add one dish with price and category. Set preorder cutoffs if running weekly menus.

**Step 3 — First order:** Open **POS Terminal**, open a shift, add the item, and checkout (cash works without Stripe). Order appears in **Order Hub**.

Demo data seeds supplier, staff, and register automatically. No integration credentials required. Full guide: \`/kb/getting-started/quick-start\` · docs/kb/quick-start-guide.md`,
      fr: `Ouvrez **Tableau de bord → Quick Start** — assistant en trois étapes (~15 min).

1. **Compte et site** — inscription, onboarding, fuseau horaire, **Today**.
2. **Premier plat** — menu actif + un article avec prix.
3. **Première commande** — terminal POS, encaissement, commande dans Order Hub.

Données démo créées automatiquement. Guide : \`/kb/getting-started/quick-start\`.`,
      es: `Abre **Panel → Quick Start** — asistente de tres pasos (~15 min).

1. **Cuenta y ubicación** — registro, onboarding, zona horaria, **Today**.
2. **Primer plato** — menú activo + un artículo con precio.
3. **Primer pedido** — terminal POS, cobro, pedido en Order Hub.

Datos demo automáticos. Guía: \`/kb/getting-started/quick-start\`.`,
    },
    tags: ["onboarding", "quick start", "pos", "demo"],
    relatedSlugs: [
      "getting-started/first-menu",
      "operations/pos-terminal",
      "integrations/stripe-connect",
      "billing/plans-and-trials",
    ],
  },
  {
    slug: "getting-started/first-menu",
    categoryId: "getting-started",
    title: {
      en: "Create your first menu",
      fr: "Créer votre premier menu",
      es: "Crear tu primer menú",
    },
    summary: {
      en: "Weekly menus, items, pricing, and preorder deadlines.",
      fr: "Menus hebdomadaires, articles et délais de précommande.",
      es: "Menús semanales, artículos y plazos de preventa.",
    },
    body: {
      en: `From **Dashboard → Menus**, create an active menu for your service window.

- Set pickup or delivery deadlines so production knows cut-off times.
- Add menu items with prepared dates, allergens, and channel SKUs when syncing later.
- Use **Menu templates** for seasonal rotations without rebuilding from scratch.`,
      fr: `Depuis **Tableau de bord → Menus**, créez un menu actif pour votre service.

- Définissez les délais de retrait ou livraison.
- Ajoutez des articles avec dates de préparation et allergènes.
- Utilisez les **modèles de menu** pour les rotations saisonnières.`,
      es: `Desde **Panel → Menús**, crea un menú activo para tu servicio.

- Define plazos de recogida o entrega.
- Añade artículos con fechas de preparación y alérgenos.
- Usa **plantillas de menú** para rotaciones estacionales.`,
    },
    tags: ["menu", "items", "preorder"],
    relatedSlugs: ["getting-started/quick-start", "operations/production-board"],
  },
  {
    slug: "getting-started/first-order",
    categoryId: "getting-started",
    title: {
      en: "Capture your first order",
      fr: "Enregistrer votre première commande",
      es: "Registrar tu primer pedido",
    },
    summary: {
      en: "Manual orders, storefront preorders, or channel imports.",
      fr: "Commandes manuelles, vitrine ou import de canaux.",
      es: "Pedidos manuales, tienda online o importación de canales.",
    },
    body: {
      en: `Orders can enter OS Kitchen three ways:

- **POS terminal** — fastest for dine-in and counter service.
- **Storefront** — customer-facing preorder when enabled on your plan.
- **Integrations** — WooCommerce or Shopify webhooks after credentials are verified.

Every order appears in **Order Hub** with status, fulfillment type, and kitchen routing.`,
      fr: `Les commandes entrent via le **terminal POS**, la **vitrine** ou les **intégrations** une fois les identifiants vérifiés. Toutes apparaissent dans le **Order Hub**.`,
      es: `Los pedidos entran por **terminal POS**, **tienda online** o **integraciones** tras verificar credenciales. Todos aparecen en **Order Hub**.`,
    },
    tags: ["orders", "pos", "storefront"],
    relatedSlugs: ["operations/order-hub", "integrations/woocommerce"],
  },
  {
    slug: "operations/order-hub",
    categoryId: "operations",
    title: {
      en: "Order Hub — unified queue",
      fr: "Order Hub — file unifiée",
      es: "Order Hub — cola unificada",
    },
    summary: {
      en: "One screen for POS, web, and marketplace orders.",
      fr: "Un écran pour POS, web et marketplaces.",
      es: "Una pantalla para POS, web y marketplaces.",
    },
    body: {
      en: `**Order Hub** aggregates every channel into a single operator queue.

Filter by status, fulfillment type, or brand. Bump orders to production or KDS from here. Marketplace adapters (Uber Eats, DoorDash, Grubhub) require partner credentials — status shows NEEDS_AUTH until verified.`,
      fr: `**Order Hub** regroupe tous les canaux. Les adaptateurs marketplace nécessitent des identifiants partenaires.`,
      es: `**Order Hub** agrupa todos los canales. Los adaptadores de marketplace requieren credenciales de partner.`,
    },
    tags: ["order hub", "channels", "queue"],
    relatedSlugs: ["operations/kds", "integrations/marketplaces"],
  },
  {
    slug: "operations/production-board",
    categoryId: "operations",
    title: {
      en: "Production board",
      fr: "Tableau de production",
      es: "Tablero de producción",
    },
    summary: {
      en: "Batch prep tasks tied to menu demand.",
      fr: "Tâches de préparation liées à la demande.",
      es: "Tareas de preparación ligadas a la demanda.",
    },
    body: {
      en: `The production board converts order demand into kitchen tasks.

Group by menu item, station, or fulfillment window. Staff mark tasks complete to update packing readiness. Advanced production features unlock on Team plans.`,
      fr: `Le tableau de production transforme la demande en tâches cuisine. Fonctions avancées sur le forfait Team.`,
      es: `El tablero convierte la demanda en tareas de cocina. Funciones avanzadas en plan Team.`,
    },
    tags: ["production", "kitchen", "tasks"],
    relatedSlugs: ["operations/kds", "getting-started/first-menu"],
  },
  {
    slug: "operations/kds",
    categoryId: "operations",
    title: {
      en: "Kitchen Display System (KDS)",
      fr: "Écran cuisine (KDS)",
      es: "Pantalla de cocina (KDS)",
    },
    summary: {
      en: "Real-time tickets for line cooks — requires network connectivity.",
      fr: "Tickets en temps réel — connexion réseau requise.",
      es: "Tickets en tiempo real — requiere conexión de red.",
    },
    body: {
      en: `Open **Dashboard → Kitchen Screen** on a tablet mounted in the pass.

Tickets sort by fire time and bump when complete. KDS does not replace expo verbal calls — it syncs status back to Order Hub. Offline finalization is not supported today.`,
      fr: `Ouvrez **Écran cuisine** sur une tablette au pass. La finalisation hors ligne n'est pas supportée.`,
      es: `Abre **Pantalla de cocina** en una tablet en el pass. La finalización offline no está soportada.`,
    },
    tags: ["kds", "kitchen", "tickets"],
    relatedSlugs: ["operations/order-hub", "operations/pos-terminal"],
  },
  {
    slug: "operations/pos-terminal",
    categoryId: "operations",
    title: {
      en: "POS terminal",
      fr: "Terminal POS",
      es: "Terminal POS",
    },
    summary: {
      en: "Web POS on tablets you already own — no proprietary hardware lease.",
      fr: "POS web sur vos tablettes — sans terminal propriétaire.",
      es: "POS web en tus tablets — sin terminal propietario.",
    },
    body: {
      en: `**Dashboard → POS Terminal** runs in the browser on iPad or Android tablets.

Features include open tabs, bill splitting, shift close reports, and handheld mode. Card payments use Stripe Terminal when configured — cash workflows work without Stripe.`,
      fr: `**Terminal POS** dans le navigateur. Paiements carte via Stripe Terminal si configuré.`,
      es: `**Terminal POS** en el navegador. Pagos con tarjeta vía Stripe Terminal si está configurado.`,
    },
    tags: ["pos", "tablet", "payments"],
    relatedSlugs: ["getting-started/quick-start", "billing/plans-and-trials"],
  },
  {
    slug: "integrations/woocommerce",
    categoryId: "integrations",
    title: {
      en: "Connect WooCommerce",
      fr: "Connecter WooCommerce",
      es: "Conectar WooCommerce",
    },
    summary: {
      en: "REST keys, webhooks, and product mapping.",
      fr: "Clés REST, webhooks et mapping produits.",
      es: "Claves REST, webhooks y mapeo de productos.",
    },
    body: {
      en: `**Prerequisites:** HTTPS WooCommerce store, REST Read/Write keys, webhook secret, Pro plan+.

**Dashboard steps:**
1. **Integrations → WooCommerce** — store URL, consumer key/secret, webhook secret → **Save**.
2. **Test connection** — verifies \`/wp-json/wc/v3/system_status\`.
3. **Sync products / Sync orders** — pulls catalog and open orders.
4. **Product mapping** — link unmatched SKUs before production routing.

**Webhooks:** \`https://YOUR_APP/api/webhooks/woocommerce?cid=<connection-id>\` with \`X-WC-Webhook-Signature\`. Topics: order.*, product.*.

**Troubleshooting:** 401 → regenerate keys; signature mismatch → align webhook secret; NEEDS_AUTH → re-save and test.

Full guide: docs/kb/integrations/woocommerce-setup.md`,
      fr: `**Prérequis :** boutique HTTPS, clés REST, secret webhook, forfait Pro+.

**Étapes :** Intégrations → WooCommerce → Test → Sync → Product mapping.

**Webhooks :** URL avec \`cid\` et signature HMAC.`,
      es: `**Requisitos:** tienda HTTPS, claves REST, secreto webhook, plan Pro+.

**Pasos:** Integraciones → WooCommerce → Test → Sync → Product mapping.

**Webhooks:** URL con \`cid\` y firma HMAC.`,
    },
    tags: ["woocommerce", "webhook", "integration"],
    relatedSlugs: ["integrations/shopify", "getting-started/first-order"],
  },
  {
    slug: "integrations/shopify",
    categoryId: "integrations",
    title: {
      en: "Connect Shopify",
      fr: "Connecter Shopify",
      es: "Conectar Shopify",
    },
    summary: {
      en: "Custom app OAuth and order sync.",
      fr: "App custom OAuth et sync commandes.",
      es: "App personalizada OAuth y sync de pedidos.",
    },
    body: {
      en: `**Prerequisites:** Custom app Admin API token (orders + products scopes), webhook signing secret, Pro plan+.

**Dashboard steps:**
1. **Integrations → Shopify** — \`your-store.myshopify.com\`, token, webhook secret, API version → **Save**.
2. **Test connection** — GraphQL \`shop { name }\`.
3. **Sync products / orders** — first page MVP sizes; re-sync for pagination.
4. Map external products to menu items where SKUs differ.

**Webhooks:** Register \`/api/webhooks/shopify/orders-create\`, \`orders-updated\`, \`products-update\`, \`app-uninstalled\`. HMAC via \`X-Shopify-Hmac-Sha256\`.

**Troubleshooting:** Scope errors → expand token; HMAC fail → match custom app secret; BETA until live smoke PASS.

Full guide: docs/kb/integrations/shopify-setup.md`,
      fr: `**Prérequis :** token Admin API, secret webhook, forfait Pro+.

**Étapes :** Intégrations → Shopify → Test → Sync → mapping.

**Webhooks :** chemins orders-create, orders-updated, products-update.`,
      es: `**Requisitos:** token Admin API, secreto webhook, plan Pro+.

**Pasos:** Integraciones → Shopify → Test → Sync → mapping.

**Webhooks:** rutas orders-create, orders-updated, products-update.`,
    },
    tags: ["shopify", "oauth", "integration"],
    relatedSlugs: ["integrations/woocommerce", "integrations/stripe-connect", "operations/order-hub"],
  },
  {
    slug: "integrations/stripe-connect",
    categoryId: "integrations",
    title: {
      en: "Connect Stripe (payments)",
      fr: "Connecter Stripe (paiements)",
      es: "Conectar Stripe (pagos)",
    },
    summary: {
      en: "Stripe Connect for storefront checkout, POS card payments, and subscription billing.",
      fr: "Stripe Connect pour vitrine, POS et abonnement.",
      es: "Stripe Connect para tienda, POS y suscripción.",
    },
    body: {
      en: `**Prerequisites:** OS Kitchen account, Stripe account, bank account for payouts, online connectivity for cards.

**Dashboard steps:**
1. **Billing → Connect Stripe** — complete Connect onboarding (business info, bank, verification).
2. Wait for **charges_enabled** before live checkout.
3. **Storefront** — Stripe Checkout on your slug (PCI SAQ-A — no card storage in OS Kitchen).
4. **POS Terminal** — card tender via Stripe Terminal when online; cash works without Stripe.
5. **Subscription** — upgrade plans from Billing; Checkout at /pricing.

**Webhooks:** \`https://YOUR_DOMAIN/api/webhooks/stripe\` — events: checkout.session.completed, subscription updated/deleted, invoice paid/failed. Secret → STRIPE_WEBHOOK_SECRET.

**Troubleshooting:** Incomplete onboarding → Stripe Dashboard holds; webhook 400 → signing secret; test card 4242... in test mode only.

Full guide: docs/kb/integrations/stripe-connect-setup.md`,
      fr: `**Connect Stripe :** onboarding Connect, vitrine Checkout, POS carte en ligne, abonnement via Billing.

**Webhooks :** \`/api/webhooks/stripe\` avec secret de signature.`,
      es: `**Connect Stripe:** onboarding Connect, checkout tienda, POS tarjeta online, suscripción vía Billing.

**Webhooks:** \`/api/webhooks/stripe\` con secreto de firma.`,
    },
    tags: ["stripe", "payments", "connect", "checkout"],
    relatedSlugs: ["billing/plans-and-trials", "getting-started/quick-start", "operations/pos-terminal"],
  },
  {
    slug: "integrations/marketplaces",
    categoryId: "integrations",
    title: {
      en: "Delivery marketplaces (Uber Eats, DoorDash, Grubhub)",
      fr: "Marketplaces livraison",
      es: "Marketplaces de delivery",
    },
    summary: {
      en: "Partner-gated adapters — BETA until your credentials are live.",
      fr: "Adaptateurs partenaires — BETA jusqu'à credentials live.",
      es: "Adaptadores partner — BETA hasta credenciales activas.",
    },
    body: {
      en: `**Prerequisites:** Team plan+, partner-approved API credentials per marketplace (Uber Eats, DoorDash, Grubhub).

**Dashboard steps:**
1. **Integrations** hub → select marketplace adapter.
2. Enter partner credentials → **Save** (encrypted at rest).
3. **Test connection** — may show NEEDS_AUTH until partner enables API access.
4. Review **Integration Health** — CONNECTED / NEEDS_AUTH / ERROR per channel.
5. Map marketplace menu items before accepting live orders.

**Webhooks:** Partner-specific URLs shown on Integrations card — register in partner portal. Inbound log at **Integrations → Webhook log**.

**Troubleshooting:** NEEDS_AUTH → contact partner support; orders missing → check mapping + webhook log; never claim LIVE without CONNECTED on your tenant.

Full guide: docs/kb/integrations/delivery-marketplaces-setup.md`,
      fr: `**Prérequis :** forfait Team+, identifiants partenaires approuvés.

**Étapes :** Intégrations → credentials → Test → Integration Health → mapping.

**Webhooks :** URLs partenaires depuis la carte Intégrations.`,
      es: `**Requisitos:** plan Team+, credenciales partner aprobadas.

**Pasos:** Integraciones → credenciales → Test → Integration Health → mapping.

**Webhooks:** URLs partner desde tarjeta Integraciones.`,
    },
    tags: ["uber eats", "doordash", "grubhub", "delivery"],
    relatedSlugs: ["operations/order-hub", "billing/limits-and-upgrades"],
  },
  {
    slug: "inventory-finance/invoice-scanner",
    categoryId: "inventory-finance",
    title: {
      en: "AI Invoice Scanner",
      fr: "Scan factures IA",
      es: "Escáner de facturas IA",
    },
    summary: {
      en: "Photograph supplier invoices to create supply receipts and update stock.",
      fr: "Photographiez les factures fournisseur pour créer des réceptions stock.",
      es: "Fotografía facturas de proveedor para crear recepciones de stock.",
    },
    body: {
      en: `Open **Inventory → Invoice Scanner** on mobile or desktop.

Capture with camera or gallery upload. AI extracts line items with confidence scores. Review and tap **Confirm All** to create a purchase order and update inventory. Works offline with queue sync when connectivity returns.`,
      fr: `Ouvrez **Scan factures**. L'IA extrait les lignes avec scores de confiance. Fonctionne hors ligne avec file d'attente.`,
      es: `Abre **Escáner de facturas**. La IA extrae líneas con puntuaciones de confianza. Funciona offline con cola de sync.`,
    },
    tags: ["invoice", "ocr", "inventory", "ai"],
    relatedSlugs: ["inventory-finance/purchasing", "inventory-finance/bank-import"],
  },
  {
    slug: "inventory-finance/bank-import",
    categoryId: "inventory-finance",
    title: {
      en: "Bank statement import",
      fr: "Import relevé bancaire",
      es: "Importar extracto bancario",
    },
    summary: {
      en: "CSV, PDF, or photo parsing with auto-matching to orders and invoices.",
      fr: "CSV, PDF ou photo avec rapprochement auto commandes/factures.",
      es: "CSV, PDF o foto con conciliación automática de pedidos/facturas.",
    },
    body: {
      en: `**Finance → Bank Statement Import** accepts CSV exports, PDF text, or statement photos.

Each line is auto-categorized (POS deposit, supplier payment, payroll, etc.) and matched to orders or supplier invoices by amount and date. High-confidence matches auto-reconcile; review the rest in **Bank reconciliation**.`,
      fr: `**Import relevé bancaire** accepte CSV, PDF ou photo. Rapprochement auto avec commandes et factures.`,
      es: `**Importar extracto** acepta CSV, PDF o foto. Conciliación auto con pedidos y facturas.`,
    },
    tags: ["bank", "reconciliation", "finance", "csv"],
    relatedSlugs: ["inventory-finance/invoice-scanner", "billing/plans-and-trials"],
  },
  {
    slug: "inventory-finance/purchasing",
    categoryId: "inventory-finance",
    title: {
      en: "Purchasing & marketplace",
      fr: "Achats & marketplace",
      es: "Compras y marketplace",
    },
    summary: {
      en: "Purchase orders, vendor catalogs, and HoReCa B2B marketplace (BETA).",
      fr: "Bons de commande, catalogues et marketplace B2B (BETA).",
      es: "Órdenes de compra, catálogos y marketplace B2B (BETA).",
    },
    body: {
      en: `Create POs from **Purchasing** or browse approved vendor catalogs in **Marketplace**.

Marketplace is BETA — design-partner vendors onboarding on staging. Restaurant buyers pay vendor list price plus Stripe processing; no separate OS Kitchen buyer fee.`,
      fr: `Créez des BC depuis **Achats** ou parcourez le **Marketplace** (BETA).`,
      es: `Crea OC desde **Compras** o explora el **Marketplace** (BETA).`,
    },
    tags: ["purchasing", "marketplace", "suppliers"],
    relatedSlugs: ["inventory-finance/invoice-scanner"],
  },
  {
    slug: "billing/plans-and-trials",
    categoryId: "billing",
    title: {
      en: "Plans, trials, and self-serve signup",
      fr: "Forfaits, essais et inscription",
      es: "Planes, pruebas e inscripción",
    },
    summary: {
      en: "Starter $49, Pro $79, Team $199, Enterprise $499 — 14-day trial, no card at signup.",
      fr: "Starter 49 $, Pro 79 $, Team 199 $ — essai 14 jours sans carte.",
      es: "Starter $49, Pro $79, Team $199 — prueba 14 días sin tarjeta.",
    },
    body: {
      en: `See published pricing at **/pricing**.

Starter, Pro, and Team include a 14-day free trial with no credit card at signup. Cancel anytime. No proprietary hardware lock-in — run POS on tablets you already own. Processing fees (Stripe) are not bundled in subscription prices.`,
      fr: `Tarifs sur **/pricing**. Essai 14 jours sans carte pour Starter, Pro et Team.`,
      es: `Precios en **/pricing**. Prueba 14 días sin tarjeta para Starter, Pro y Team.`,
    },
    tags: ["billing", "pricing", "trial", "stripe"],
    relatedSlugs: ["billing/limits-and-upgrades", "getting-started/quick-start"],
  },
  {
    slug: "billing/limits-and-upgrades",
    categoryId: "billing",
    title: {
      en: "Plan limits and upgrades",
      fr: "Limites et upgrades",
      es: "Límites y upgrades",
    },
    summary: {
      en: "Order caps, locations, integrations, and when to upgrade.",
      fr: "Plafonds commandes, sites et intégrations.",
      es: "Límites de pedidos, ubicaciones e integraciones.",
    },
    body: {
      en: `Each plan enforces limits on orders per month, locations, and integrations.

Starter: 1 location, 100 orders/mo. Pro: 1 location, 1,000 orders/mo + WooCommerce/Shopify. Team: 3 locations, unlimited orders + marketplace adapters + API. Upgrade from **Dashboard → Billing** or contact sales for Enterprise SSO and custom integrations.`,
      fr: `Chaque forfait a des limites. Upgrade depuis **Facturation** ou contactez les ventes pour Enterprise.`,
      es: `Cada plan tiene límites. Upgrade desde **Facturación** o contacta ventas para Enterprise.`,
    },
    tags: ["limits", "upgrade", "enterprise"],
    relatedSlugs: ["billing/plans-and-trials", "integrations/marketplaces"],
  },
];

export const KB_ARTICLE_BY_SLUG = new Map(KB_ARTICLES.map((article) => [article.slug, article]));
