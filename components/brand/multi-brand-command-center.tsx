import Link from 'next/link';
import { TrendingDown, TrendingUp } from 'lucide-react';

export interface BrandOverview {
  brandId: string;
  brandName: string;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  activeProducts: number;
  thisMonthOrders: number;
  thisMonthRevenue: number;
}

export function MultiBrandCommandCenter({ brands }: { brands: BrandOverview[] }) {
  const totalRevenue = brands.reduce((s, b) => s + b.totalRevenue, 0);
  const totalOrders = brands.reduce((s, b) => s + b.totalOrders, 0);

  if (brands.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-medium mb-2">No brands yet</p>
        <p className="text-sm">Create brands under Settings → Brands to see cross-brand analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Revenue</p>
          <p className="text-2xl font-bold mt-1">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Orders</p>
          <p className="text-2xl font-bold mt-1">{totalOrders}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Brands</p>
          <p className="text-2xl font-bold mt-1">{brands.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Order</p>
          <p className="text-2xl font-bold mt-1">
            ${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {brands.map((brand) => (
          <div
            key={brand.brandId}
            className="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">{brand.brandName}</h3>
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  brand.thisMonthRevenue > 0
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {brand.thisMonthRevenue > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {brand.thisMonthOrders > 0 ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-xl font-bold">${brand.totalRevenue.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Orders</p>
                <p className="text-xl font-bold">{brand.totalOrders}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">This Month</p>
                <p className="text-lg font-semibold">${brand.thisMonthRevenue.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Products</p>
                <p className="text-lg font-semibold">{brand.activeProducts}</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
              <span>Avg order: ${brand.avgOrderValue.toFixed(2)}</span>
              <Link href={`/dashboard/brands/${brand.brandId}`} className="text-primary hover:underline">
                View brand →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
