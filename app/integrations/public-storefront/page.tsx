import { IntegrationMarketingPage } from "@/components/marketing/public-page";
import { integrationPageMetadata } from "@/lib/marketing/integration-seo";
import { integrationPages } from "@/lib/public-copy";

export const metadata = integrationPageMetadata("public-storefront");

export default function PublicStorefrontPage() {
  return <IntegrationMarketingPage page={integrationPages["public-storefront"]} />;
}
