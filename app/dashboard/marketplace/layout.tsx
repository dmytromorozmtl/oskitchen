import { MarketplaceSubnav } from "@/components/dashboard/marketplace-subnav";
import { requireMarketplaceReadPage } from "@/lib/marketplace/marketplace-page-access";

export default async function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const access = await requireMarketplaceReadPage({
    operation: "marketplace.hub.layout",
    route: "/dashboard/marketplace",
  });

  if (!access.ok) {
    return <div className="space-y-8">{access.deny}</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <MarketplaceSubnav />
      {children}
    </div>
  );
}
