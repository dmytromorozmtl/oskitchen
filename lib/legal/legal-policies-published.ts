import type { Metadata } from "next";

/**
 * Production guard for `/legal/privacy` and `/legal/terms`.
 *
 * - Default (unset / not "true"): treat pages as **draft** — `noindex` metadata and visible draft UI.
 * - Set `LEGAL_POLICIES_PUBLISHED=true` only after counsel-approved copy is deployed.
 *
 * Server-only env (not `NEXT_PUBLIC_*`) so marketing crawlers follow SSR metadata.
 */
export function areLegalPoliciesPublished(): boolean {
  const v = process.env.LEGAL_POLICIES_PUBLISHED?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

export function legalPolicyPageMetadata(opts: {
  slug: "privacy" | "terms";
  appName: string;
}): Metadata {
  const published = areLegalPoliciesPublished();
  const baseTitle = opts.slug === "privacy" ? "Privacy policy" : "Terms of service";
  const title = published ? baseTitle : `${baseTitle} (draft)`;
  const description =
    opts.slug === "privacy"
      ? published
        ? `How ${opts.appName} handles personal and operational data.`
        : `Draft privacy template for ${opts.appName} — requires counsel review before production reliance.`
      : published
        ? `Terms of service for using ${opts.appName}.`
        : `Draft terms template for ${opts.appName} — requires counsel review before production reliance.`;

  return {
    title,
    description,
    alternates: { canonical: `/legal/${opts.slug}` },
    robots: published ? { index: true, follow: true } : { index: false, follow: false },
  };
}
