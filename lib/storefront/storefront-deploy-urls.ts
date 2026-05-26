/**
 * Vercel deployment hosts — override when defaults are stale (DEPLOYMENT_NOT_FOUND).
 *
 *   STOREFRONT_KNOWN_PRODUCTION_URL=https://your-app.vercel.app npm run storefront:apply-deploy-urls
 */
const DEFAULT_PRODUCTION = "https://xn---production-xijza32a.vercel.app";
const DEFAULT_STAGING = "https://xn---preview--staging-r4nxb5ja9d6q.vercel.app";

export const STOREFRONT_DEPLOY_URLS = {
  staging: process.env.STOREFRONT_KNOWN_STAGING_URL?.trim() || DEFAULT_STAGING,
  production: process.env.STOREFRONT_KNOWN_PRODUCTION_URL?.trim() || DEFAULT_PRODUCTION,
  pilotSlug: process.env.STOREFRONT_PILOT_SLUG?.trim() || "hello",
  /** True when still using baked-in defaults — run `npm run storefront:diagnose-deploy` */
  usesDefaultHosts:
    !process.env.STOREFRONT_KNOWN_STAGING_URL?.trim() &&
    !process.env.STOREFRONT_KNOWN_PRODUCTION_URL?.trim(),
} as const;

export function storefrontPublicBase(origin: string, slug: string): string {
  return `${origin.replace(/\/$/, "")}/s/${slug}`;
}
