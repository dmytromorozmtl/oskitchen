import { NextResponse } from "next/server";
import { z } from "zod";

import { enforceStorefrontRateLimitFromRequest } from "@/lib/storefront/storefront-rate-limit";
import {
  createPublicWaitlistEntry,
  loadPublicWaitlistStatus,
} from "@/services/storefront/waitlist-management-service";

const joinBody = z.object({
  storeSlug: z.string().min(1).max(128),
  customerName: z.string().min(1).max(255),
  customerPhone: z.string().min(5).max(64),
  partySize: z.coerce.number().int().min(1).max(50),
});

const statusQuery = z.object({
  storeSlug: z.string().min(1).max(128),
  entryId: z.string().uuid(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = statusQuery.safeParse({
    storeSlug: url.searchParams.get("storeSlug"),
    entryId: url.searchParams.get("entryId"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters." }, { status: 400 });
  }

  const { storeSlug, entryId } = parsed.data;
  const rate = await enforceStorefrontRateLimitFromRequest(request, "storefront_cart_sync", storeSlug);
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  const status = await loadPublicWaitlistStatus(storeSlug, entryId);
  if (!status) {
    return NextResponse.json({ error: "Waitlist entry not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true as const, status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = joinBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid waitlist payload." }, { status: 400 });
  }

  const { storeSlug, customerName, customerPhone, partySize } = parsed.data;
  const rate = await enforceStorefrontRateLimitFromRequest(request, "storefront_contact_submit", storeSlug);
  if (!rate.ok) {
    return NextResponse.json({ error: rate.message }, { status: 429 });
  }

  try {
    const result = await createPublicWaitlistEntry(storeSlug, {
      customerName,
      customerPhone,
      partySize,
    });

    return NextResponse.json({
      ok: true as const,
      entryId: result.entry.id,
      position: result.position,
      estimatedWaitMinutes: result.estimatedWaitMinutes,
      smsSent: result.sms.ok,
      smsSkipped: "skipped" in result.sms ? result.sms.skipped === true : false,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to join waitlist.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
