import { capitalPartnerSchema } from "@/lib/commercial/capital-partners-schema";
import type { z } from "zod";

type CapitalPartner = z.infer<typeof capitalPartnerSchema>;

/** Client-safe outbound href — no fs / config load. */
export function resolveCapitalPartnerOutboundHref(
  partner: Pick<CapitalPartner, "slug" | "internal" | "href">,
): string {
  if (partner.internal) return partner.href;
  return `/api/capital/partner-outbound?slug=${encodeURIComponent(partner.slug)}`;
}

export function resolveCapitalPartnerOutboundHrefBySlug(
  slug: string,
  partners: CapitalPartner[],
): string | null {
  const partner = partners.find((p) => p.slug === slug);
  if (!partner) return null;
  return resolveCapitalPartnerOutboundHref(partner);
}
