import { NextResponse } from "next/server";
import { z } from "zod";

import type { RevenueAttestationSignedPayload } from "@/lib/commercial/revenue-attestation-signing";
import { verifyRevenueAttestationDocument } from "@/services/commercial/revenue-attestation-service";

const verifySchema = z.object({
  payload: z.custom<RevenueAttestationSignedPayload>(),
  signature: z.string().min(16).max(128),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = verifySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ valid: false, error: "Invalid attestation document." }, { status: 400 });
  }

  const result = verifyRevenueAttestationDocument(parsed.data);
  return NextResponse.json({
    valid: result.valid,
    expired: result.expired,
    reason: result.reason ?? null,
    attestationId: parsed.data.payload.attestationId,
    workspaceId: parsed.data.payload.workspaceId,
    periodStart: parsed.data.payload.periodStart,
    periodEnd: parsed.data.payload.periodEnd,
    grossOrderRevenue: parsed.data.payload.grossOrderRevenue,
    orderCount: parsed.data.payload.orderCount,
    currency: parsed.data.payload.currency,
    disclaimer: parsed.data.payload.disclaimer,
  });
}
