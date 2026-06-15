import { createHash, randomBytes } from "crypto";
import { describe, expect, it } from "vitest";

import {
  buildVendorMarketplaceOpenApiSpec,
  isVendorWebhookEvent,
  sampleWebhookPayload,
} from "@/lib/marketplace/vendor-api-types";
import { validateVendorApiKey } from "@/services/marketplace/vendor-api-service";
import { defaultVendorCabinetSettings, mergeCabinetSettingsIntoDocuments } from "@/lib/marketplace/vendor-settings-types";

describe("marketplace vendor api types", () => {
  it("builds OpenAPI spec with vendor webhook path", () => {
    const spec = buildVendorMarketplaceOpenApiSpec("https://example.test");
    expect(spec.openapi).toBe("3.1.0");
    expect(spec.paths["/api/vendor/webhooks"]?.post).toBeDefined();
    expect(spec["x-webhook-events"]).toHaveLength(4);
  });

  it("validates webhook event names", () => {
    expect(isVendorWebhookEvent("new_order")).toBe(true);
    expect(isVendorWebhookEvent("unknown")).toBe(false);
  });

  it("builds sample webhook payloads", () => {
    const payload = sampleWebhookPayload("payout_processed", "vendor-1");
    expect(payload.event).toBe("payout_processed");
    expect(payload.vendorId).toBe("vendor-1");
    expect(payload.data.amount).toBeDefined();
  });
});

describe("validateVendorApiKey", () => {
  it("matches hashed vendor api keys in cabinet settings", () => {
    const raw = `vk_${randomBytes(8).toString("hex")}`;
    const hash = createHash("sha256").update(raw).digest("hex");
    const documents = mergeCabinetSettingsIntoDocuments([], {
      ...defaultVendorCabinetSettings(),
      apiKeyHash: hash,
    });
    expect(validateVendorApiKey(documents, raw)).toBe(true);
    expect(validateVendorApiKey(documents, "vk_invalid")).toBe(false);
  });
});
