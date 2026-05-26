import { IntegrationMarketingPage } from "@/components/marketing/public-page";
import { integrationPageMetadata } from "@/lib/marketing/integration-seo";
import { integrationPages } from "@/lib/public-copy";

export const metadata = integrationPageMetadata("uber-eats");

export default function UberEatsMarketingPage() {
  return <IntegrationMarketingPage page={integrationPages["uber-eats"]} />;
}
