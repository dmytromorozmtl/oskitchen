import { prisma } from "@/lib/prisma";
import { resolveOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";

export type StaffReadinessSnapshot = {
  activeStaff: number;
  hasOwner: boolean;
  hasManager: boolean;
  kitchenStaff: number;
  packingStaff: number;
  drivers: number;
  activeCertifications: number;
  expiringCertifications: number;
  trainingIncomplete: number;
  shiftsToday: number;
};

export async function loadStaffReadinessSnapshot(userId: string): Promise<StaffReadinessSnapshot> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const in30 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const scope = await resolveOwnerScopedWhere(userId);

  const [
    activeStaff,
    hasOwnerRow,
    hasManagerRow,
    kitchenStaff,
    packingStaff,
    drivers,
    activeCertifications,
    expiringCertifications,
    trainingIncomplete,
    shiftsToday,
  ] = await Promise.all([
    prisma.staffMember.count({ where: { AND: [scope, { status: "ACTIVE" }] } }),
    prisma.staffMember.count({ where: { AND: [scope, { status: "ACTIVE", roleType: "OWNER" }] } }),
    prisma.staffMember.count({
      where: { AND: [scope, { status: "ACTIVE", roleType: { in: ["OWNER", "MANAGER"] } }] },
    }),
    prisma.staffMember.count({
      where: {
        AND: [
          scope,
          {
            status: "ACTIVE",
            roleType: { in: ["KITCHEN_LEAD", "PREP_COOK", "LINE_COOK"] },
          },
        ],
      },
    }),
    prisma.staffMember.count({ where: { AND: [scope, { status: "ACTIVE", roleType: "PACKER" }] } }),
    prisma.staffMember.count({ where: { AND: [scope, { status: "ACTIVE", roleType: "DRIVER" }] } }),
    prisma.staffCertification.count({ where: { AND: [scope, { status: "ACTIVE" }] } }),
    prisma.staffCertification.count({
      where: { AND: [scope, { status: "ACTIVE", expiresAt: { gt: today, lte: in30 } }] },
    }),
    prisma.trainingAssignment.count({
      where: {
        AND: [
          scope,
          {
            assignedToStaffId: { not: null },
            status: { notIn: ["COMPLETED", "WAIVED"] },
          },
        ],
      },
    }),
    prisma.staffShift.count({
      where: { AND: [scope, { shiftDate: { gte: today, lt: tomorrow } }] },
    }),
  ]);

  return {
    activeStaff,
    hasOwner: hasOwnerRow > 0,
    hasManager: hasManagerRow > 0,
    kitchenStaff,
    packingStaff,
    drivers,
    activeCertifications,
    expiringCertifications,
    trainingIncomplete,
    shiftsToday,
  };
}
