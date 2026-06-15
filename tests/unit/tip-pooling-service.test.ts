import { describe, expect, it } from "vitest";

import { DEFAULT_TIP_POOL_RULES } from "@/lib/labor/tip-pool-settings";
import { buildTipPoolReport } from "@/services/labor/tip-pooling-service";

describe("tip pooling service", () => {
  const staff = [
    { id: "s1", name: "Alex", roleType: "CUSTOMER_SERVICE" },
    { id: "s2", name: "Jordan", roleType: "LINE_COOK" },
    { id: "s3", name: "Sam", roleType: "PACKER" },
  ];

  const shifts = [
    { staffMemberId: "s1", shiftDate: new Date("2026-05-05"), startTime: "10:00", endTime: "18:00" },
    { staffMemberId: "s2", shiftDate: new Date("2026-05-05"), startTime: "10:00", endTime: "18:00" },
    { staffMemberId: "s3", shiftDate: new Date("2026-05-06"), startTime: "12:00", endTime: "20:00" },
  ];

  it("distributes pooled tips by hours weighted", () => {
    const report = buildTipPoolReport({
      from: new Date("2026-05-05"),
      to: new Date("2026-05-11"),
      rules: { ...DEFAULT_TIP_POOL_RULES, distributionMethod: "hours_weighted", poolPercent: 100 },
      tips: [
        { staffId: null, tip: 100, createdAt: new Date("2026-05-05T20:00:00.000Z") },
        { staffId: "s1", tip: 20, createdAt: new Date("2026-05-05T21:00:00.000Z") },
      ],
      shifts,
      staff,
    });

    expect(report.totalTipsCollected).toBe(120);
    expect(report.pooledAmount).toBe(120);
    expect(report.staffLines.length).toBeGreaterThan(0);
    const payoutSum = report.staffLines.reduce((sum, line) => sum + line.totalPayout, 0);
    expect(payoutSum).toBeCloseTo(120, 1);
  });

  it("splits equal when method is equal", () => {
    const report = buildTipPoolReport({
      from: new Date("2026-05-05"),
      to: new Date("2026-05-11"),
      rules: { ...DEFAULT_TIP_POOL_RULES, distributionMethod: "equal", poolPercent: 100 },
      tips: [{ staffId: null, tip: 90, createdAt: new Date("2026-05-05T20:00:00.000Z") }],
      shifts: shifts.filter((s) => s.staffMemberId !== "s3"),
      staff: staff.filter((s) => s.id !== "s3"),
    });

    const alex = report.staffLines.find((l) => l.staffMemberId === "s1");
    const jordan = report.staffLines.find((l) => l.staffMemberId === "s2");
    expect(alex?.pooledShare).toBeCloseTo(45, 0);
    expect(jordan?.pooledShare).toBeCloseTo(45, 0);
  });

  it("attributes direct tips in hybrid POS mode", () => {
    const report = buildTipPoolReport({
      from: new Date("2026-05-05"),
      to: new Date("2026-05-11"),
      rules: { ...DEFAULT_TIP_POOL_RULES, distributionMethod: "hybrid_pos_pool", poolPercent: 50 },
      tips: [{ staffId: "s1", tip: 40, createdAt: new Date("2026-05-05T20:00:00.000Z") }],
      shifts,
      staff,
    });

    const alex = report.staffLines.find((l) => l.staffMemberId === "s1");
    expect(alex?.directTips).toBeGreaterThan(0);
    expect(report.totalTipsCollected).toBe(40);
  });
});
