import type { TipPoolDistributionMethod, TipPoolRules } from "@/lib/labor/tip-pool-settings";
import { DEFAULT_TIP_POOL_RULES } from "@/lib/labor/tip-pool-settings";

export type TipTransactionRow = {
  staffId: string | null;
  tip: number;
  createdAt: Date;
};

export type TipPoolShiftRow = {
  staffMemberId: string;
  shiftDate: Date;
  startTime: string;
  endTime: string;
};

export type TipPoolStaffRow = {
  id: string;
  name: string;
  roleType: string;
};

export type TipPoolStaffLine = {
  staffMemberId: string;
  staffName: string;
  roleType: string;
  shiftHours: number;
  directTips: number;
  pooledShare: number;
  totalPayout: number;
  weight: number;
};

export type TipPoolReportSnapshot = {
  fromIso: string;
  toIso: string;
  rules: TipPoolRules;
  totalTipsCollected: number;
  pooledAmount: number;
  directTipsTotal: number;
  unassignedTips: number;
  staffLines: TipPoolStaffLine[];
  notes: string[];
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function shiftHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return mins / 60;
}

function roleWeight(rules: TipPoolRules, roleType: string): number {
  return rules.roleWeights[roleType] ?? 0.4;
}

function distributeProportional(total: number, weights: number[]): number[] {
  if (total <= 0 || weights.length === 0) return weights.map(() => 0);
  const sum = weights.reduce((acc, w) => acc + w, 0);
  if (sum <= 0) {
    const even = round2(total / weights.length);
    return weights.map((_, i) => (i === weights.length - 1 ? round2(total - even * (weights.length - 1)) : even));
  }
  const raw = weights.map((w) => (total * w) / sum);
  const rounded = raw.map((v) => round2(v));
  const drift = round2(total - rounded.reduce((a, b) => a + b, 0));
  if (rounded.length > 0) rounded[rounded.length - 1] = round2(rounded[rounded.length - 1] + drift);
  return rounded;
}

function computeWeight(
  method: TipPoolDistributionMethod,
  rules: TipPoolRules,
  hours: number,
  roleType: string,
): number {
  if (method === "equal") return 1;
  if (method === "role_weighted") return roleWeight(rules, roleType);
  return hours * roleWeight(rules, roleType);
}

export function buildTipPoolReport(params: {
  from: Date;
  to: Date;
  rules?: TipPoolRules;
  tips: TipTransactionRow[];
  shifts: TipPoolShiftRow[];
  staff: TipPoolStaffRow[];
}): TipPoolReportSnapshot {
  const rules = params.rules ?? DEFAULT_TIP_POOL_RULES;
  const fromIso = params.from.toISOString().slice(0, 10);
  const toIso = params.to.toISOString().slice(0, 10);

  const eligibleStaff = params.staff.filter((s) => rules.eligibleRoleTypes.includes(s.roleType));
  const staffById = new Map(params.staff.map((s) => [s.id, s]));

  const hoursByStaff = new Map<string, number>();
  for (const shift of params.shifts) {
    const hrs = shiftHours(shift.startTime, shift.endTime);
    hoursByStaff.set(shift.staffMemberId, round2((hoursByStaff.get(shift.staffMemberId) ?? 0) + hrs));
  }

  const workedStaffIds = new Set(
    eligibleStaff.filter((s) => (hoursByStaff.get(s.id) ?? 0) > 0).map((s) => s.id),
  );

  let totalTipsCollected = 0;
  let directTipsTotal = 0;
  let poolTotal = 0;
  const directByStaff = new Map<string, number>();

  for (const row of params.tips) {
    const tip = round2(row.tip);
    if (tip <= 0) continue;
    totalTipsCollected = round2(totalTipsCollected + tip);

    const toPool = round2(tip * (rules.poolPercent / 100));
    const toDirect = round2(tip - toPool);

    if (toDirect > 0 && row.staffId) {
      directByStaff.set(row.staffId, round2((directByStaff.get(row.staffId) ?? 0) + toDirect));
      directTipsTotal = round2(directTipsTotal + toDirect);
    } else if (toDirect > 0) {
      poolTotal = round2(poolTotal + toDirect);
    }

    poolTotal = round2(poolTotal + toPool);
  }

  const effectivePool = poolTotal;

  const participants =
    workedStaffIds.size > 0
      ? eligibleStaff.filter((s) => workedStaffIds.has(s.id))
      : eligibleStaff;

  const distributionMethod =
    rules.distributionMethod === "hybrid_pos_pool" ? "hours_weighted" : rules.distributionMethod;

  const weights = participants.map((s) =>
    computeWeight(distributionMethod, rules, hoursByStaff.get(s.id) ?? 0, s.roleType),
  );
  const pooledShares = distributeProportional(effectivePool, weights);

  const staffLines: TipPoolStaffLine[] = participants.map((s, index) => {
    const directTips = directByStaff.get(s.id) ?? 0;
    const pooledShare = pooledShares[index] ?? 0;
    return {
      staffMemberId: s.id,
      staffName: s.name,
      roleType: s.roleType,
      shiftHours: round2(hoursByStaff.get(s.id) ?? 0),
      directTips,
      pooledShare,
      totalPayout: round2(directTips + pooledShare),
      weight: round2(weights[index] ?? 0),
    };
  });

  for (const [staffId, amount] of directByStaff) {
    if (participants.some((p) => p.id === staffId)) continue;
    const member = staffById.get(staffId);
    if (!member || amount <= 0) continue;
    staffLines.push({
      staffMemberId: staffId,
      staffName: member.name,
      roleType: member.roleType,
      shiftHours: round2(hoursByStaff.get(staffId) ?? 0),
      directTips: amount,
      pooledShare: 0,
      totalPayout: amount,
      weight: 0,
    });
  }

  staffLines.sort((a, b) => b.totalPayout - a.totalPayout);

  const assigned = round2(staffLines.reduce((sum, line) => sum + line.totalPayout, 0));
  const unassignedTips = round2(Math.max(0, totalTipsCollected - assigned));

  const notes = [
    "Tip pool uses POS transaction tips and scheduled shift hours — verify against your payroll provider.",
    `Distribution: ${rules.distributionMethod.replace(/_/g, " ")} · ${rules.poolPercent}% pooled.`,
  ];
  if (!rules.enabled) notes.unshift("Tip pooling is disabled in rules — report shows preview math only.");
  if (participants.length === 0) notes.push("No eligible staff with shift hours in this period.");
  if (unassignedTips > 0) notes.push(`$${unassignedTips.toFixed(2)} could not be assigned (missing shift coverage).`);

  return {
    fromIso,
    toIso,
    rules,
    totalTipsCollected,
    pooledAmount: effectivePool,
    directTipsTotal,
    unassignedTips,
    staffLines,
    notes,
  };
}
