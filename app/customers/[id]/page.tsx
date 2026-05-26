import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CaseStudyDetail } from '@/components/marketing/case-study-detail';
import { CASE_STUDY_IDS, caseStudyById } from '@/lib/marketing/case-studies';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return CASE_STUDY_IDS.map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const study = caseStudyById(id);
  if (!study) return { title: 'Customer story | KitchenOS' };

  return marketingPageMetadata({
    title: `${study.title} | KitchenOS Customer Story`,
    description: study.summary,
    path: `/customers/${id}`,
  });
}

export default async function CustomerStoryPage({ params }: PageProps) {
  const { id } = await params;
  const study = caseStudyById(id);
  if (!study) notFound();
  return <CaseStudyDetail study={study} />;
}
