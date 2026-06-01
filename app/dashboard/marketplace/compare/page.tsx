import { Scale } from "lucide-react";

import { MarketplaceCompareClient } from "@/components/marketplace/marketplace-compare-client";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { parseMarketplaceCompareFilters } from "@/lib/marketplace/compare-filters";
import { requireMarketplaceReadPage } from "@/lib/marketplace/marketplace-page-access";
import { loadMarketplaceCompare } from "@/services/marketplace/marketplace-compare-service";

export default async function MarketplaceComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const access = await requireMarketplaceReadPage({
    operation: "marketplace.compare.read",
    route: "/dashboard/marketplace/compare",
  });
  if (!access.ok) return access.deny;

  const sp = await searchParams;
  const filters = parseMarketplaceCompareFilters(sp);
  const result = await loadMarketplaceCompare(filters);

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Compare prices"
        description="Side-by-side vendor pricing for the same product name or GTIN — sort by price, delivery, rating, or MOQ."
        actions={
          result.total > 0 ? (
            <Badge variant="outline" className="rounded-full">
              {result.total} offers
            </Badge>
          ) : (
            <Badge variant="outline" className="rounded-full gap-1">
              <Scale className="h-3.5 w-3.5" />
              HoReCa sourcing
            </Badge>
          )
        }
      />

      <MarketplaceCompareClient
        filters={filters}
        result={result}
        canAddToCart={access.canCartWrite}
      />
    </div>
  );
}
