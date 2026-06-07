import type { Metadata } from "next";

import { IntegrationHealthCenterProductPage } from "@/components/product/integration-health-center-product-page";
import { APP_NAME, SITE_URL } from "@/lib/constants";
import {
  INTEGRATION_HEALTH_CENTER_PRODUCT_DESCRIPTION,
  INTEGRATION_HEALTH_CENTER_PRODUCT_HEADLINE,
} from "@/lib/integrations/integration-health-center-product-content";
import { INTEGRATION_HEALTH_CENTER_PRODUCT_ROUTE } from "@/lib/integrations/integration-health-center-product-absolute-final-policy";
import { INTEGRATION_HEALTH_CENTER_MARKETING_ROUTE } from "@/lib/marketing/integration-health-center-marketing-absolute-final-policy";

/** Standalone marketing: {INTEGRATION_HEALTH_CENTER_MARKETING_ROUTE} */

export const metadata: Metadata = {
  title: `Integration Health Center — ${APP_NAME}`,
  description: `${INTEGRATION_HEALTH_CENTER_PRODUCT_HEADLINE}. ${INTEGRATION_HEALTH_CENTER_PRODUCT_DESCRIPTION}`,
  alternates: { canonical: `${SITE_URL}${INTEGRATION_HEALTH_CENTER_PRODUCT_ROUTE}` },
  openGraph: {
    title: `Integration Health Center — ${APP_NAME}`,
    description: INTEGRATION_HEALTH_CENTER_PRODUCT_DESCRIPTION,
    url: `${SITE_URL}${INTEGRATION_HEALTH_CENTER_PRODUCT_ROUTE}`,
    siteName: APP_NAME,
    type: "website",
  },
};

export default function Page() {
  return <IntegrationHealthCenterProductPage />;
}
