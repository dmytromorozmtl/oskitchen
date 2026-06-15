import { NextResponse } from "next/server";
import { z } from "zod";

import { requireIngestBearerSecret, enforceIngestRateLimit } from "@/lib/api/public-post-guard";
import { prisma } from "@/lib/prisma";
import { ingestIotTemperatureReading } from "@/services/food-safety/iot-temperature-service";

const bodySchema = z.object({
  deviceId: z.string().min(1).max(120),
  temperature: z.number(),
  timestamp: z.string().datetime(),
  battery: z.number().int().min(0).max(100).optional(),
  unit: z.enum(["F", "C"]).optional(),
  userId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const authError = requireIngestBearerSecret(request, {
    secretEnv: process.env.IOT_INGEST_SECRET,
    missingMessage: "IoT ingest not configured",
  });
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const rateError = await enforceIngestRateLimit(request, {
    policyKey: "iot_ingest",
    bucketPrefix: "iot_ingest",
    scopeSuffix: parsed.data.deviceId,
  });
  if (rateError) return rateError;

  let userId = parsed.data.userId;
  if (!userId) {
    const device = await prisma.iotSensorDevice.findFirst({
      where: { deviceId: parsed.data.deviceId, active: true },
      select: { userId: true },
    });
    userId = device?.userId;
  }
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const result = await ingestIotTemperatureReading(userId, parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }
  return NextResponse.json({ ok: true, alert: result.alert });
}
