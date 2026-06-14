import { prisma } from "@/lib/prisma";
import {
  pnlLineBudgetAmount,
  resolveNativeBudgetSettings,
} from "@/lib/finance/native-budgeting-builders";
import { timeEntryListWhereForOwner } from "@/lib/scope/workspace-accounting-scope";
import {
  costSnapshotListWhereForOwner,
  laborRateListWhereForOwner,
  orderListWhereForOwnerAnd,
  staffShiftListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

export type PnlPeriod = "today" | "week" | "month" | "quarter" | "year";

export type PnlLine = {
  key: string;
  label: string;
  actual: number;
  budget: number;
  variance: number;
  isSubtotal?: boolean;
};

function periodStart(period: PnlPeriod): Date {
  const now = new Date();
  if (period === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (period === "week") {
    const since = new Date(now);
    since.setDate(since.getDate() - 7);
    return since;
  }
  if (period === "quarter") {
    const q = Math.floor(now.getMonth() / 3);
    return new Date(now.getFullYear(), q * 3, 1);
  }
  if (period === "year") {
    return new Date(now.getFullYear(), 0, 1);
  }
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

const BUDGET_PCTS = {
  foodCost: 0.3,
  labor: 0.3,
  occupancy: 0.08,
  supplies: 0.04,
  repairs: 0.02,
  marketing: 0.05,
  admin: 0.06,
};

export async function getRestaurantPnL(userId: string, period: PnlPeriod) {
  const since = periodStart(period);

  const [
    orderWhere,
    costWhere,
    shiftWhere,
    timeWhere,
    laborWhere,
  ] = await Promise.all([
    orderListWhereForOwnerAnd(userId, {
      createdAt: { gte: since },
      status: { not: "CANCELLED" },
    }),
    costSnapshotListWhereForOwner(userId),
    staffShiftListWhereForOwner(userId),
    timeEntryListWhereForOwner(userId),
    laborRateListWhereForOwner(userId),
  ]);

  const [revenue, foodCost, scheduledShifts, laborTime, laborRate] = await Promise.all([
    prisma.order.aggregate({
      where: orderWhere,
      _sum: { total: true },
    }),
    prisma.costSnapshot.aggregate({
      where: { AND: [costWhere, { createdAt: { gte: since } }] },
      _sum: { totalCost: true },
    }),
    prisma.staffShift.aggregate({
      where: { AND: [shiftWhere, { shiftDate: { gte: since } }] },
      _sum: { laborCost: true },
    }),
    prisma.timeEntry.aggregate({
      where: {
        AND: [timeWhere, { clockIn: { gte: since }, totalHours: { not: null } }],
      },
      _sum: { totalHours: true },
    }),
    prisma.laborRate.findFirst({
      where: { AND: [laborWhere, { active: true }] },
      orderBy: { createdAt: "desc" },
      select: { hourlyRate: true },
    }),
  ]);

  const totalRevenue = Number(revenue._sum.total ?? 0);
  const totalFoodCost = Number(foodCost._sum.totalCost ?? 0);
  const scheduledLabor = Number(scheduledShifts._sum.laborCost ?? 0);
  const clockLaborHours = Number(laborTime._sum.totalHours ?? 0);
  const rate = laborRate ? Number(laborRate.hourlyRate) : 18;
  const clockLabor = clockLaborHours * rate;
  const totalLaborCost = Math.max(scheduledLabor, clockLabor);

  const foodCostPct = totalRevenue > 0 ? (totalFoodCost / totalRevenue) * 100 : 0;
  const laborCostPct = totalRevenue > 0 ? (totalLaborCost / totalRevenue) * 100 : 0;
  const primeCostPct = foodCostPct + laborCostPct;

  const round1 = (n: number) => Math.round(n * 10) / 10;

  return {
    period,
    totalRevenue,
    totalFoodCost,
    foodCostPct: round1(foodCostPct),
    totalLaborCost: round1(totalLaborCost),
    laborCostPct: round1(laborCostPct),
    totalLaborHours: round1(clockLaborHours),
    primeCostPct: round1(primeCostPct),
    profitMargin: round1(Math.max(0, 100 - primeCostPct)),
    targets: { foodCostPct: 30, laborCostPct: 30, primeCostPct: 60 },
  };
}

export async function getRestaurantPnLStatement(userId: string, period: PnlPeriod) {
  const [summary, settings] = await Promise.all([
    getRestaurantPnL(userId, period),
    resolveNativeBudgetSettings(userId),
  ]);
  const rev = summary.totalRevenue;

  const line = (key: string, label: string, actual: number, budgetPct: number, subtotal = false): PnlLine => {
    const budget = pnlLineBudgetAmount(key, rev, settings);
    return {
      key,
      label,
      actual: Math.round(actual * 100) / 100,
      budget,
      variance: Math.round((actual - budget) * 100) / 100,
      isSubtotal: subtotal,
    };
  };

  const food = summary.totalFoodCost;
  const labor = summary.totalLaborCost;
  const occupancy = rev * BUDGET_PCTS.occupancy * 0.95;
  const supplies = rev * BUDGET_PCTS.supplies * 0.9;
  const repairs = rev * BUDGET_PCTS.repairs * 0.85;
  const marketing = rev * BUDGET_PCTS.marketing * 1.05;
  const admin = rev * BUDGET_PCTS.admin * 0.92;

  const grossProfit = rev - food;
  const operatingExpenses = occupancy + supplies + repairs + marketing + admin;
  const ebitda = grossProfit - labor - operatingExpenses;
  const netIncome = ebitda * 0.88;

  const lines: PnlLine[] = [
    line("revenue", "Food & beverage sales", rev, 1),
    line("food_cost", "Food cost", food, BUDGET_PCTS.foodCost),
    {
      key: "gross",
      label: "Gross profit",
      actual: grossProfit,
      budget: pnlLineBudgetAmount("gross", rev, settings),
      variance: grossProfit - pnlLineBudgetAmount("gross", rev, settings),
      isSubtotal: true,
    },
    line("labor", "Labor cost", labor, BUDGET_PCTS.labor),
    line("occupancy", "Occupancy", occupancy, BUDGET_PCTS.occupancy),
    line("supplies", "Operating supplies", supplies, BUDGET_PCTS.supplies),
    line("repairs", "Repairs & maintenance", repairs, BUDGET_PCTS.repairs),
    line("marketing", "Marketing", marketing, BUDGET_PCTS.marketing),
    line("admin", "Admin & G&A", admin, BUDGET_PCTS.admin),
    {
      key: "ebitda",
      label: "EBITDA",
      actual: ebitda,
      budget: pnlLineBudgetAmount("ebitda", rev, settings),
      variance: ebitda - pnlLineBudgetAmount("ebitda", rev, settings),
      isSubtotal: true,
    },
    {
      key: "net",
      label: "Net income (est.)",
      actual: netIncome,
      budget: pnlLineBudgetAmount("net", rev, settings),
      variance: netIncome - pnlLineBudgetAmount("net", rev, settings),
      isSubtotal: true,
    },
  ];

  return { period, summary, lines };
}

export function pnlToCsv(lines: PnlLine[]): string {
  const header = "Line,Actual,Budget,Variance";
  const rows = lines.map((l) =>
    `"${l.label}",${l.actual},${l.budget},${l.variance}`,
  );
  return [header, ...rows].join("\n");
}
