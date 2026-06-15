/**
 * Pure helpers for sales-by-staff analytics (Blueprint P2-112).
 */

import { SALES_BY_STAFF_P2_112_POLICY_ID } from "@/lib/analytics/sales-by-staff-p2-112-policy";

export type StaffSalesRow = {
  staffId: string;
  staffName: string;
  orderCount: number;
  totalSales: number;
  avgCheck: number;
  shiftCount: number;
  rank: number;
};

export type ShiftAvgCheckRow = {
  shiftId: string;
  staffId: string;
  staffName: string;
  orderCount: number;
  totalSales: number;
  avgCheck: number;
};

export type SalesByStaffReport = {
  policyId: typeof SALES_BY_STAFF_P2_112_POLICY_ID;
  staffCount: number;
  totalOrders: number;
  totalSales: number;
  overallAvgCheck: number;
  topServerName: string | null;
  topServerSales: number;
  staffRows: StaffSalesRow[];
  shiftRows: ShiftAvgCheckRow[];
};

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeAvgCheck(totalSales: number, orderCount: number): number {
  if (orderCount === 0) return 0;
  return roundMoney(totalSales / orderCount);
}

export function buildStaffSalesRows(
  rows: ReadonlyArray<{
    staffId: string;
    staffName: string;
    orderCount: number;
    totalSales: number;
    shiftIds: ReadonlySet<string> | string[];
  }>,
): StaffSalesRow[] {
  const sorted = [...rows]
    .map((row) => {
      const shiftCount = row.shiftIds instanceof Set ? row.shiftIds.size : new Set(row.shiftIds).size;
      return {
        staffId: row.staffId,
        staffName: row.staffName,
        orderCount: row.orderCount,
        totalSales: roundMoney(row.totalSales),
        avgCheck: computeAvgCheck(row.totalSales, row.orderCount),
        shiftCount,
        rank: 0,
      };
    })
    .sort((a, b) => b.totalSales - a.totalSales);

  return sorted.map((row, index) => ({ ...row, rank: index + 1 }));
}

export function buildShiftAvgCheckRows(
  rows: ReadonlyArray<{
    shiftId: string;
    staffId: string;
    staffName: string;
    orderCount: number;
    totalSales: number;
  }>,
): ShiftAvgCheckRow[] {
  return rows
    .map((row) => ({
      shiftId: row.shiftId,
      staffId: row.staffId,
      staffName: row.staffName,
      orderCount: row.orderCount,
      totalSales: roundMoney(row.totalSales),
      avgCheck: computeAvgCheck(row.totalSales, row.orderCount),
    }))
    .sort((a, b) => b.avgCheck - a.avgCheck);
}

export function buildSalesByStaffReport(input: {
  staffRows: StaffSalesRow[];
  shiftRows: ShiftAvgCheckRow[];
}): SalesByStaffReport {
  const totalOrders = input.staffRows.reduce((s, r) => s + r.orderCount, 0);
  const totalSales = roundMoney(input.staffRows.reduce((s, r) => s + r.totalSales, 0));
  const top = input.staffRows[0] ?? null;

  return {
    policyId: SALES_BY_STAFF_P2_112_POLICY_ID,
    staffCount: input.staffRows.length,
    totalOrders,
    totalSales,
    overallAvgCheck: computeAvgCheck(totalSales, totalOrders),
    topServerName: top?.staffName ?? null,
    topServerSales: top?.totalSales ?? 0,
    staffRows: input.staffRows,
    shiftRows: input.shiftRows,
  };
}

export const SALES_BY_STAFF_DEMO_TRANSACTIONS = [
  { staffId: "srv-001", staffName: "Alex M.", shiftId: "shift-a", total: 42.5 },
  { staffId: "srv-001", staffName: "Alex M.", shiftId: "shift-a", total: 38.0 },
  { staffId: "srv-001", staffName: "Alex M.", shiftId: "shift-a", total: 55.25 },
  { staffId: "srv-002", staffName: "Jordan K.", shiftId: "shift-b", total: 28.0 },
  { staffId: "srv-002", staffName: "Jordan K.", shiftId: "shift-b", total: 31.5 },
  { staffId: "srv-002", staffName: "Jordan K.", shiftId: "shift-b", total: 44.0 },
  { staffId: "srv-002", staffName: "Jordan K.", shiftId: "shift-b", total: 22.75 },
  { staffId: "srv-003", staffName: "Sam R.", shiftId: "shift-c", total: 67.0 },
  { staffId: "srv-003", staffName: "Sam R.", shiftId: "shift-c", total: 48.5 },
  { staffId: "srv-004", staffName: "Taylor P.", shiftId: "shift-d", total: 19.0 },
  { staffId: "srv-004", staffName: "Taylor P.", shiftId: "shift-d", total: 24.5 },
] as const;

export function aggregateDemoTransactions(): {
  staffRows: StaffSalesRow[];
  shiftRows: ShiftAvgCheckRow[];
} {
  const byStaff = new Map<
    string,
    { staffName: string; orderCount: number; totalSales: number; shiftIds: Set<string> }
  >();
  const byShift = new Map<
    string,
    { staffId: string; staffName: string; orderCount: number; totalSales: number }
  >();

  for (const tx of SALES_BY_STAFF_DEMO_TRANSACTIONS) {
    const staff = byStaff.get(tx.staffId) ?? {
      staffName: tx.staffName,
      orderCount: 0,
      totalSales: 0,
      shiftIds: new Set<string>(),
    };
    staff.orderCount += 1;
    staff.totalSales += tx.total;
    staff.shiftIds.add(tx.shiftId);
    byStaff.set(tx.staffId, staff);

    const shift = byShift.get(tx.shiftId) ?? {
      staffId: tx.staffId,
      staffName: tx.staffName,
      orderCount: 0,
      totalSales: 0,
    };
    shift.orderCount += 1;
    shift.totalSales += tx.total;
    byShift.set(tx.shiftId, shift);
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

  return { staffRows, shiftRows };
}

export function buildSalesByStaffDemoReport(): SalesByStaffReport {
  const { staffRows, shiftRows } = aggregateDemoTransactions();
  return buildSalesByStaffReport({ staffRows, shiftRows });
}
