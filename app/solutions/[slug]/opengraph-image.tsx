import { createOgImageResponse } from '@/lib/seo/og-image-generator';
import { parseSolutionPageSlug } from '@/lib/demo-verticals';
import { SOLUTION_SEO } from '@/lib/marketing/solution-seo';

export const alt = 'OS Kitchen Solution';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function SolutionOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: raw } = await params;
  const slug = parseSolutionPageSlug(raw);
  const seo = slug ? SOLUTION_SEO[slug] : undefined;
  const title = seo?.breadcrumbLabel ?? 'OS Kitchen';
  const subtitle = seo?.metaDescription?.slice(0, 120) ?? '14-day free trial · No hardware lock-in';

  return createOgImageResponse({
    eyebrow: `OS Kitchen · ${title}`,
    title: seo?.metaTitle?.split('|')[0]?.trim() ?? title,
    subtitle,
  });
}
