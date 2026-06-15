import type { NavItem, NavItemTarget } from "@/lib/storefront-builder/navigation-types";

export type FooterLink = {
  id: string;
  label: string;
  href: string;
};

export type FooterBlock =
  | { id: string; type: "text"; body: string }
  | { id: string; type: "links"; title: string; links: FooterLink[] };

function newId(): string {
  return `id-${Math.random().toString(36).slice(2, 10)}`;
}

export function parseNavigationItems(raw: unknown): NavItem[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter((x): x is NavItem => typeof x === "object" && x !== null && "id" in x && "label" in x);
  }
  if (typeof raw === "object" && raw !== null && "items" in raw) {
    const items = (raw as { items: unknown }).items;
    if (Array.isArray(items)) {
      return items.filter((x): x is NavItem => typeof x === "object" && x !== null && "id" in x);
    }
  }
  return [];
}

export function serializeNavigationItems(items: NavItem[]): { items: NavItem[] } {
  return { items };
}

export function parseFooterBlocks(raw: unknown): FooterBlock[] {
  if (!raw) return [];
  let blocks: unknown[] = [];
  if (Array.isArray(raw)) blocks = raw;
  else if (typeof raw === "object" && raw !== null && "blocks" in raw) {
    const b = (raw as { blocks: unknown }).blocks;
    if (Array.isArray(b)) blocks = b;
  }
  const out: FooterBlock[] = [];
  for (const b of blocks) {
    if (!b || typeof b !== "object") continue;
    const o = b as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id : newId();
    if (o.type === "text") {
      out.push({ id, type: "text", body: typeof o.body === "string" ? o.body : "" });
    } else if (o.type === "links") {
      const linksRaw = Array.isArray(o.links) ? o.links : [];
      const links: FooterLink[] = linksRaw
        .filter((l): l is Record<string, unknown> => typeof l === "object" && l !== null)
        .map((l, i) => ({
          id: typeof l.id === "string" ? l.id : `link-${i}`,
          label: typeof l.label === "string" ? l.label : "Link",
          href: typeof l.href === "string" ? l.href : "/",
        }));
      out.push({
        id,
        type: "links",
        title: typeof o.title === "string" ? o.title : "Links",
        links,
      });
    }
  }
  return out;
}

export function serializeFooterBlocks(blocks: FooterBlock[]): { blocks: FooterBlock[] } {
  return { blocks };
}

export const NAV_TARGET_OPTIONS: { value: NavItemTarget["kind"]; label: string }[] = [
  { value: "home", label: "Home" },
  { value: "menu", label: "Menu" },
  { value: "cart", label: "Cart" },
  { value: "about", label: "About" },
  { value: "contact", label: "Contact" },
  { value: "catering", label: "Catering" },
  { value: "faq", label: "FAQ" },
  { value: "policies_privacy", label: "Privacy policy" },
  { value: "policies_terms", label: "Terms" },
  { value: "page", label: "Custom page" },
  { value: "external", label: "External URL" },
];

export function defaultNavItem(): NavItem {
  return {
    id: newId(),
    label: "New link",
    target: { kind: "menu" },
    published: true,
  };
}

export function defaultNavChildItem(slug: string, title: string): NavItem {
  return {
    id: newId(),
    label: title,
    target: { kind: "page", slug },
    published: true,
  };
}

/** Append nav links for published custom pages not already linked. */
export function appendPublishedPagesToNav(items: NavItem[], pages: { slug: string; title: string }[]): NavItem[] {
  const linkedSlugs = new Set<string>();
  for (const item of items) {
    if (item.target.kind === "page") linkedSlugs.add(item.target.slug);
    for (const ch of item.children ?? []) {
      if (ch.target.kind === "page") linkedSlugs.add(ch.target.slug);
    }
  }
  const additions = pages
    .filter((p) => !linkedSlugs.has(p.slug))
    .map((p) => ({
      id: newId(),
      label: p.title,
      target: { kind: "page" as const, slug: p.slug },
      published: true,
    }));
  return [...items, ...additions];
}

export function defaultFooterLinksBlock(): FooterBlock {
  return {
    id: newId(),
    type: "links",
    title: "Explore",
    links: [{ id: newId(), label: "Menu", href: "/menu" }],
  };
}
