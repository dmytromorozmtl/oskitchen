import { prisma } from "@/lib/prisma";
import {
  get7shiftsConfigError,
  importScheduleFrom7shifts as import7shifts,
  is7shiftsImportConfigured,
} from "@/services/integrations/seven-shifts-import-service";

export function is7shiftsConfigured(): boolean {
  return is7shiftsImportConfigured();
}

export function isHomebaseConfigured(): boolean {
  return Boolean(process.env.HOMEBASE_API_KEY?.trim());
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

  if (!isHomebaseConfigured()) {
    return { ok: false as const, message: "Set HOMEBASE_API_KEY", shifts };
  }
  return {
    ok: false as const,
    message: "Homebase API wiring pending — schedule export ready",
    exported: shifts.length,
  };
}

export { importScheduleFrom7shifts } from "@/services/integrations/seven-shifts-import-service";

export async function importScheduleFromHomebase(_userId: string) {
  if (!isHomebaseConfigured()) {
    return { ok: false as const, message: "Set HOMEBASE_API_KEY", imported: 0 };
  }
  return { ok: false as const, message: "Homebase import scaffold", imported: 0 };
}
