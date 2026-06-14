import {
  buildSalesByStaffDemoReport,
  buildSalesByStaffReport,
  buildShiftAvgCheckRows,
  buildStaffSalesRows,
  type SalesByStaffReport,
} from "@/lib/analytics/sales-by-staff-p2-112-operations";
import { SALES_BY_STAFF_P2_112_POLICY_ID } from "@/lib/analytics/sales-by-staff-p2-112-policy";
import { prisma } from "@/lib/prisma";

export type SalesByStaffSnapshot = SalesByStaffReport & {
  mode: "live" | "demo";
  analyzedAt: string;
};

export async function loadSalesByStaffSnapshot(userId: string): Promise<SalesByStaffSnapshot> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 14);

    const transactions = await prisma.pOSTransaction.findMany({
      where: {
        userId,
        status: "COMPLETED",
        staffId: { not: null },
        createdAt: { gte: since },
      },
      include: {
        staff: { select: { id: true, name: true } },
      },
      take: 500,
    });

    if (transactions.length > 0) {
      const byStaff = new Map<
        string,
        { staffName: string; orderCount: number; totalSales: number; shiftIds: Set<string> }
      >();
      const byShift = new Map<
        string,
        { staffId: string; staffName: string; orderCount: number; totalSales: number }
      >();

      for (const tx of transactions) {
        if (!tx.staffId || !tx.staff) continue;
        const total = Number(tx.total);

        const staff = byStaff.get(tx.staffId) ?? {
          staffName: tx.staff.name,
          orderCount: 0,
          totalSales: 0,
          shiftIds: new Set<string>(),
        };
        staff.orderCount += 1;
        staff.totalSales += total;
        if (tx.shiftId) staff.shiftIds.add(tx.shiftId);
        byStaff.set(tx.staffId, staff);

        if (tx.shiftId) {
          const shift = byShift.get(tx.shiftId) ?? {
            staffId: tx.staffId,
            staffName: tx.staff.name,
            orderCount: 0,
            totalSales: 0,
          };
          shift.orderCount += 1;
          shift.totalSales += total;
          byShift.set(tx.shiftId, shift);
        }
      }

      const staffRows = buildStaffSalesRows(
        [...byStaff.entries()].map(([staffId, data]) => ({
          staffId,
          staffName: data.staffName,
          orderCount: data.orderCount,
          totalSales: data.totalSales,
          shiftIds: data.shiftIds,
        })),
      );

      const shiftRows = buildShiftAvgCheckRows(
        [...byShift.entries()].map(([shiftId, data]) => ({
          shiftId,
          ...data,
        })),
      );

      const report = buildSalesByStaffReport({ staffRows, shiftRows });

      return {
        ...report,
        policyId: SALES_BY_STAFF_P2_112_POLICY_ID,
        mode: "live",
        analyzedAt: new Date().toISOString(),
      };
    }
  } catch {
    // Fall through to demo fixture
  }

  const report = buildSalesByStaffDemoReport();

  return {
    ...report,
    policyId: SALES_BY_STAFF_P2_112_POLICY_ID,
    mode: "demo",
    analyzedAt: new Date().toISOString(),
  };
}
