import { prisma } from "@/lib/prisma";
import {
  getHomebaseConfigError,
  isHomebaseImportConfigured,
} from "@/services/integrations/homebase-import-service";
import {
  get7shiftsConfigError,
  is7shiftsImportConfigured,
} from "@/services/integrations/seven-shifts-import-service";

export function is7shiftsConfigured(): boolean {
  return is7shiftsImportConfigured();
}

export function isHomebaseConfigured(): boolean {
  return isHomebaseImportConfigured();
}

export async function exportScheduleTo7shifts(userId: string) {
  const shifts = await prisma.staffShift.findMany({
    where: {
      userId,
      shiftDate: { gte: new Date() },
    },
    include: { staffMember: { select: { name: true } } },
    take: 100,
  });

  const configError = get7shiftsConfigError();
  if (configError) {
    return { ok: false as const, message: configError, shifts };
  }
  return {
    ok: false as const,
    message: "7shifts schedule export pending — import is available now",
    exported: shifts.length,
  };
}

export async function exportScheduleToHomebase(userId: string) {
  const shifts = await prisma.staffShift.findMany({
    where: {
      userId,
      shiftDate: { gte: new Date() },
    },
    include: { staffMember: { select: { name: true } } },
    take: 100,
  });

  const configError = getHomebaseConfigError();
  if (configError) {
    return { ok: false as const, message: configError, shifts };
  }
  return {
    ok: false as const,
    message: "Homebase schedule export pending — import is available now",
    exported: shifts.length,
  };
}

export { importScheduleFrom7shifts } from "@/services/integrations/seven-shifts-import-service";
export { importScheduleFromHomebase } from "@/services/integrations/homebase-import-service";
