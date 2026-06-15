import { IntegrationMarketingPage } from "@/components/marketing/public-page";
import { integrationPageMetadata } from "@/lib/marketing/integration-seo";
import { integrationPages } from "@/lib/public-copy";

export const metadata = integrationPageMetadata("shopify");

export default function ShopifyMarketingPage() {
  return <IntegrationMarketingPage page={integrationPages.shopify} />;
}
