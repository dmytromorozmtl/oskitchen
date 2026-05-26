import type { Metadata } from "next";

/** Google Search Console HTML tag verification — set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in Vercel. */
export function googleSiteVerificationMetadata(): Pick<Metadata, "verification"> | Record<string, never> {
  const token = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
  if (!token) return {};
  return {
    verification: {
      google: token,
    },
  };
}
