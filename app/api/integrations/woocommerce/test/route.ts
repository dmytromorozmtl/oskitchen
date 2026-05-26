import { NextResponse } from "next/server";
import { z } from "zod";

import { requireConnectionOwner } from "@/lib/integrations/api-helpers";
import { getWooCommerceCredentials } from "@/lib/integrations/decrypt-connection";
import { prisma } from "@/lib/prisma";
import { IntegrationStatus } from "@prisma/client";
import { testConnection } from "@/services/integrations/woocommerce";

const bodySchema = z.object({
  connectionId: z.string().uuid(),
});

export async function GET() {
  return NextResponse.json({
    message:
      "POST JSON { connectionId } while logged in to verify WooCommerce REST credentials.",
  });
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const owned = await requireConnectionOwner(parsed.data.connectionId);
  if ("error" in owned) return owned.error;

  const creds = getWooCommerceCredentials(owned.conn);
  if (!creds) {
    return NextResponse.json(
      { error: "Incomplete WooCommerce credentials on this connection." },
      { status: 400 },
    );
  }

  const result = await testConnection(creds);
  await prisma.integrationConnection.update({
    where: { id: owned.conn.id },
    data: {
      status: result.ok ? IntegrationStatus.CONNECTED : IntegrationStatus.ERROR,
      lastError: result.ok ? null : result.message,
    },
  });

  return NextResponse.json(result);
}
