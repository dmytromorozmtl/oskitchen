import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";
import type { Prisma } from "@prisma/client";
import {
  ownerScopedAnd,
  productListWhereForOwnerAnd,
} from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { countPosRegisters, createPosRegister, listPosRegisters } from "@/services/pos/pos-register-service";
import { getOpenPosShift } from "@/services/pos/pos-shift-service";
import { createStaffMember } from "@/services/staff/staff-service";

export async function ensurePosTerminalReady(userId: string) {
  await ensureOwnerWorkspaceId(userId);
  if ((await countPosRegisters(userId)) === 0) {
    await createPosRegister(userId, { name: "Main Register" });
  }

  const activeStaffWhere = (await ownerScopedAnd(userId, {
    status: "ACTIVE",
    archivedAt: null,
  })) as Prisma.StaffMemberWhereInput;
  const activeStaffCount = await prisma.staffMember.count({
    where: activeStaffWhere,
  });
  if (activeStaffCount === 0) {
    const profile = await prisma.userProfile.findUnique({
      where: { id: userId },
      select: { fullName: true, companyName: true, email: true },
    });
    const name =
      profile?.companyName?.trim() ||
      profile?.fullName?.trim() ||
      profile?.email.split("@")[0] ||
      "Owner";
    await createStaffMember({
      userId,
      name,
      roleType: "OWNER",
      status: "ACTIVE",
    });
  }
}

export async function loadPosTerminalBootstrap(userId: string) {
  await ensurePosTerminalReady(userId);
  const productWhere = await productListWhereForOwnerAnd(userId, {
    active: true,
    posVisible: true,
  });
  const staffWhere = (await ownerScopedAnd(userId, {
    status: "ACTIVE",
    archivedAt: null,
  })) as Prisma.StaffMemberWhereInput;
  const locationWhere = (await ownerScopedAnd(userId, { active: true })) as Prisma.LocationWhereInput;

  const [registers, locations, staff, products] = await Promise.all([
    listPosRegisters(userId),
    prisma.location.findMany({
      where: locationWhere,
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.staffMember.findMany({
      where: staffWhere,
      orderBy: { name: "asc" },
      take: 200,
      select: { id: true, name: true, roleType: true },
    }),
    prisma.product.findMany({
      where: productWhere,
      orderBy: [{ category: "asc" }, { title: "asc" }],
      take: 400,
      select: {
        id: true,
        title: true,
        price: true,
        category: true,
        barcode: true,
        image: true,
      },
    }),
  ]);

  const shifts: Record<string, Awaited<ReturnType<typeof getOpenPosShift>>> = {};
  for (const r of registers) {
    shifts[r.id] = await getOpenPosShift(userId, r.id);
  }

  return { registers, locations, staff, products, openShiftsByRegisterId: shifts };
}
