import { IntegrationMarketingPage } from "@/components/marketing/public-page";
import { integrationPageMetadata } from "@/lib/marketing/integration-seo";
import { integrationPages } from "@/lib/public-copy";

export const metadata = integrationPageMetadata("manual-orders");

export default function ManualOrdersPage() {
  return <IntegrationMarketingPage page={integrationPages["manual-orders"]} />;
}
