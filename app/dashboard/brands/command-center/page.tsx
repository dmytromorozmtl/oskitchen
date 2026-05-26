import { getTenantActor } from '@/lib/scope/cached-tenant';
import { getBrandsOverview } from '@/services/brand/brand-analytics';
import { MultiBrandCommandCenter } from '@/components/brand/multi-brand-command-center';

export const dynamic = 'force-dynamic';

export default async function BrandCommandCenterPage() {
  const { userId } = await getTenantActor();
  const brands = await getBrandsOverview(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Brand Command Center</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cross-brand analytics across all your virtual brands.
        </p>
      </div>
      <MultiBrandCommandCenter brands={brands} />
    </div>
  );
}
