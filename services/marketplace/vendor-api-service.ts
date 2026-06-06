import { createHash, randomUUID } from "crypto";

import {
  isVendorWebhookEvent,
  sampleWebhookPayload,
  type VendorWebhookDeliveryPayload,
  type VendorWebhookEvent,
} from "@/lib/marketplace/vendor-api-types";
import { parseVendorCabinetSettings, type VendorWebhookConfig } from "@/lib/marketplace/vendor-settings-types";
import { mapWithConcurrency } from "@/lib/async/map-with-concurrency";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import {
  addVendorWebhook,
  generateVendorApiKey,
  validateVendorApiKey,
} from "@/services/marketplace/vendor-settings-service";

type VendorWebhookConfigWithSecret = VendorWebhookConfig & { secretHash?: string | null };

function hashSecret(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function signPayload(secretHash: string, body: string): string {
  return createHash("sha256").update(`${secretHash}:${body}`).digest("hex");
}

function parseAuthorizedApiKey(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length).trim();
  }
  const direct = request.headers.get("x-vendor-api-key");
  return direct?.trim() || null;
}

export async function resolveVendorFromApiKey(
  apiKey: string,
): Promise<{ vendorId: string; companyName: string } | null> {
  if (!apiKey.startsWith("vk_")) return null;

  const vendors = await prisma.vendor.findMany({
    where: { status: "APPROVED" },
    select: { id: true, companyName: true, documents: true },
    take: 500,
  });

  for (const vendor of vendors) {
    if (validateVendorApiKey(vendor.documents, apiKey)) {
      return { vendorId: vendor.id, companyName: vendor.companyName };
    }
  }

  return null;
}

export async function authenticateVendorApiRequest(
  request: Request,
): Promise<{ vendorId: string; companyName: string } | null> {
  const apiKey = parseAuthorizedApiKey(request);
  if (!apiKey) return null;
  return resolveVendorFromApiKey(apiKey);
}

function loadVendorWebhooks(documents: unknown): VendorWebhookConfigWithSecret[] {
  const settings = parseVendorCabinetSettings(documents);
  return settings.webhooks as VendorWebhookConfigWithSecret[];
}

export async function listVendorWebhooks(vendorId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { documents: true },
  });
  if (!vendor) return [];

  return loadVendorWebhooks(vendor.documents).map((hook) => ({
    id: hook.id,
    url: hook.url,
    events: hook.events,
    secretPreview: hook.secretPreview,
    createdAt: hook.createdAt,
    active: hook.active,
  }));
}

export async function dispatchVendorWebhookEvent(input: {
  vendorId: string;
  event: VendorWebhookEvent;
  data: Record<string, unknown>;
}): Promise<{ delivered: number; failed: number }> {
  const vendor = await prisma.vendor.findUnique({
    where: { id: input.vendorId },
    select: { documents: true },
  });
  if (!vendor) return { delivered: 0, failed: 0 };

  const hooks = loadVendorWebhooks(vendor.documents).filter(
    (hook) => hook.active && hook.events.includes(input.event) && hook.secretHash,
  );

  if (hooks.length === 0) return { delivered: 0, failed: 0 };

  const payload: VendorWebhookDeliveryPayload = {
    id: randomUUID(),
    event: input.event,
    createdAt: new Date().toISOString(),
    vendorId: input.vendorId,
    data: input.data,
  };
  const body = JSON.stringify(payload);

  const deliveryResults = await mapWithConcurrency(hooks, 5, async (hook) => {
    try {
      const signature = signPayload(hook.secretHash!, body);
      const response = await fetch(hook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-KitchenOS-Event": input.event,
          "X-KitchenOS-Signature": signature,
          "User-Agent": "KitchenOS-VendorWebhook/1.0",
        },
        body,
        signal: AbortSignal.timeout(10_000),
      });
      return response.ok;
    } catch (error) {
      logger.warn("[vendor-api] webhook delivery failed", { hookId: hook.id, error });
      return false;
    }
  });

  let delivered = 0;
  let failed = 0;
  for (const ok of deliveryResults) {
    if (ok) delivered += 1;
    else failed += 1;
  }

  return { delivered, failed };
}

export async function handleVendorApiAction(input: {
  vendorId: string;
  action: string;
  url?: string;
  events?: string[];
  webhookId?: string;
  event?: string;
}): Promise<
  | { ok: true; result: Record<string, unknown> }
  | { ok: false; error: string; status?: number }
> {
  switch (input.action) {
    case "list_webhooks": {
      const webhooks = await listVendorWebhooks(input.vendorId);
      return { ok: true, result: { webhooks } };
    }
    case "generate_api_key": {
      const created = await generateVendorApiKey(input.vendorId);
      if (!created.ok) return { ok: false, error: created.error, status: 400 };
      return {
        ok: true,
        result: {
          apiKey: created.apiKey,
          preview: created.preview,
          createdAt: new Date().toISOString(),
        },
      };
    }
    case "register_webhook": {
      if (!input.url) return { ok: false, error: "url is required.", status: 400 };
      const events = (input.events ?? []).filter(isVendorWebhookEvent);
      if (events.length === 0) {
        return { ok: false, error: "At least one valid webhook event is required.", status: 400 };
      }
      const created = await addVendorWebhook({
        vendorId: input.vendorId,
        url: input.url,
        events,
      });
      if (!created.ok) return { ok: false, error: created.error, status: 400 };
      return {
        ok: true,
        result: {
          webhook: created.webhook,
          secret: created.secret,
        },
      };
    }
    case "test_webhook": {
      const event = input.event && isVendorWebhookEvent(input.event) ? input.event : "new_order";
      const payload = sampleWebhookPayload(event, input.vendorId);
      const result = await dispatchVendorWebhookEvent({
        vendorId: input.vendorId,
        event,
        data: payload.data,
      });
      return { ok: true, result: { event, ...result } };
    }
    default:
      return { ok: false, error: "Unknown action.", status: 400 };
  }
}

export { generateVendorApiKey, validateVendorApiKey } from "@/services/marketplace/vendor-settings-service";

export function hashWebhookSecret(secret: string): string {
  return hashSecret(secret);
}
