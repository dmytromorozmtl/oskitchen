import { prisma } from "@/lib/prisma";

export function is7shiftsConfigured(): boolean {
  return Boolean(process.env.SEVENSHIFTS_API_KEY?.trim());
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

  if (!is7shiftsConfigured()) {
    return { ok: false as const, message: "Set SEVENSHIFTS_API_KEY", shifts };
  }
  return {
    ok: false as const,
    message: "7shifts API wiring pending — schedule export ready",
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

export async function importScheduleFrom7shifts(_userId: string) {
  if (!is7shiftsConfigured()) {
    return { ok: false as const, message: "Set SEVENSHIFTS_API_KEY", imported: 0 };
  }
  return { ok: false as const, message: "7shifts import scaffold", imported: 0 };
}

export async function importScheduleFromHomebase(_userId: string) {
  if (!isHomebaseConfigured()) {
    return { ok: false as const, message: "Set HOMEBASE_API_KEY", imported: 0 };
  }
  return { ok: false as const, message: "Homebase import scaffold", imported: 0 };
}
