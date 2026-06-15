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

function alexaResponse(speech: string, shouldEndSession = true) {
  return NextResponse.json({
    version: "1.0",
    response: {
      outputSpeech: { type: "PlainText", text: speech },
      shouldEndSession,
    },
  });
}

export async function POST(request: Request) {
  const secret = request.headers.get("x-voice-secret")?.trim() ?? "";
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return alexaResponse("Sorry, that request was invalid.", true);
  }

  const verified = await verifyVoiceWebhookSecret(parsed.data.ownerUserId, secret);
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const kitchen = await processKitchenVoiceQuery({
    ownerUserId: parsed.data.ownerUserId,
    utterance: parsed.data.utterance,
    slots: parsed.data.slots?.ingredient
      ? { ingredient: parsed.data.slots.ingredient }
      : undefined,
  });
  if (kitchen) {
    return alexaResponse(kitchen.speech, true);
  }

  const result = await processVoiceOrder({
    ownerUserId: parsed.data.ownerUserId,
    channel: "alexa",
    utterance: parsed.data.utterance,
    slots: parsed.data.slots,
  });

  return alexaResponse(result.speech, true);
}
