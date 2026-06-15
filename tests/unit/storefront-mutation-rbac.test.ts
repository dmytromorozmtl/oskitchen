import { beforeEach, describe, expect, it, vi } from "vitest";

const requireStorefrontAdminPermission = vi.hoisted(() => vi.fn());
const requireAdminStorefrontRow = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const createStorefrontConnectAccountLink = vi.hoisted(() => vi.fn());

vi.mock("@/lib/storefront/storefront-admin-access", () => ({
  requireStorefrontAdminPermission,
}));
vi.mock("@/lib/storefront/require-admin-storefront", () => ({
  requireAdminStorefrontRow,
}));
vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor,
}));
vi.mock("@/services/storefront/storefront-stripe-connect-service", () => ({
  createStorefrontConnectAccountLink,
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    storefrontPage: { findFirst: vi.fn().mockResolvedValue(null) },
  },
}));
vi.mock("@/services/storefront/webhook-delivery-log-service", () => ({
  getWebhookDeliveryEventForStorefront: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/lib/storefront/storefront-webhook", () => ({
  dispatchStorefrontPagePublishedWebhook: vi.fn(),
}));

import { startStorefrontStripeConnectAction } from "@/actions/storefront-stripe-connect";
import { redeliverPagePublishWebhookFormAction } from "@/actions/storefront-webhook-delivery";

describe("storefront mutation RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireStorefrontAdminPermission.mockResolvedValue({
      ok: true,
      isOwner: true,
      workspaceRole: "OWNER",
      permissions: ["storefront.settings"],
      storefront: {
        id: "sf-1",
        storeSlug: "demo",
        userId: "owner-1",
        workspaceId: "ws-1",
      },
    });
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "owner-1" },
      userId: "owner-1",
    });
    createStorefrontConnectAccountLink.mockResolvedValue({ ok: true, url: "https://stripe.test/connect" });
    requireAdminStorefrontRow.mockResolvedValue({
      access: { storefront: { id: "sf-1" } },
      sf: {
        id: "sf-1",
        storeSlug: "demo",
        pagePublishWebhookUrl: "https://hooks.example/publish",
        pagePublishWebhookSecret: "secret",
      },
    });
  });

  it("requires storefront.settings before Stripe Connect onboarding", async () => {
    requireStorefrontAdminPermission.mockRejectedValue(new Error("You do not have permission for this action."));

    await expect(startStorefrontStripeConnectAction()).rejects.toThrow(
      "You do not have permission for this action.",
    );
    expect(createStorefrontConnectAccountLink).not.toHaveBeenCalled();
  });

  it("allows Stripe Connect when storefront.settings is granted", async () => {
    const result = await startStorefrontStripeConnectAction();

    expect(requireStorefrontAdminPermission).toHaveBeenCalledWith("storefront.settings");
    expect(createStorefrontConnectAccountLink).toHaveBeenCalledWith("owner-1");
    expect(result).toEqual({ ok: true, url: "https://stripe.test/connect" });
  });

  it("gates webhook redelivery on storefront.settings admin row", async () => {
    const fd = new FormData();
    fd.set("eventId", "evt-1");
    await redeliverPagePublishWebhookFormAction(fd);

    expect(requireAdminStorefrontRow).toHaveBeenCalledWith(
      "storefront.settings",
      expect.objectContaining({
        id: true,
        storeSlug: true,
        pagePublishWebhookUrl: true,
        pagePublishWebhookSecret: true,
      }),
    );
  });
});
