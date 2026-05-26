import { z } from "zod";

import { assertSafeHttpsUrl } from "@/lib/storefront-builder/safe-content";
import { isUnsafeHref } from "@/lib/storefront/link-normalization";

const footerLinkSchema = z.object({
  label: z.string().min(1).max(200),
  href: z.string().min(1).max(2000),
  labels: z.record(z.string().min(1).max(8), z.string().max(200)).optional(),
  external: z.boolean().optional(),
  disabled: z.boolean().optional(),
});

const linksBlock = z.object({
  type: z.literal("links"),
  title: z.string().max(120).optional(),
  links: z.array(footerLinkSchema).max(30),
  hidden: z.boolean().optional(),
  disabled: z.boolean().optional(),
});

const textBlock = z.object({
  type: z.literal("text"),
  body: z.string().max(4000).optional(),
  hidden: z.boolean().optional(),
  disabled: z.boolean().optional(),
});

const footerBlockSchema = z.discriminatedUnion("type", [linksBlock, textBlock]);

const footerFileSchema = z.object({
  blocks: z.array(footerBlockSchema).max(20),
});

export type ValidatedFooterLink = {
  label: string;
  href: string;
  external: boolean;
  newTab: boolean;
};

export type ValidatedFooterLinksBlock = {
  type: "links";
  title?: string;
  links: ValidatedFooterLink[];
};

export type ValidatedFooterTextBlock = {
  type: "text";
  body?: string;
};

export type ValidatedFooterBlock = ValidatedFooterLinksBlock | ValidatedFooterTextBlock;

function safeHref(href: string, allowRelative: boolean): { ok: true; href: string; external: boolean } | { ok: false } {
  const h = href.trim();
  if (!h || isUnsafeHref(h)) return { ok: false };
  if (h.startsWith("http://") || h.startsWith("https://")) {
    const ext = assertSafeHttpsUrl(h, { allowHttpLocal: process.env.NODE_ENV !== "production" });
    if (!ext.ok) return { ok: false };
    return { ok: true, href: ext.url, external: true };
  }
  if (allowRelative && h.startsWith("/") && !h.startsWith("//")) {
    return { ok: true, href: h, external: false };
  }
  return { ok: false };
}

function pickLinkLabel(link: z.infer<typeof footerLinkSchema>, locale: string): string {
  const loc = locale.split("-")[0]?.toLowerCase() ?? "en";
  const labels = link.labels;
  if (labels) {
    const exact = labels[locale]?.trim();
    if (exact) return exact;
    const short = labels[loc]?.trim();
    if (short) return short;
    const en = labels.en?.trim();
    if (en) return en;
  }
  return link.label.trim();
}

export function parseStorefrontFooterBlocks(
  raw: unknown,
  storeSlug: string,
  opts: { locale?: string; includeDisabled?: boolean },
): ValidatedFooterBlock[] {
  const locale = opts.locale ?? "en";
  const includeDisabled = Boolean(opts.includeDisabled);
  const base = `/s/${storeSlug}`;
  const parsed = z.union([footerFileSchema, z.array(footerBlockSchema)]).safeParse(raw);
  if (!parsed.success) return [];
  const blocks = Array.isArray(parsed.data) ? parsed.data : parsed.data.blocks;
  const out: ValidatedFooterBlock[] = [];

  for (const block of blocks) {
    if (block.hidden && !includeDisabled) continue;
    if (block.disabled && !includeDisabled) continue;
    if (block.type === "text") {
      out.push({ type: "text", body: block.body?.trim() || undefined });
      continue;
    }
    const links: ValidatedFooterLink[] = [];
    for (const l of block.links) {
      if (l.disabled && !includeDisabled) continue;
      if (l.external) {
        const ext = safeHref(l.href, false);
        if (!ext.ok) continue;
        links.push({
          label: pickLinkLabel(l, locale),
          href: ext.href,
          external: true,
          newTab: true,
        });
        continue;
      }
      const raw = l.href.trim();
      if (!raw || isUnsafeHref(raw)) continue;
      let path: string;
      if (raw.startsWith(`/s/${storeSlug}`)) {
        path = raw;
      } else if (raw.startsWith("/") && !raw.startsWith("//")) {
        path = `${base}${raw}`;
      } else {
        path = `${base}/${raw.replace(/^\/+/, "")}`;
      }
      if (!path.startsWith(base)) continue;
      links.push({
        label: pickLinkLabel(l, locale),
        href: path,
        external: false,
        newTab: false,
      });
    }
    out.push({ type: "links", title: block.title?.trim() || undefined, links });
  }
  return out;
}
