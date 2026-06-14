import { prisma } from '@/lib/prisma';
import { orderListWhereForOwnerAnd } from '@/lib/scope/workspace-resource-scope';
import { filterRecordsWithId } from '@/lib/safety/null-reference-guards';

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

export async function getBrandsOverview(userId: string): Promise<BrandOverview[]> {
  const brands = await prisma.brand.findMany({
    where: { workspace: { ownerUserId: userId } },
    select: { id: true, name: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  if (brands.length === 0) {
    return [];
  }

  const validBrands = filterRecordsWithId(brands);
  if (validBrands.length === 0) {
    return [];
  }

  const brandIds = validBrands.map((brand) => brand.id);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [allOrderWhere, monthOrderWhere] = await Promise.all([
    orderListWhereForOwnerAnd(userId, {
      brandId: { in: brandIds },
      status: { not: 'CANCELLED' },
    }),
    orderListWhereForOwnerAnd(userId, {
      brandId: { in: brandIds },
      createdAt: { gte: monthStart },
      status: { not: 'CANCELLED' },
    }),
  ]);

  const [productCounts, allTimeStats, monthStats] = await Promise.all([
    prisma.product.groupBy({
      by: ['brandId'],
      where: { brandId: { in: brandIds } },
      _count: { id: true },
    }),
    prisma.order.groupBy({
      by: ['brandId'],
      where: allOrderWhere,
      _count: { id: true },
      _sum: { total: true },
    }),
    prisma.order.groupBy({
      by: ['brandId'],
      where: monthOrderWhere,
      _count: { id: true },
      _sum: { total: true },
    }),
  ]);

  const productsByBrand = new Map(
    productCounts.map((row) => [row.brandId, row._count.id]),
  );
  const allTimeByBrand = new Map(
    allTimeStats.map((row) => [
      row.brandId,
      { orders: row._count.id, revenue: Number(row._sum.total ?? 0) },
    ]),
  );
  const monthByBrand = new Map(
    monthStats.map((row) => [
      row.brandId,
      { orders: row._count.id, revenue: Number(row._sum.total ?? 0) },
    ]),
  );

  return validBrands.map((brand) => {
    const allTime = allTimeByBrand.get(brand.id) ?? { orders: 0, revenue: 0 };
    const month = monthByBrand.get(brand.id) ?? { orders: 0, revenue: 0 };
    const totalOrders = allTime.orders;
    const totalRevenue = allTime.revenue;

    return {
      brandId: brand.id,
      brandName: brand.name,
      totalOrders,
      totalRevenue,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      activeProducts: productsByBrand.get(brand.id) ?? 0,
      thisMonthOrders: month.orders,
      thisMonthRevenue: month.revenue,
    };
  });
}
