import { IntegrationMarketingPage } from "@/components/marketing/public-page";
import { integrationPageMetadata } from "@/lib/marketing/integration-seo";
import { integrationPages } from "@/lib/public-copy";

export const metadata = integrationPageMetadata("uber-direct");

export default function UberDirectMarketingPage() {
  return <IntegrationMarketingPage page={integrationPages["uber-direct"]} />;
}
