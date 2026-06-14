import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { MarketplaceProductDetailClient } from "@/components/marketplace/marketplace-product-detail-client";
import { Button } from "@/components/ui/button";
import { resolveMarketplaceHubAccess } from "@/lib/marketplace/marketplace-page-access";
import { loadMarketplaceProductDetail } from "@/services/marketplace/marketplace-product-detail-service";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

type MarketplaceProductDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function MarketplaceProductDetailPage(props: MarketplaceProductDetailPageProps) {
  return (
    <SuspenseWave1PageBoundary sector="marketplace">
      <MarketplaceProductDetailPageAsync {...props} />
    </SuspenseWave1PageBoundary>
  );
}

async function MarketplaceProductDetailPageAsync({
  params,
  searchParams,
}: MarketplaceProductDetailPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const [access, product] = await Promise.all([
    resolveMarketplaceHubAccess(),
    loadMarketplaceProductDetail(decodeURIComponent(slug)),
  ]);

  if (!product) notFound();

  const initialQuantity = Number(typeof sp.qty === "string" ? sp.qty : "");
  const autoAdd = sp.add === "1" || sp.add === "true";

  return (
    <div className="space-y-6 pb-10">
      <Button asChild variant="outline" size="sm" className="rounded-full gap-2">
        <Link href="/dashboard/marketplace/catalog">
          <ArrowLeft className="h-4 w-4" />
          Back to catalog
        </Link>
      </Button>

      <MarketplaceProductDetailClient
        product={product}
        canAddToCart={access.canCartWrite}
        initialQuantity={Number.isFinite(initialQuantity) ? initialQuantity : undefined}
        autoAdd={autoAdd}
      />
    </div>
  );
}
