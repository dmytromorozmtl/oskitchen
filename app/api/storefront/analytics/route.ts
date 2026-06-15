import { createHash } from "crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { parseFirstPartyAnalyticsMode } from "@/lib/storefront/consent";
import { prisma } from "@/lib/prisma";
import {
  isStorefrontAnalyticsStrictIngestEnabled,
  verifyStorefrontAnalyticsTokenForIngest,
} from "@/services/storefront/storefront-analytics-signing-service";
import {
  createExperimentSpanId,
  ensureTraceId,
  recordExperimentSpan,
  traceIdFromHeaders,
} from "@/lib/storefront/experiment-trace";
import { enforceStorefrontRateLimitFromRequest } from "@/lib/storefront/storefront-rate-limit";

export const runtime = "nodejs";

const LEGACY_EVENT_NAMES = [
  "page_view",
  "product_view",
  "view_item",
  "add_to_cart",
  "cart_view",
  "checkout_start",
  "checkout_submit",
  "order_submitted",
  "order_created",
  "contact_submitted",
  "contact_submit",
  "catering_inquiry_submit",
  "wholesale_inquiry_submit",
  "event_inquiry_submit",
  "feedback_submit",
  "custom_request_submit",
  "storefront_form_submit",
  "order_confirmation_view",
  "experiment.exposure",
  "theme_apply",
] as const;

const bodySchema = z.object({
  storeSlug: z.string().min(2).max(120),
  eventName: z.enum(LEGACY_EVENT_NAMES),
  path: z.string().max(512).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  referrer: z.string().max(2000).optional(),
});

function hashOptional(value: string | null | undefined) {
  if (!value) return null;
  return createHash("sha256").update(value).digest("hex").slice(0, 64);
}

/** Canonical names stored on `StorefrontConversionEvent.eventName`. */
function normalizeIngestEventName(eventName: string): string {
  switch (eventName) {
    case "product_view":
      return "view_item";
    case "order_submitted":
      return "order_created";
    case "contact_submitted":
      return "contact_submit";
    default:
      return eventName;
  }
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const { storeSlug, eventName, path, metadata, referrer } = parsed.data;
  const canonical = normalizeIngestEventName(eventName);

  const rate = await enforceStorefrontRateLimitFromRequest(request, "storefront_analytics_ingest", storeSlug);
  if (!rate.ok) {
    return NextResponse.json({ ok: false, error: rate.message }, { status: 429 });
  }

  const sf = await prisma.storefrontSettings.findUnique({
    where: { storeSlug },
    select: { id: true, enabled: true, published: true, firstPartyAnalyticsMode: true },
  });
  if (!sf?.enabled || !sf.published) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const fp = parseFirstPartyAnalyticsMode(sf.firstPartyAnalyticsMode);
  if (fp === "DISABLED") {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  if (fp === "CONSENT_REQUIRED") {
    if (request.headers.get("x-kos-fp-consent") !== "granted") {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
  } else if (fp === "ALWAYS_ON") {
    const h = request.headers.get("x-kos-fp-consent");
    if (h && h !== "always" && h !== "granted") {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
  }

  const ingestToken = request.headers.get("x-kos-fp-analytics-token")?.trim() ?? "";
  const strict = isStorefrontAnalyticsStrictIngestEnabled();
  if (strict) {
    if (!ingestToken) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
    if (!verifyStorefrontAnalyticsTokenForIngest({ token: ingestToken, expectedStoreSlug: storeSlug, expectedStorefrontId: sf.id })) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
  } else if (ingestToken) {
    if (!verifyStorefrontAnalyticsTokenForIngest({ token: ingestToken, expectedStoreSlug: storeSlug, expectedStorefrontId: sf.id })) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
  }

  const ua = request.headers.get("user-agent");
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  if (canonical === "page_view") {
    await prisma.storefrontVisit.create({
      data: {
        storefrontId: sf.id,
        path: path ?? "/",
        referrer: referrer ?? null,
        userAgentHash: hashOptional(ua),
        ipHash: hashOptional(ip),
      },
    });
  } else {
    await prisma.storefrontConversionEvent.create({
      data: {
        storefrontId: sf.id,
        eventName: canonical,
        metadataJson: metadata ?? undefined,
      },
    });
  }

  if (canonical === "checkout_submit") {
    const traceId = ensureTraceId(traceIdFromHeaders(request.headers));
    const experimentArm =
      typeof metadata?.experimentArm === "string"
        ? metadata.experimentArm
        : request.headers.get("x-kos-theme-arm");
    recordExperimentSpan({
      traceId,
      spanId: createExperimentSpanId(),
      parentSpanId: request.headers.get("x-kos-span-id"),
      name: "checkout_submit",
      fields: {
        store_slug: storeSlug,
        experiment_arm: experimentArm,
        path: path ?? null,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
