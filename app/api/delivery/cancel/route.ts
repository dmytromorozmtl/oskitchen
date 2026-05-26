import { NextResponse } from "next/server";
import { z } from "zod";

import { enforceDeliveryApiRateLimit } from "@/lib/integrations/delivery-api-guard";
import { requireConnectionOwner } from "@/lib/integrations/api-helpers";
import { decryptOptional } from "@/lib/crypto";
import { cancelDelivery } from "@/services/delivery/uber-direct";

const bodySchema = z.object({
  connectionId: z.string().uuid(),
  externalDeliveryId: z.string().min(1),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const owned = await requireConnectionOwner(parsed.data.connectionId);
  if ("error" in owned) return owned.error;

  const rateLimited = await enforceDeliveryApiRateLimit(request, owned.userId);
  if (rateLimited) return rateLimited;

  const creds = {
    customerId: decryptOptional(owned.conn.accessTokenEncrypted),
    clientId: decryptOptional(owned.conn.consumerKeyEncrypted),
    clientSecret: decryptOptional(owned.conn.consumerSecretEncrypted),
  };

  const result = await cancelDelivery(creds, parsed.data.externalDeliveryId);
  return NextResponse.json(result);
}
