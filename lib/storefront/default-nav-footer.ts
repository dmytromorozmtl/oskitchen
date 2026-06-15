import type { NavItem } from "@/lib/storefront-builder/navigation-types";

export function buildDefaultStorefrontNavigationItems(): { items: NavItem[] } {
  return {
    items: [
      { id: "nav-home", label: "Home", labels: { fr: "Accueil", es: "Inicio" }, target: { kind: "home" }, published: true },
      { id: "nav-menu", label: "Menu", labels: { fr: "Menu", es: "Menú" }, target: { kind: "menu" }, published: true },
      { id: "nav-about", label: "About", labels: { fr: "À propos", es: "Nosotros" }, target: { kind: "about" }, published: true },
      { id: "nav-contact", label: "Contact", labels: { fr: "Contact", es: "Contacto" }, target: { kind: "contact" }, published: true },
      { id: "nav-catering", label: "Catering", labels: { fr: "Traiteur", es: "Catering" }, target: { kind: "catering" }, published: true },
    ],
  };
}

export function buildDefaultStorefrontFooterBlocks(storeSlug: string) {
  const base = `/s/${storeSlug}`;
  return {
    blocks: [
      {
        type: "text" as const,
        body: "Fresh food, made to order. Update this text in the storefront builder.",
      },
      {
        type: "links" as const,
        title: "Explore",
        links: [
          { label: "Menu", href: `${base}/menu` },
          { label: "FAQ", href: `${base}/faq` },
          { label: "Privacy", href: `${base}/policies/privacy` },
          { label: "Terms", href: `${base}/policies/terms` },
        ],
      },
    ],
  };
}
