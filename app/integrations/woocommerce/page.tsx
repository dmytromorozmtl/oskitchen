import { IntegrationMarketingPage } from "@/components/marketing/public-page";
import { integrationPageMetadata } from "@/lib/marketing/integration-seo";
import { integrationPages } from "@/lib/public-copy";

export const metadata = integrationPageMetadata("woocommerce");

export default function WooCommerceMarketingPage() {
  return <IntegrationMarketingPage page={integrationPages.woocommerce} />;
}
