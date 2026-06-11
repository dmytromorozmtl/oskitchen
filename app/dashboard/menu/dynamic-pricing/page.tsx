import Link from "next/link";

import { DynamicPricingPanel } from "@/components/ai/dynamic-pricing-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadDynamicPricingDashboard } from "@/services/ai/dynamic-pricing-service";

export const metadata = {
  title: "AI Dynamic Pricing",
  description: "Demand-based menu pricing with time, weather, events, and A/B tests.",
};

export const dynamic = "force-dynamic";

export default async function DynamicPricingPage() {
  const { dataUserId } = await getTenantActor();
  const dashboard = await loadDynamicPricingDashboard(dataUserId);

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="AI-powered dynamic pricing"
        description="Adjust list prices from demand signals — time of day, weather proxy, calendar events, and item velocity. Owner approves every apply."
        actions={
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/dashboard/ai/co-pilot">Co-Pilot</Link>
          </Button>
        }
      />
      <DynamicPricingPanel initial={dashboard} />
    </div>
  );
}
