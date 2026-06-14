import type { KbLocale } from "@/lib/kb/knowledge-base-content";

export type KbFaqEntry = {
  id: string;
  question: Record<KbLocale, string>;
  answer: Record<KbLocale, string>;
  kbSlug?: string;
};

/** Curated /kb FAQ entries for FAQPage JSON-LD + visible Featured Snippet targets (P3-85). */
export const KB_FAQ_ENTRIES: readonly KbFaqEntry[] = [
  {
    id: "what-is-os-kitchen",
    question: {
      en: "What is OS Kitchen?",
      fr: "Qu'est-ce qu'OS Kitchen ?",
      es: "¿Qué es OS Kitchen?",
    },
    answer: {
      en: "OS Kitchen is a web-based restaurant operations platform: POS, kitchen display (KDS), production planning, integrations, and owner reporting. No proprietary hardware required — runs in the browser.",
      fr: "OS Kitchen est une plateforme d'exploitation restaurant en ligne : POS, écran cuisine (KDS), production, intégrations et rapports. Aucun matériel propriétaire requis.",
      es: "OS Kitchen es una plataforma de operaciones para restaurantes en la web: POS, pantalla de cocina (KDS), producción, integraciones e informes. Sin hardware propietario.",
    },
    kbSlug: "getting-started/quick-start",
  },
  {
    id: "quick-start-time",
    question: {
      en: "How long does OS Kitchen Quick Start take?",
      fr: "Combien de temps prend le Quick Start OS Kitchen ?",
      es: "¿Cuánto tarda el Quick Start de OS Kitchen?",
    },
    answer: {
      en: "About 15 minutes: create your account, add one menu item, and ring your first POS order. Demo data seeds staff and register automatically — no integration credentials required on day one.",
      fr: "Environ 15 minutes : créez votre compte, ajoutez un plat et encaissez votre première commande POS. Données démo automatiques — pas d'intégration requise le premier jour.",
      es: "Unos 15 minutos: crea tu cuenta, añade un plato y registra tu primer pedido POS. Datos demo automáticos — sin credenciales de integración el primer día.",
    },
    kbSlug: "getting-started/quick-start",
  },
  {
    id: "integrations-live",
    question: {
      en: "Which OS Kitchen integrations are LIVE?",
      fr: "Quelles intégrations OS Kitchen sont LIVE ?",
      es: "¿Qué integraciones de OS Kitchen están LIVE?",
    },
    answer: {
      en: "LIVE connectors include Shopify, WooCommerce, Stripe Connect, QuickBooks Online, and delivery marketplaces (DoorDash, Uber Eats, Grubhub) where credentials are configured. Check Integration Health in your dashboard for per-tenant PASS/SKIPPED status — not every row is live for every workspace.",
      fr: "Connecteurs LIVE : Shopify, WooCommerce, Stripe Connect, QuickBooks Online et marketplaces de livraison selon vos identifiants. Vérifiez Integration Health pour le statut PASS/SKIPPED par espace.",
      es: "Conectores LIVE: Shopify, WooCommerce, Stripe Connect, QuickBooks Online y marketplaces de delivery según credenciales. Revisa Integration Health para PASS/SKIPPED por workspace.",
    },
    kbSlug: "integrations/shopify",
  },
  {
    id: "shopify-setup",
    question: {
      en: "How do I connect Shopify to OS Kitchen?",
      fr: "Comment connecter Shopify à OS Kitchen ?",
      es: "¿Cómo conecto Shopify a OS Kitchen?",
    },
    answer: {
      en: "Open Dashboard → Integrations → Shopify. Enter your shop domain and complete OAuth. OS Kitchen registers HMAC-verified webhooks for orders/create and syncs kitchen tasks to KDS. See /kb/integrations/shopify for step-by-step setup.",
      fr: "Tableau de bord → Intégrations → Shopify. Saisissez le domaine et complétez OAuth. Webhooks HMAC et tickets KDS. Guide : /kb/integrations/shopify.",
      es: "Panel → Integraciones → Shopify. Introduce el dominio y completa OAuth. Webhooks HMAC y tickets KDS. Guía: /kb/integrations/shopify.",
    },
    kbSlug: "integrations/shopify",
  },
  {
    id: "kds-basics",
    question: {
      en: "How does the OS Kitchen KDS work?",
      fr: "Comment fonctionne le KDS OS Kitchen ?",
      es: "¿Cómo funciona el KDS de OS Kitchen?",
    },
    answer: {
      en: "Orders from POS, storefront, or integrations appear on the Kitchen Display System queue. Staff bump tickets through prep stages (confirmed → in progress → ready). Open Dashboard → Kitchen → KDS or /kb/operations/kds for workflow details.",
      fr: "Les commandes POS, boutique ou intégrations apparaissent sur le KDS. L'équipe fait avancer les tickets (confirmé → en cours → prêt). Détails : /kb/operations/kds.",
      es: "Pedidos de POS, tienda o integraciones aparecen en el KDS. El equipo avanza tickets (confirmado → en progreso → listo). Detalles: /kb/operations/kds.",
    },
    kbSlug: "operations/kds",
  },
  {
    id: "invoice-scanner",
    question: {
      en: "Does OS Kitchen scan supplier invoices?",
      fr: "OS Kitchen scanne-t-il les factures fournisseurs ?",
      es: "¿OS Kitchen escanea facturas de proveedores?",
    },
    answer: {
      en: "Yes — AI-assisted invoice capture extracts line items from uploaded PDFs or photos and drafts purchase orders for review. Accuracy varies by document quality; always review before posting. Guide: /kb/inventory-finance/invoice-scanner.",
      fr: "Oui — capture assistée par IA depuis PDF ou photo, brouillon de bon de commande à valider. Précision variable — toujours vérifier. Guide : /kb/inventory-finance/invoice-scanner.",
      es: "Sí — captura asistida por IA desde PDF o foto, borrador de orden de compra para revisar. Precisión variable — siempre revisar. Guía: /kb/inventory-finance/invoice-scanner.",
    },
    kbSlug: "inventory-finance/invoice-scanner",
  },
  {
    id: "pricing-trial",
    question: {
      en: "How much does OS Kitchen cost and is there a free trial?",
      fr: "Quel est le prix d'OS Kitchen et y a-t-il un essai gratuit ?",
      es: "¿Cuánto cuesta OS Kitchen y hay prueba gratis?",
    },
    answer: {
      en: "Starter plans begin at $49/month with a 14-day trial (no card required at signup). Design Partner pilots may qualify for extended trial terms — see /pricing. Billing guide: /kb/billing/plans-and-trials.",
      fr: "Forfaits Starter dès 49 $/mois, essai 14 jours sans carte à l'inscription. Pilotes Design Partner : voir /pricing. Guide : /kb/billing/plans-and-trials.",
      es: "Planes Starter desde $49/mes, prueba 14 días sin tarjeta al registrarse. Pilotos Design Partner: ver /pricing. Guía: /kb/billing/plans-and-trials.",
    },
    kbSlug: "billing/plans-and-trials",
  },
  {
    id: "get-support",
    question: {
      en: "How do I get help with OS Kitchen?",
      fr: "Comment obtenir de l'aide avec OS Kitchen ?",
      es: "¿Cómo obtengo ayuda con OS Kitchen?",
    },
    answer: {
      en: "Start with this Knowledge Base at /kb — search guides for POS, KDS, integrations, and billing. For live onboarding, book a demo at /book-demo or email hello@kitchenos.app.",
      fr: "Commencez par cette base de connaissances /kb. Pour un accompagnement live : /book-demo ou hello@kitchenos.app.",
      es: "Empieza en esta base de conocimiento /kb. Para onboarding en vivo: /book-demo o hello@kitchenos.app.",
    },
  },
] as const;

export const KB_FAQ_MIN_ENTRY_COUNT = 8 as const;

export function getKbFaqForLocale(locale: KbLocale): Array<{ question: string; answer: string; id: string }> {
  return KB_FAQ_ENTRIES.map((entry) => ({
    id: entry.id,
    question: entry.question[locale] ?? entry.question.en,
    answer: entry.answer[locale] ?? entry.answer.en,
  }));
}
