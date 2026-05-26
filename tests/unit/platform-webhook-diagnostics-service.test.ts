import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  webhookEvent: {
    findMany: vi.fn(),
  },
  workspace: {
    findMany: vi.fn(),
  },
  errorRecoveryItem: {
    findMany: vi.fn(),
  },
  webhookProcessingJob: {
    findMany: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import {
  listPlatformRecentWebhookEvents,
  listPlatformWebhookDlqItems,
} from "@/services/platform/platform-webhook-diagnostics-service";

describe("platform webhook diagnostics service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps recent webhook events to workspace drilldown links", async () => {
    const receivedAt = new Date("2026-05-25T20:00:00.000Z");

    prismaMock.webhookEvent.findMany.mockResolvedValueOnce([
      {
        id: "evt-1",
        provider: "SHOPIFY",
        topic: "orders/create",
        receivedAt,
        processed: false,
        signatureValid: true,
        processingError: "Queue failed after timeout",
        userId: "owner-1",
      },
    ]);
    prismaMock.workspace.findMany.mockResolvedValueOnce([
      {
        id: "ws-1",
        name: "North Kitchen",
        ownerUserId: "owner-1",
      },
    ]);

    const rows = await listPlatformRecentWebhookEvents(10);

    expect(rows).toEqual([
      expect.objectContaining({
        id: "evt-1",
        provider: "SHOPIFY",
        topic: "orders/create",
        workspaceId: "ws-1",
        workspaceName: "North Kitchen",
        workspaceHref: "/platform/workspaces/ws-1",
        integrationHealthHref: "/platform/workspaces/ws-1/integration-health",
        processingErrorPreview: "Queue failed after timeout",
        processingErrorRedacted: false,
        receivedAt,
      }),
    ]);
  });

  it("hydrates DLQ rows with job and event metadata for replay triage", async () => {
    const updatedAt = new Date("2026-05-25T20:10:00.000Z");
    const receivedAt = new Date("2026-05-25T19:58:00.000Z");

    prismaMock.errorRecoveryItem.findMany.mockResolvedValueOnce([
      {
        id: "eri-1",
        workspaceId: "ws-1",
        userId: "owner-1",
        provider: "WOOCOMMERCE",
        eventType: "product.updated",
        webhookEventId: "evt-1",
        webhookJobId: "job-1",
        suggestedAction: "Fix connector health first.",
        safeRetryHref: "/dashboard/sales-channels/webhooks",
        lastError: "Job exhausted retries",
        attempts: 4,
        maxAttempts: 4,
        updatedAt,
        workspace: {
          id: "ws-1",
          name: "North Kitchen",
        },
      },
    ]);
    prismaMock.webhookProcessingJob.findMany.mockResolvedValueOnce([
      {
        id: "job-1",
        status: "FAILED",
        lastError: "Job exhausted retries",
        nextAttemptAt: null,
      },
    ]);
    prismaMock.webhookEvent.findMany.mockResolvedValueOnce([
      {
        id: "evt-1",
        topic: "product.updated",
        receivedAt,
        signatureValid: false,
        processed: false,
        processingError: "Signature mismatch",
      },
    ]);

    const rows = await listPlatformWebhookDlqItems(10);

    expect(rows).toEqual([
      expect.objectContaining({
        id: "eri-1",
        workspaceId: "ws-1",
        workspaceName: "North Kitchen",
        workspaceHref: "/platform/workspaces/ws-1",
        integrationHealthHref: "/platform/workspaces/ws-1/integration-health",
        provider: "WOOCOMMERCE",
        eventType: "product.updated",
        webhookEventId: "evt-1",
        webhookJobId: "job-1",
        jobStatus: "FAILED",
        signatureValid: false,
        processed: false,
        attempts: 4,
        maxAttempts: 4,
        suggestedAction: "Fix connector health first.",
        safeRetryHref: "/dashboard/sales-channels/webhooks",
        lastErrorPreview: "Job exhausted retries",
        lastErrorRedacted: false,
        receivedAt,
        updatedAt,
      }),
    ]);
  });
});
