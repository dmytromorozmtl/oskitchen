import { prisma } from "@/lib/prisma";
import {
  iotSensorDeviceListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { sendSmsNotification } from "@/services/notifications/sms-service";

export type IotTemperaturePayload = {
  deviceId: string;
  temperature: number;
  timestamp: string;
  battery?: number;
  unit?: "F" | "C";
};

export async function ingestIotTemperatureReading(
  userId: string,
  payload: IotTemperaturePayload,
): Promise<{ ok: true; alert: boolean } | { ok: false; error: string }> {
  const deviceScope = await iotSensorDeviceListWhereForOwner(userId);
  const device = await prisma.iotSensorDevice.findFirst({
    where: { AND: [deviceScope, { deviceId: payload.deviceId, active: true }] },
  });
  if (!device) return { ok: false, error: "Unknown device" };

  const tempF = payload.unit === "C" ? payload.temperature * 9 / 5 + 32 : payload.temperature;
  const min = device.targetMinF != null ? Number(device.targetMinF) : null;
  const max = device.targetMaxF != null ? Number(device.targetMaxF) : null;
  const outOfRange =
    (min != null && tempF < min) || (max != null && tempF > max);

  await prisma.$transaction([
    prisma.iotSensorDevice.update({
      where: { id: device.id },
      data: {
        lastSeenAt: new Date(payload.timestamp),
        lastBattery: payload.battery ?? undefined,
      },
    }),
    prisma.temperatureLog.create({
      data: {
        userId,
        locationId: device.locationId,
        checkType: "REFRIGERATOR",
        temperature: tempF,
        unit: "F",
        targetMin: min ?? undefined,
        targetMax: max ?? undefined,
        status: outOfRange ? "CRITICAL" : "OK",
        checkedById: userId,
        notes: `IoT ${payload.deviceId}`,
      },
    }),
  ]);

  const alertTo = process.env.IOT_ALERT_SMS_TO?.trim();
  if (outOfRange && alertTo) {
    await sendSmsNotification({
      to: alertTo,
      body: `OS Kitchen: ${device.label ?? payload.deviceId} temp ${tempF.toFixed(1)}°F out of range.`,
    }).catch(() => undefined);
  }

  return { ok: true, alert: outOfRange };
}

export async function listIotDevices(userId: string) {
  const scope = await iotSensorDeviceListWhereForOwner(userId);
  return prisma.iotSensorDevice.findMany({
    where: scope,
    orderBy: { createdAt: "desc" },
    include: { location: { select: { name: true } } },
  });
}
