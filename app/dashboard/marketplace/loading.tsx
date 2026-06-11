import { MarketplaceSkeleton } from "@/components/dashboard/marketplace-skeleton";
import { PageShell } from "@/components/layout/page-shell";

export default function Loading() {
  return (
    <PageShell>
      <MarketplaceSkeleton />
    </PageShell>
  );
}
