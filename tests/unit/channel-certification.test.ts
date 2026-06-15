import { describe, expect, it, vi, beforeEach } from "vitest";

import {
  certificationSignOffComplete,
  parseCertificationRecord,
} from "@/lib/integrations/channel-certification-types";

vi.mock("@/lib/crypto", () => ({
  isEncryptionConfigured: () => true,
  decryptOptional: (v: string | null) => v,
}));

const mockAsyncQueue = vi.fn(() => true);
vi.mock("@/lib/webhooks/webhook-queue-mode", () => ({
  isWebhookAsyncQueueEnabled: () => mockAsyncQueue(),
}));

const mockCount = vi.fn();
const mockFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    webhookEvent: {
      count: (...args: unknown[]) => mockCount(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
    integrationConnection: {
      update: vi.fn(),
    },
  },
}));

vi.mock("@/services/integrations/woocommerce", () => ({
  testConnection: vi.fn(async () => ({ ok: true, message: "ok" })),
  verifyWebhookSignature: vi.fn(() => true),
}));

vi.mock("@/services/integrations/shopify", () => ({
  testConnection: vi.fn(async () => ({ ok: true, message: "ok" })),
  verifyShopifyHmac: vi.fn(() => true),
}));

import { runChannelCertification } from "@/services/integrations/channel-certification-runner";
import { IntegrationProvider, IntegrationStatus } from "@prisma/client";

describe("channel certification", () => {
  beforeEach(() => {
    mockCount.mockReset();
    mockFindMany.mockReset();
    mockCount.mockResolvedValue(0);
    mockFindMany.mockResolvedValue([]);
    mockAsyncQueue.mockReturnValue(true);
  });

  it("parses certification from settingsJson", () => {
    const rec = parseCertificationRecord({
      certification: {
        provider: "woocommerce",
        lastRunAt: "2026-01-01T00:00:00.000Z",
        overall: "PASS",
        productStatus: "BETA",
        checks: [],
      },
    });
    expect(rec?.overall).toBe("PASS");
  });

  it("sign-off complete requires all three roles", () => {
    expect(certificationSignOffComplete({})).toBe(false);
    expect(
      certificationSignOffComplete({
        engineeringAt: "a",
        securityAt: "b",
        pilotAt: "c",
      }),
    ).toBe(true);
  });

  it("fails woo certification without credentials", async () => {
    const record = await runChannelCertification(
      {
        id: "c1",
        userId: "u1",
        provider: IntegrationProvider.WOOCOMMERCE,
        name: "Test",
        status: IntegrationStatus.CONNECTED,
        baseUrl: null,
        shopDomain: null,
        consumerKeyEncrypted: null,
        consumerSecretEncrypted: null,
        webhookSecretEncrypted: null,
        accessTokenEncrypted: null,
        settingsJson: null,
      } as never,
      { skipLiveApi: true },
    );
    expect(record.overall).toBe("FAIL");
    expect(record.checks.some((c) => c.id === "credentials_present" && c.status === "fail")).toBe(
      true,
    );
  });

  it("passes woo with credentials and valid webhooks", async () => {
    mockCount.mockImplementation(async (args: { where?: { signatureValid?: boolean } }) => {
      if (args?.where?.signatureValid === true) return 2;
      return 0;
    });

    const record = await runChannelCertification(
      {
        id: "c1",
        userId: "u1",
        provider: IntegrationProvider.WOOCOMMERCE,
        name: "Test",
        status: IntegrationStatus.CONNECTED,
        baseUrl: "https://shop.example.com",
        shopDomain: null,
        consumerKeyEncrypted: "key",
        consumerSecretEncrypted: "secret",
        webhookSecretEncrypted: "whsec",
        accessTokenEncrypted: null,
        settingsJson: null,
      } as never,
      { skipLiveApi: true },
    );
    expect(record.overall).toBe("PASS");
    expect(record.productStatus).toBe("BETA");
  });
});
