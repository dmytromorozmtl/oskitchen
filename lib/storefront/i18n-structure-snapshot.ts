import { isStorefrontLocaleCode } from "@/lib/storefront/locale-path";
/**
 * Structural i18n snapshots — compare nav/section shapes across locales without comparing copy.
 */

export type I18nNavStructureNode = {
  kind: "link" | "dropdown";
  hrefPattern: string;
  childCount: number;
  children: I18nNavStructureNode[];
};

export type I18nSectionStructureNode = {
  type: string;
  fieldKeys: string[];
  localeKeys: string[];
};

export type StorefrontI18nStructureSnapshot = {
  nav: I18nNavStructureNode[];
  sections: I18nSectionStructureNode[];
};

function hrefPattern(href: unknown): string {
  if (typeof href !== "string") return "";
  const parts = href.split("/").filter(Boolean);
  const normalized = parts.filter((seg) => !isStorefrontLocaleCode(seg));
  const path = `/${normalized.join("/")}`;
  return path
    .replace(/\/s\/[^/]+/g, "/s/:slug")
    .replace(/\/p\/[^/?#]+/g, "/p/:page")
    .replace(/\/products\/[^/?#]+/g, "/products/:product")
    .replace(/\/collections\/[^/?#]+/g, "/collections/:collection");
}

function navNodeFromItem(item: Record<string, unknown>): I18nNavStructureNode {
  const childrenRaw = Array.isArray(item.children) ? item.children : [];
  const children = childrenRaw
    .filter((c): c is Record<string, unknown> => Boolean(c && typeof c === "object"))
    .map((c) => navNodeFromItem(c));
  const hasChildren = children.length > 0;
  return {
    kind: hasChildren ? "dropdown" : "link",
    hrefPattern: hrefPattern(item.href ?? item.url),
    childCount: children.length,
    children,
  };
}

export function snapshotNavigationStructure(itemsJson: unknown): I18nNavStructureNode[] {
  const items = Array.isArray(itemsJson)
    ? itemsJson
    : itemsJson && typeof itemsJson === "object" && Array.isArray((itemsJson as { items?: unknown }).items)
      ? (itemsJson as { items: unknown[] }).items
      : [];
  return items
    .filter((i): i is Record<string, unknown> => Boolean(i && typeof i === "object"))
    .map((i) => navNodeFromItem(i));
}

function localizedPayloadKeys(raw: unknown): string[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  const o = raw as Record<string, unknown>;
  if (o._localized === true && o.byLocale && typeof o.byLocale === "object") {
    return Object.keys(o.byLocale as Record<string, unknown>).sort();
  }
  return ["__flat__"];
}

function fieldKeysFromContent(raw: unknown): string[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  const o = raw as Record<string, unknown>;
  if (o._localized === true && o.byLocale && typeof o.byLocale === "object") {
    const first = Object.values(o.byLocale as Record<string, unknown>)[0];
    if (first && typeof first === "object" && !Array.isArray(first)) {
      return Object.keys(first as Record<string, unknown>).sort();
    }
    return [];
  }
  return Object.keys(o).filter((k) => !k.startsWith("_")).sort();
}

export function snapshotSectionsStructure(
  sections: { type: string; contentJson: unknown }[],
): I18nSectionStructureNode[] {
  return sections.map((s) => ({
    type: s.type,
    fieldKeys: fieldKeysFromContent(s.contentJson),
    localeKeys: localizedPayloadKeys(s.contentJson),
  }));
}

export function buildStorefrontI18nStructureSnapshot(input: {
  navigationItemsJson: unknown;
  sections: { type: string; contentJson: unknown }[];
}): StorefrontI18nStructureSnapshot {
  return {
    nav: snapshotNavigationStructure(input.navigationItemsJson),
    sections: snapshotSectionsStructure(input.sections),
  };
}

/** Returns paths that differ between EN and FR structural trees. */
export function diffI18nStructurePaths(
  en: StorefrontI18nStructureSnapshot,
  fr: StorefrontI18nStructureSnapshot,
): string[] {
  const mismatches: string[] = [];
  const enNav = JSON.stringify(en.nav);
  const frNav = JSON.stringify(fr.nav);
  if (enNav !== frNav) mismatches.push("nav");

  const max = Math.max(en.sections.length, fr.sections.length);
  for (let i = 0; i < max; i++) {
    const a = en.sections[i];
    const b = fr.sections[i];
    if (!a || !b) {
      mismatches.push(`sections[${i}].missing`);
      continue;
    }
    if (a.type !== b.type) mismatches.push(`sections[${i}].type`);
    if (JSON.stringify(a.fieldKeys) !== JSON.stringify(b.fieldKeys)) {
      mismatches.push(`sections[${i}].fieldKeys`);
    }
    if (JSON.stringify(a.localeKeys) !== JSON.stringify(b.localeKeys)) {
      mismatches.push(`sections[${i}].localeKeys`);
    }
  }
  return mismatches;
}
