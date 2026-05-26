import { NextResponse } from "next/server";

import { guardPublicApi, isGuardError } from "@/lib/api-public/guard";
import { publicApiWebhookCreateSchema } from "@/lib/api-public/schemas";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const guard = await guardPublicApi(request, "public_api_webhooks_get");
  if (isGuardError(guard)) return guard.response;

  const events = await prisma.webhookEvent.findMany({
    where: { userId: guard.userId },
    orderBy: { receivedAt: "desc" },
    take: 50,
    select: {
      id: true,
      provider: true,
      topic: true,
      processed: true,
      receivedAt: true,
    },
  });

  return NextResponse.json({ data: events });
}

export async function POST(request: Request) {
  const guard = await guardPublicApi(request, "public_api_webhooks_post", "public_api_v1_post");
  if (isGuardError(guard)) return guard.response;

  const body = await request.json().catch(() => null);
  const parsed = publicApiWebhookCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const event = await prisma.webhookEvent.create({
    data: {
      userId: guard.userId,
      provider: "MANUAL",
      topic: parsed.data.topic ?? "public_api.custom",
      payloadJson: parsed.data.payload ?? {},
      signatureValid: true,
    },
  });

  return NextResponse.json({ data: { id: event.id } }, { status: 201 });
}
