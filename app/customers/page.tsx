import type { Metadata } from 'next';

import { CaseStudiesPage } from '@/components/marketing/case-studies-page';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

export const metadata: Metadata = marketingPageMetadata({
  title: 'Customer Stories — How Operators Use KitchenOS',
  description:
    'Operator playbooks from meal prep, restaurant, and ghost kitchen pilots. Honest outcomes and workflows — start your 14-day trial.',
  path: '/customers',
  keywords: ['kitchen software case study', 'meal prep software results', 'restaurant POS customer story'],
});

export default function CustomersPage() {
  return <CaseStudiesPage />;
}
