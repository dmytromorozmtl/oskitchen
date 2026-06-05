import { prisma } from "@/lib/prisma";
import type { CashDrawerCountRecord } from "@/lib/pos/pos-cash-management";
import { listPosRegisters } from "@/services/pos/pos-register-service";
import { listRecentCashDrawerCounts } from "@/services/pos/pos-cash-count-service";
import {
  listOpenShiftCloseoutPreviews,
  listRecentClosedShiftSummaries,
  type ClosedShiftSummary,
  type OpenShiftCloseoutPreview,
} from "@/services/pos/pos-shift-service";

export type PosCashManagementBootstrap = {
  registers: Array<{ id: string; name: string }>;
  staff: Array<{ id: string; name: string }>;
  openShifts: OpenShiftCloseoutPreview[];
  closedShifts: ClosedShiftSummary[];
  recentCounts: CashDrawerCountRecord[];
};

export async function loadPosCashManagementBootstrap(userId: string): Promise<PosCashManagementBootstrap> {
  const [registers, staff, openShifts, closedShifts, recentCounts] = await Promise.all([
    listPosRegisters(userId),
    prisma.staffMember.findMany({
      where: { userId, status: "ACTIVE", archivedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    listOpenShiftCloseoutPreviews(userId),
    listRecentClosedShiftSummaries(userId, 20),
    listRecentCashDrawerCounts(userId, 10),
  ]);

  return {
    registers: registers.map((register) => ({ id: register.id, name: register.name })),
    staff,
    openShifts,
    closedShifts,
    recentCounts,
  };
}
