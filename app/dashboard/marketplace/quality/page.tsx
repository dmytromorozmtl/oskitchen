import Link from "next/link";

import { QualityScoringPanel } from "@/components/marketplace/quality-scoring-panel";
import { MarketplaceDataUnavailable } from "@/components/marketplace/marketplace-data-unavailable";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { requireMarketplaceReadPage } from "@/lib/marketplace/marketplace-page-access";
import { isPrismaMigrationMissingError } from "@/lib/prisma-migration-missing";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadMarketplaceQualityScoringSnapshot } from "@/services/marketplace/quality-scoring";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

export const metadata = {
  title: "Marketplace Quality Scoring",
  description: "Supplier quality ratings, tier rankings, and delivery review prompts for HoReCa procurement.",
};

export default function MarketplaceQualityScoringPage() {
  return (
    <SuspenseWave1PageBoundary sector="marketplace">
      <MarketplaceQualityScoringPageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function MarketplaceQualityScoringPageAsync() {
  const access = await requireMarketplaceReadPage({
    operation: "marketplace.quality_scoring.read",
    route: "/dashboard/marketplace/quality",
  });
  if (!access.ok) return access.deny;

  const { workspaceId } = await getTenantActor();
  if (!workspaceId) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Open a workspace to view supplier quality scores.
      </div>
    );
  }

  let snapshot;
  try {
    snapshot = await loadMarketplaceQualityScoringSnapshot(workspaceId);
  } catch (error) {
    console.error("[quality-scoring] load failed", error);
    if (isPrismaMigrationMissingError(error)) {
      return <MarketplaceDataUnavailable />;
    }
    throw error;
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Quality Scoring"
        description="Supplier ratings across quality, accuracy, delivery, and packaging — tier rankings and alerts for your procurement team."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/dashboard/marketplace/vendors">My vendors</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/dashboard/marketplace">Marketplace</Link>
            </Button>
          </div>
        }
      />
      <QualityScoringPanel snapshot={snapshot} />
    </div>
  );
}
