import { VENDOR_WEBHOOK_EVENTS } from "@/lib/marketplace/vendor-settings-types";

export type VendorWebhookEvent = (typeof VENDOR_WEBHOOK_EVENTS)[number];

export type VendorWebhookDeliveryPayload = {
  id: string;
  event: VendorWebhookEvent;
  createdAt: string;
  vendorId: string;
  data: Record<string, unknown>;
};

export type VendorApiAction = "register_webhook" | "generate_api_key" | "test_webhook" | "list_webhooks";

export function isVendorWebhookEvent(value: string): value is VendorWebhookEvent {
  return (VENDOR_WEBHOOK_EVENTS as readonly string[]).includes(value);
}

export function buildVendorMarketplaceOpenApiSpec(baseUrl = "https://app.kitchenos.com") {
  return {
    openapi: "3.1.0",
    info: {
      title: "KitchenOS Marketplace Vendor API",
      version: "1.0.0",
      description:
        "Programmatic vendor cabinet API for webhook registration, API keys, and outbound event delivery.",
    },
    servers: [{ url: baseUrl }],
    components: {
      securitySchemes: {
        vendorApiKey: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "vk_…",
          description: "Vendor API key from vendor settings or generate_api_key action",
        },
      },
      schemas: {
        VendorWebhookEvent: {
          type: "string",
          enum: [...VENDOR_WEBHOOK_EVENTS],
        },
        WebhookRegistration: {
          type: "object",
          required: ["url", "events"],
          properties: {
            url: { type: "string", format: "uri" },
            events: {
              type: "array",
              items: { $ref: "#/components/schemas/VendorWebhookEvent" },
            },
          },
        },
      },
    },
    paths: {
      "/api/vendor/webhooks": {
        get: {
          tags: ["vendor"],
          summary: "Vendor API metadata and OpenAPI document",
          parameters: [
            {
              name: "openapi",
              in: "query",
              schema: { type: "string", enum: ["1"] },
              description: "Return OpenAPI JSON when set to 1",
            },
          ],
          responses: {
            "200": { description: "API metadata or OpenAPI spec" },
          },
        },
        post: {
          tags: ["vendor"],
          summary: "Vendor API actions (register webhook, generate key, test delivery)",
          security: [{ vendorApiKey: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["action"],
                  properties: {
                    action: {
                      type: "string",
                      enum: ["register_webhook", "generate_api_key", "test_webhook", "list_webhooks"],
                    },
                    url: { type: "string" },
                    events: {
                      type: "array",
                      items: { $ref: "#/components/schemas/VendorWebhookEvent" },
                    },
                    webhookId: { type: "string" },
                    event: { $ref: "#/components/schemas/VendorWebhookEvent" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Action completed" },
            "401": { description: "Invalid vendor API key" },
            "400": { description: "Invalid request" },
          },
        },
      },
    },
    "x-webhook-events": VENDOR_WEBHOOK_EVENTS.map((event) => ({
      event,
      description: webhookEventDescription(event),
    })),
  };
}

function webhookEventDescription(event: VendorWebhookEvent): string {
  switch (event) {
    case "new_order":
      return "Fired when a buyer submits a marketplace purchase order to the vendor.";
    case "order_cancelled":
      return "Fired when a marketplace order is cancelled before fulfillment completes.";
    case "inventory_low":
      return "Fired when a vendor SKU drops below its configured minimum stock alert.";
    case "payout_processed":
      return "Fired when a vendor payout batch is marked paid out.";
    default:
      return event;
  }
}

export function sampleWebhookPayload(
  event: VendorWebhookEvent,
  vendorId: string,
): VendorWebhookDeliveryPayload {
  const createdAt = new Date().toISOString();
  const base = { id: `evt_${Date.now()}`, event, createdAt, vendorId };

  switch (event) {
    case "new_order":
      return {
        ...base,
        data: {
          orderId: "00000000-0000-0000-0000-000000000001",
          poNumber: "MPO-1001",
          total: 420.5,
          currency: "USD",
          status: "SUBMITTED",
        },
      };
    case "order_cancelled":
      return {
        ...base,
        data: {
          orderId: "00000000-0000-0000-0000-000000000001",
          poNumber: "MPO-1001",
          reason: "buyer_cancelled",
        },
      };
    case "inventory_low":
      return {
        ...base,
        data: {
          productId: "00000000-0000-0000-0000-000000000002",
          sku: "SKU-001",
          stockQty: 2,
          minStockAlert: 5,
        },
      };
    case "payout_processed":
      return {
        ...base,
        data: {
          payoutId: "po_123",
          amount: 1250.75,
          currency: "USD",
          transactionCount: 4,
        },
      };
    default:
      return { ...base, data: {} };
  }
}
