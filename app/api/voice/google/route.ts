import { NextResponse } from "next/server";
import { z } from "zod";

import { processKitchenVoiceQuery } from "@/services/voice/kitchen-voice-service";
import {
  processVoiceOrder,
  verifyVoiceWebhookSecret,
} from "@/services/voice/voice-ordering-service";

const bodySchema = z.object({
  ownerUserId: z.string().uuid(),
  utterance: z.string().max(500).optional(),
  queryResult: z
    .object({
      queryText: z.string().max(500).optional(),
      parameters: z
        .object({
          table: z.string().max(40).optional(),
          item: z.string().max(200).optional(),
          ingredient: z.string().max(200).optional(),
          quantity: z.union([z.number(), z.string()]).optional(),
          modifiers: z.string().max(200).optional(),
        })
        .optional(),
    })
    .optional(),
  slots: z
    .object({
      table: z.string().max(40).optional(),
      item: z.string().max(200).optional(),
      ingredient: z.string().max(200).optional(),
      quantity: z.union([z.number(), z.string()]).optional(),
      modifiers: z.string().max(200).optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  const secret = request.headers.get("x-voice-secret")?.trim() ?? "";
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ fulfillmentText: "Sorry, I could not understand that." });
  }

  const verified = await verifyVoiceWebhookSecret(parsed.data.ownerUserId, secret);
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const utterance =
    parsed.data.utterance ??
    parsed.data.queryResult?.queryText ??
    undefined;
  const slots =
    parsed.data.slots ??
    parsed.data.queryResult?.parameters ??
    undefined;

  const kitchen = await processKitchenVoiceQuery({
    ownerUserId: parsed.data.ownerUserId,
    utterance,
    slots: slots?.ingredient ? { ingredient: slots.ingredient } : undefined,
  });
  if (kitchen) {
    return NextResponse.json({ fulfillmentText: kitchen.speech });
  }

  const result = await processVoiceOrder({
    ownerUserId: parsed.data.ownerUserId,
    channel: "google_home",
    utterance,
    slots,
  });

  return NextResponse.json({ fulfillmentText: result.speech });
}
