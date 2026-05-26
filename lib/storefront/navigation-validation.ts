import { z } from "zod";

import type { NavItemTarget } from "@/lib/storefront-builder/navigation-types";
import { assertSafeHttpsUrl } from "@/lib/storefront-builder/safe-content";
import { isUnsafeHref } from "@/lib/storefront/link-normalization";

const targetSchema: z.ZodType<NavItemTarget> = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("home") }),
  z.object({ kind: z.literal("menu") }),
  z.object({ kind: z.literal("cart") }),
  z.object({ kind: z.literal("about") }),
  z.object({ kind: z.literal("contact") }),
  z.object({ kind: z.literal("catering") }),
  z.object({ kind: z.literal("faq") }),
  z.object({ kind: z.literal("policies_privacy") }),
  z.object({ kind: z.literal("policies_terms") }),
  z.object({ kind: z.literal("page"), slug: z.string().min(1).max(160) }),
  z.object({
    kind: z.literal("external"),
    href: z.string().min(1).max(2000),
    newTab: z.boolean().optional(),
  }),
]);

const navItemLeafSchema = z.object({
  id: z.string().min(1).max(80),
  label: z.string().min(1).max(200),
  labels: z.record(z.string().min(1).max(8), z.string().max(200)).optional(),
  icon: z.string().max(32).optional(),
  target: targetSchema,
  mobile: z.boolean().optional(),
  desktop: z.boolean().optional(),
  published: z.boolean().optional(),
  hidden: z.boolean().optional(),
});

const navItemSchema = navItemLeafSchema.extend({
  children: z.array(navItemLeafSchema).max(12).optional(),
});

const navFileSchema = z.object({
  items: z.array(navItemSchema).max(40),
});

export type ValidatedNavLink = {
  id: string;
  label: string;
  href: string | null;
  external: boolean;
  newTab: boolean;
  icon?: string;
  children?: ValidatedNavLink[];
};

function targetToHref(storeSlug: string, t: NavItemTarget): string | null {
  const base = `/s/${storeSlug}`;
  switch (t.kind) {
    case "home":
      return base;
    case "menu":
      return `${base}/menu`;
    case "cart":
      return `${base}/cart`;
    case "about":
      return `${base}/about`;
    case "contact":
      return `${base}/contact`;
    case "catering":
      return `${base}/catering`;
    case "faq":
      return `${base}/faq`;
    case "policies_privacy":
      return `${base}/policies/privacy`;
    case "policies_terms":
      return `${base}/policies/terms`;
    case "page": {
      const slug = t.slug.trim().replace(/^\/+|\/+$/g, "");
      if (!slug || slug.includes("..")) return null;
      return `${base}/p/${encodeURIComponent(slug)}`;
    }
    case "external": {
      const ext = assertSafeHttpsUrl(t.href, { allowHttpLocal: process.env.NODE_ENV !== "production" });
      if (!ext.ok) return null;
      if (isUnsafeHref(ext.url)) return null;
      return ext.url;
    }
    default:
      return null;
  }
}

function pickLabel(item: z.infer<typeof navItemSchema>, locale: string): string {
  const loc = locale.split("-")[0]?.toLowerCase() ?? "en";
  const labels = item.labels;
  if (labels) {
    const exact = labels[locale]?.trim();
    if (exact) return exact;
    const short = labels[loc]?.trim();
    if (short) return short;
    const en = labels.en?.trim();
    if (en) return en;
  }
  return item.label.trim();
}

export function parseStorefrontNavigationItems(
  raw: unknown,
  storeSlug: string,
  opts: { locale?: string; includeDraftOrHidden?: boolean },
): ValidatedNavLink[] {
  const locale = opts.locale ?? "en";
  const includeHidden = Boolean(opts.includeDraftOrHidden);
  const parsed = z.union([navFileSchema, z.array(navItemSchema)]).safeParse(raw);
  if (!parsed.success) return [];
  const items = Array.isArray(parsed.data) ? parsed.data : parsed.data.items;
  function mapLeaf(item: z.infer<typeof navItemLeafSchema>): ValidatedNavLink | null {
    if (item.hidden && !includeHidden) return null;
    if (item.published === false && !includeHidden) return null;
    const href = targetToHref(storeSlug, item.target);
    if (!href) return null;
    const external = item.target.kind === "external";
    return {
      id: item.id,
      label: pickLabel(item, locale),
      href,
      external,
      newTab: Boolean(item.target.kind === "external" && item.target.newTab),
      icon: item.icon?.trim() || undefined,
    };
  }

  function mapItem(item: z.infer<typeof navItemSchema>): ValidatedNavLink | null {
    if (item.hidden && !includeHidden) return null;
    if (item.published === false && !includeHidden) return null;
    const childrenRaw = item.children ?? [];
    const children: ValidatedNavLink[] = [];
    for (const child of childrenRaw) {
      const mapped = mapLeaf(child);
      if (mapped) children.push(mapped);
    }
    const href = targetToHref(storeSlug, item.target);
    const external = item.target.kind === "external";
    if (!href && children.length === 0) return null;
    return {
      id: item.id,
      label: pickLabel(item, locale),
      href: href ?? (children[0]?.href ?? null),
      external,
      newTab: Boolean(item.target.kind === "external" && item.target.newTab),
      icon: item.icon?.trim() || undefined,
      children: children.length > 0 ? children : undefined,
    };
  }

  const out: ValidatedNavLink[] = [];
  for (const item of items) {
    const mapped = mapItem(item);
    if (mapped) out.push(mapped);
  }
  return out;
}

export function defaultFallbackNav(storeSlug: string): ValidatedNavLink[] {
  const base = `/s/${storeSlug}`;
  return [
    { id: "fb-home", label: "Home", href: base, external: false, newTab: false, icon: "home" },
    { id: "fb-menu", label: "Menu", href: `${base}/menu`, external: false, newTab: false, icon: "menu" },
    { id: "fb-contact", label: "Contact", href: `${base}/contact`, external: false, newTab: false, icon: "contact" },
  ];
}
