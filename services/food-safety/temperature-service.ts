import type { TempCheckStatus, TempCheckType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { temperatureLogListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

function resolveTempStatus(
  temperature: number,
  targetMin?: number | null,
  targetMax?: number | null,
): TempCheckStatus {
  if (targetMin != null && temperature < targetMin) return "CRITICAL";
  if (targetMax != null && temperature > targetMax) return "CRITICAL";
  if (targetMin != null && temperature < targetMin + 2) return "WARNING";
  if (targetMax != null && temperature > targetMax - 2) return "WARNING";
  return "OK";
}

export async function logTemperature(
  userId: string,
  data: {
    locationId?: string;
    checkType: TempCheckType;
    temperature: number;
    unit?: string;
    targetMin?: number;
    targetMax?: number;
    checkedById: string;
    notes?: string;
    correctiveAction?: string;
  },
) {
  const status = resolveTempStatus(data.temperature, data.targetMin, data.targetMax);
  return prisma.temperatureLog.create({
    data: {
      userId,
      locationId: data.locationId ?? null,
      checkType: data.checkType,
      temperature: data.temperature,
      unit: data.unit ?? "F",
      targetMin: data.targetMin ?? null,
      targetMax: data.targetMax ?? null,
      status,
      checkedById: data.checkedById,
      notes: data.notes ?? null,
      correctiveAction: data.correctiveAction ?? null,
    },
  });
}

export async function listTemperatureLogs(userId: string, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const scope = await temperatureLogListWhereForOwner(userId);
  return prisma.temperatureLog.findMany({
    where: { AND: [scope, { createdAt: { gte: since } }] },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
