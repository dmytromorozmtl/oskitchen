import { prisma } from '@/lib/prisma';
import { orderListWhereForOwnerAnd } from '@/lib/scope/workspace-resource-scope';

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

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const overviews = await Promise.all(
    brands.map(async (brand) => {
      const [allOrderWhere, monthOrderWhere] = await Promise.all([
        orderListWhereForOwnerAnd(userId, { brandId: brand.id, status: { not: 'CANCELLED' } }),
        orderListWhereForOwnerAnd(userId, {
          brandId: brand.id,
          createdAt: { gte: monthStart },
          status: { not: 'CANCELLED' },
        }),
      ]);
      const [allOrders, monthOrders, productCount] = await Promise.all([
        prisma.order.aggregate({
          where: allOrderWhere,
          _count: { id: true },
          _sum: { total: true },
        }),
        prisma.order.aggregate({
          where: monthOrderWhere,
          _count: { id: true },
          _sum: { total: true },
        }),
        prisma.product.count({ where: { brandId: brand.id } }),
      ]);

      const totalOrders = allOrders._count.id;
      const totalRevenue = Number(allOrders._sum.total ?? 0);
      const thisMonthRevenue = Number(monthOrders._sum.total ?? 0);

      return {
        brandId: brand.id,
        brandName: brand.name,
        totalOrders,
        totalRevenue,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        activeProducts: productCount,
        thisMonthOrders: monthOrders._count.id,
        thisMonthRevenue,
      };
    }),
  );

  return overviews;
}
