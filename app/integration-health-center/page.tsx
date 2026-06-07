import type { Metadata } from 'next';

import { IntegrationHealthCenterMarketingLanding } from '@/components/marketing/integration-health-center-marketing-landing';
import {
  INTEGRATION_HEALTH_CENTER_MARKETING_META,
  INTEGRATION_HEALTH_CENTER_MARKETING_PATH,
} from '@/lib/marketing/integration-health-center-marketing-content';
import { INTEGRATION_HEALTH_CENTER_PRODUCT_ROUTE } from '@/lib/marketing/integration-health-center-marketing-absolute-final-policy';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

/** Product deep-dive: /product/integration-health-center */

export const metadata: Metadata = marketingPageMetadata({
  title: INTEGRATION_HEALTH_CENTER_MARKETING_META.title,
  description: INTEGRATION_HEALTH_CENTER_MARKETING_META.description,
  path: INTEGRATION_HEALTH_CENTER_MARKETING_PATH,
  keywords: [...INTEGRATION_HEALTH_CENTER_MARKETING_META.keywords],
});

export default function IntegrationHealthCenterMarketingPage() {
  return <IntegrationHealthCenterMarketingLanding />;
}
