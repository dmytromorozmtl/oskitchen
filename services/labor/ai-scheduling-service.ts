import type { OrderStatus } from "@prisma/client";

import { orderContributesToRevenue } from "@/lib/analytics/revenue-metrics";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { weekStartMonday } from "@/services/labor/schedule-service";

export type DowDemand = {
  dayOfWeek: number;
  avgRevenue: number;
  avgOrders: number;
  sampleWeeks: number;
};

export type SuggestedShift = {
  staffMemberId: string;
  staffName: string;
  shiftDateIso: string;
  startTime: string;
  endTime: string;
  roleLabel: string;
  estimatedHours: number;
  estimatedLaborCost: number;
};

export type StaffingDayPlan = {
  dateIso: string;
  dayLabel: string;
  predictedRevenue: number;
  predictedOrders: number;
  recommendedHeadcount: number;
  projectedLaborCost: number;
  projectedLaborPct: number;
  shifts: SuggestedShift[];
};

export type AiSchedulePlan = {
  weekStartIso: string;
  targetLaborPct: number;
  avgHourlyRate: number;
  days: StaffingDayPlan[];
  summary: {
    totalProjectedRevenue: number;
    totalProjectedLabor: number;
    blendedLaborPct: number;
    totalShifts: number;
    confidence: "low" | "medium" | "high";
    notes: string[];
  };
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const ORDERS_PER_STAFF = 18;
const DEFAULT_SHIFT_HOURS = 8;
const DEFAULT_HOURLY_RATE = 18;
const HISTORY_DAYS = 28;

type OrderRow = {
  status: OrderStatus;
  total: unknown;
  createdAt: Date;
};

type StaffRow = {
  id: string;
  name: string;
  roleType: string;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function decimalToNumber(value: unknown): number {
  if (value == null) return 0;
  return Number(value);
}

function shiftHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return mins / 60;
}

function roleLabelForStaff(roleType: string): string {
  switch (roleType) {
    case "MANAGER":
      return "Manager";
    case "KITCHEN_LEAD":
      return "Kitchen lead";
    case "LINE_COOK":
    case "PREP_COOK":
      return "Line cook";
    case "PACKER":
      return "Packer";
    case "DRIVER":
      return "Driver";
    case "CUSTOMER_SERVICE":
      return "Front of house";
    default:
      return "Crew";
  }
}

function shiftWindowForDay(dayOfWeek: number, slotIndex: number, totalSlots: number): { startTime: string; endTime: string } {
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  if (totalSlots <= 1) {
    return isWeekend ? { startTime: "09:00", endTime: "17:00" } : { startTime: "10:00", endTime: "18:00" };
  }
  if (slotIndex === 0) return { startTime: "10:00", endTime: "15:00" };
  if (slotIndex === 1) return { startTime: "15:00", endTime: "21:00" };
  return { startTime: "11:00", endTime: "19:00" };
}

export function aggregateDemandByDayOfWeek(orders: OrderRow[], historyDays = HISTORY_DAYS): DowDemand[] {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - historyDays);

  const buckets = new Map<number, { revenue: number; orders: number; dates: Set<string> }>();
  for (let d = 0; d < 7; d += 1) {
    buckets.set(d, { revenue: 0, orders: 0, dates: new Set() });
  }

  for (const order of orders) {
    if (!orderContributesToRevenue(order.status)) continue;
    if (order.createdAt < cutoff) continue;
    const dow = order.createdAt.getDay();
    const bucket = buckets.get(dow)!;
    bucket.revenue = round2(bucket.revenue + decimalToNumber(order.total));
    bucket.orders += 1;
    bucket.dates.add(order.createdAt.toISOString().slice(0, 10));
  }

  return [...buckets.entries()].map(([dayOfWeek, bucket]) => {
    const sampleWeeks = Math.max(1, Math.ceil(bucket.dates.size / 1));
    return {
      dayOfWeek,
      avgRevenue: round2(bucket.revenue / sampleWeeks),
      avgOrders: round2(bucket.orders / sampleWeeks),
      sampleWeeks,
    };
  });
}

export function recommendHeadcount(
  predictedOrders: number,
  predictedRevenue: number,
  targetLaborPct: number,
  avgHourlyRate: number,
): number {
  const demandBased = Math.max(1, Math.ceil(predictedOrders / ORDERS_PER_STAFF));
  const laborBudget = predictedRevenue * (targetLaborPct / 100);
  const laborBased =
    laborBudget > 0 && avgHourlyRate > 0
      ? Math.max(1, Math.floor(laborBudget / (avgHourlyRate * DEFAULT_SHIFT_HOURS)))
      : demandBased;
  return Math.max(1, Math.min(demandBased, Math.max(laborBased, 1)));
}

export function buildAiSchedulePlan(params: {
  weekStart: Date;
  targetLaborPct: number;
  avgHourlyRate: number;
  dowDemand: DowDemand[];
  staff: StaffRow[];
}): AiSchedulePlan {
  const { weekStart, targetLaborPct, avgHourlyRate, dowDemand, staff } = params;
  const demandByDow = new Map(dowDemand.map((d) => [d.dayOfWeek, d]));
  const staffHours = new Map<string, number>();
  for (const member of staff) staffHours.set(member.id, 0);

  const days: StaffingDayPlan[] = [];
  let totalRevenue = 0;
  let totalLabor = 0;
  let totalShifts = 0;
  let totalSampleWeeks = 0;

  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + offset);
    const dow = date.getDay();
    const demand = demandByDow.get(dow) ?? { dayOfWeek: dow, avgRevenue: 0, avgOrders: 0, sampleWeeks: 0 };
    totalSampleWeeks += demand.sampleWeeks;

    const predictedRevenue = demand.avgRevenue;
    const predictedOrders = demand.avgOrders;
    const headcount = staff.length > 0 ? recommendHeadcount(predictedOrders, predictedRevenue, targetLaborPct, avgHourlyRate) : 0;
    const slotCount = headcount <= 2 ? 1 : headcount <= 4 ? 2 : 3;

    const shifts: SuggestedShift[] = [];
    for (let slot = 0; slot < headcount; slot += 1) {
      const window = shiftWindowForDay(dow, slot % slotCount, slotCount);
      const hours = shiftHours(window.startTime, window.endTime);
      const assignable = staff
        .filter((s) => (staffHours.get(s.id) ?? 0) + hours <= 40)
        .sort((a, b) => (staffHours.get(a.id) ?? 0) - (staffHours.get(b.id) ?? 0));
      const member = assignable[slot % Math.max(assignable.length, 1)] ?? staff[slot % staff.length];
      if (!member) continue;

      const laborCost = round2(hours * avgHourlyRate);
      staffHours.set(member.id, round2((staffHours.get(member.id) ?? 0) + hours));
      shifts.push({
        staffMemberId: member.id,
        staffName: member.name,
        shiftDateIso: date.toISOString().slice(0, 10),
        startTime: window.startTime,
        endTime: window.endTime,
        roleLabel: roleLabelForStaff(member.roleType),
        estimatedHours: hours,
        estimatedLaborCost: laborCost,
      });
    }

    const projectedLaborCost = round2(shifts.reduce((sum, s) => sum + s.estimatedLaborCost, 0));
    const projectedLaborPct = predictedRevenue > 0 ? round2((projectedLaborCost / predictedRevenue) * 100) : 0;
    totalRevenue = round2(totalRevenue + predictedRevenue);
    totalLabor = round2(totalLabor + projectedLaborCost);
    totalShifts += shifts.length;

    days.push({
      dateIso: date.toISOString().slice(0, 10),
      dayLabel: DAY_LABELS[dow],
      predictedRevenue,
      predictedOrders,
      recommendedHeadcount: headcount,
      projectedLaborCost,
      projectedLaborPct,
      shifts,
    });
  }

  const avgSampleWeeks = totalSampleWeeks / 7;
  const confidence: AiSchedulePlan["summary"]["confidence"] =
    avgSampleWeeks >= 3 ? "high" : avgSampleWeeks >= 1.5 ? "medium" : "low";

  const notes = [
    "Demand-based staffing uses recent order volume by day of week — not a generative AI model.",
    "Review suggestions before publishing; overtime and availability rules are approximate.",
  ];
  if (staff.length === 0) notes.unshift("Add active staff members before auto-generating shifts.");
  if (confidence === "low") notes.push("Limited order history — projections use conservative defaults.");

  return {
    weekStartIso: weekStart.toISOString().slice(0, 10),
    targetLaborPct,
    avgHourlyRate,
    days,
    summary: {
      totalProjectedRevenue: totalRevenue,
      totalProjectedLabor: totalLabor,
      blendedLaborPct: totalRevenue > 0 ? round2((totalLabor / totalRevenue) * 100) : 0,
      totalShifts,
      confidence,
      notes,
    },
  };
}

async function averageHourlyRate(userId: string): Promise<number> {
  const rates = await prisma.laborRate.findMany({
    where: { userId, active: true },
    select: { hourlyRate: true },
    take: 20,
  });
  if (rates.length === 0) return DEFAULT_HOURLY_RATE;
  const sum = rates.reduce((acc, r) => acc + Number(r.hourlyRate), 0);
  return round2(sum / rates.length);
}

export async function loadAiSchedulePlan(
  userId: string,
  weekStartInput?: Date,
  targetLaborPct = 28,
): Promise<AiSchedulePlan> {
  const weekStart = weekStartMonday(weekStartInput ?? new Date());
  const historyStart = new Date(weekStart);
  historyStart.setDate(historyStart.getDate() - HISTORY_DAYS);

  const orderWhere = await orderListWhereForOwnerAnd(userId, {
    createdAt: { gte: historyStart },
  });

  const [orders, staff, avgHourlyRate] = await Promise.all([
    prisma.order.findMany({
      where: orderWhere,
      select: { status: true, total: true, createdAt: true },
    }),
    prisma.staffMember.findMany({
      where: { userId, status: "ACTIVE" },
      select: { id: true, name: true, roleType: true },
      orderBy: { name: "asc" },
    }),
    averageHourlyRate(userId),
  ]);

  const dowDemand = aggregateDemandByDayOfWeek(orders);
  return buildAiSchedulePlan({
    weekStart,
    targetLaborPct,
    avgHourlyRate,
    dowDemand,
    staff,
  });
}
