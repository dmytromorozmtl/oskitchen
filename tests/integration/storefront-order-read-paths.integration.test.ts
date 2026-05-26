import { randomUUID } from "node:crypto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const enforceStorefrontRateLimitFromRequest = vi.hoisted(() => vi.fn());
const enforceStorefrontRouteRateLimit = vi.hoisted(() => vi.fn());
const verifyTurnstileToken = vi.hoisted(() => vi.fn());
const createClient = vi.hoisted(() => vi.fn());
const getStorefrontCustomerSession = vi.hoisted(() => vi.fn());
const recordBillingEvent = vi.hoisted(() => vi.fn());
const sendOrderConfirmation = vi.hoisted(() => vi.fn());

vi.mock("@/lib/storefront/storefront-rate-limit", () => ({
  enforceStorefrontRateLimitFromRequest,
  enforceStorefrontRouteRateLimit,
}));
vi.mock("@/lib/storefront/turnstile", () => ({ verifyTurnstileToken }));
vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("@/lib/storefront/storefront-customer-session", () => ({
  getStorefrontCustomerSession,
}));
vi.mock("@/services/billing/billing-service", () => ({ recordBillingEvent }));
vi.mock("@/lib/email", () => ({ sendOrderConfirmation }));

import { POST as postGuestLookup } from "@/app/api/storefront/account/orders/route";
import { GET as getAccountSessionOrders } from "@/app/api/storefront/account/session/route";
import { POST as postGuestAccountOtp } from "@/app/api/storefront/guest-account/route";
import { persistResolvedOrder } from "@/services/orders/order-creation-service";
import { applyStorefrontOrderCheckoutCompleted } from "@/services/storefront/storefront-stripe-checkout-service";
import { prisma } from "@/lib/prisma";
import { buildCartSnapshotEnvelope } from "@/lib/storefront/cart-snapshot";
import { encryptStorefrontOrderPiiFields } from "@/lib/storefront/storefront-order-pii";

const run =
  process.env.RUN_DB_INTEGRATION === "1" &&
  Boolean(process.env.DATABASE_URL?.trim());
const ENCRYPTION_KEY_B64 = Buffer.alloc(32, 23).toString("base64");

type Fixture = {
  ownerId: string;
  workspaceId: string;
  storefrontId: string;
  storeSlug: string;
  storefrontOrderId: string;
  publicToken: string;
  orderEmail: string;
  customerName: string;
  internalOrderId?: string;
};

const cleanupUserIds = new Set<string>();
const cleanupWorkspaceIds = new Set<string>();
const cleanupStorefrontIds = new Set<string>();

async function createStorefrontOwner(tag: string) {
  const suffix = randomUUID().slice(0, 8);
  const ownerId = randomUUID();
  const storeSlug = `sf-read-${suffix}`;

  await prisma.userProfile.create({
    data: {
      id: ownerId,
      email: `${tag}-${suffix}@example.com`,
      fullName: `Owner ${tag} ${suffix}`,
      role: "OWNER",
    },
  });
  const workspace = await prisma.workspace.create({
    data: {
      ownerUserId: ownerId,
      name: `Workspace ${tag} ${suffix}`,
    },
    select: { id: true },
  });
  const storefront = await prisma.storefrontSettings.create({
    data: {
      userId: ownerId,
      workspaceId: workspace.id,
      storeSlug,
      publicName: `Store ${suffix}`,
      enabled: true,
      published: true,
      preorderEnabled: true,
      pickupEnabled: true,
      deliveryEnabled: false,
      payLaterOnly: true,
      currency: "USD",
      timezone: "UTC",
    },
    select: { id: true },
  });

  cleanupUserIds.add(ownerId);
  cleanupWorkspaceIds.add(workspace.id);
  cleanupStorefrontIds.add(storefront.id);

  return {
    ownerId,
    workspaceId: workspace.id,
    storefrontId: storefront.id,
    storeSlug,
  };
}

async function createEncryptedStorefrontOrderFixture(tag: string): Promise<Fixture> {
  const owner = await createStorefrontOwner(tag);
  const customerName = `Guest ${tag}`;
  const orderEmail = `${tag}.guest@example.com`;
  const publicToken = `sfo_${randomUUID().replaceAll("-", "")}`;
  const pii = encryptStorefrontOrderPiiFields({
    customerName,
    customerEmail: orderEmail,
    customerPhone: "+15550000010",
  });

  const storefrontOrder = await prisma.storefrontOrder.create({
    data: {
      userId: owner.ownerId,
      workspaceId: owner.workspaceId,
      storefrontId: owner.storefrontId,
      publicToken,
      orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}`,
      customerName: pii.customerName!,
      customerEmail: pii.customerEmail!,
      customerPhone: pii.customerPhone ?? undefined,
      fulfillmentType: "PICKUP",
      subtotal: 18.5,
      tax: 0,
      deliveryFee: 0,
      discount: 0,
      total: 18.5,
      paymentMode: "PAY_LATER",
      paymentStatus: "NOT_REQUIRED",
      status: "SUBMITTED",
      cartJson: buildCartSnapshotEnvelope({
        marketId: "default",
        lines: [
          {
            productId: randomUUID(),
            title: "Read path item",
            quantity: 1,
            unitPrice: 18.5,
          },
        ],
      }),
      source: "storefront:market:default",
      lineItems: {
        create: [
          {
            title: "Read path item",
            quantity: 1,
            unitPrice: 18.5,
            total: 18.5,
          },
        ],
      },
    },
    select: { id: true },
  });

  return {
    ...owner,
    storefrontOrderId: storefrontOrder.id,
    publicToken,
    orderEmail,
    customerName,
  };
}

async function createPaidCheckoutFixture(tag: string): Promise<Fixture> {
  const owner = await createStorefrontOwner(tag);
  const customerName = `Paid ${tag}`;
  const orderEmail = `${tag}.paid@example.com`;

  await prisma.kitchenSettings.create({
    data: {
      userId: owner.ownerId,
      workspaceId: owner.workspaceId,
      businessName: "KitchenOS Test Kitchen",
      notifyOrderConfirmation: true,
      notifyPreorderReminder: false,
      notifyPickupReminder: false,
      notifyDeliveryReminder: false,
      timezone: "UTC",
      locale: "en",
    },
  });

  const createdOrder = await persistResolvedOrder(
    {
      userId: owner.ownerId,
      workspaceId: owner.workspaceId,
    },
    {
      orderType: "STOREFRONT_ORDER",
      creationSource: "STOREFRONT",
      statusKey: "REQUESTED",
      paymentMode: "STRIPE_PLACEHOLDER",
      workspaceId: owner.workspaceId,
      customerName,
      customerEmail: orderEmail,
      fulfillmentDetail: "PICKUP",
      subtotal: 18.5,
      total: 18.5,
      lines: [
        {
          productId: null,
          title: "Stripe item",
          sku: undefined,
          quantity: 1,
          unitPrice: 18.5,
          lineTotal: 18.5,
          notes: undefined,
          preparedDate: null,
          modifiersJson: null,
          sourceMappingId: null,
        },
      ],
    },
  );

  const pii = encryptStorefrontOrderPiiFields({
    customerName,
    customerEmail: orderEmail,
    customerPhone: null,
  });
  const publicToken = `paid_${randomUUID().replaceAll("-", "")}`;
  const storefrontOrder = await prisma.storefrontOrder.create({
    data: {
      userId: owner.ownerId,
      workspaceId: owner.workspaceId,
      storefrontId: owner.storefrontId,
      internalOrderId: createdOrder.orderId,
      publicToken,
      orderNumber: `PAID-${Date.now().toString(36).toUpperCase()}`,
      customerName: pii.customerName!,
      customerEmail: pii.customerEmail!,
      fulfillmentType: "PICKUP",
      subtotal: 18.5,
      tax: 0,
      deliveryFee: 0,
      discount: 0,
      total: 18.5,
      paymentMode: "ONLINE_PAYMENT",
      paymentStatus: "PENDING",
      status: "SUBMITTED",
      cartJson: buildCartSnapshotEnvelope({
        marketId: "default",
        lines: [
          {
            productId: randomUUID(),
            title: "Stripe item",
            quantity: 1,
            unitPrice: 18.5,
          },
        ],
      }),
      source: "storefront:market:default",
      lineItems: {
        create: [
          {
            title: "Stripe item",
            quantity: 1,
            unitPrice: 18.5,
            total: 18.5,
          },
        ],
      },
    },
    select: { id: true },
  });

  return {
    ...owner,
    storefrontOrderId: storefrontOrder.id,
    publicToken,
    orderEmail,
    customerName,
    internalOrderId: createdOrder.orderId,
  };
}

describe.skipIf(!run)("storefront order encrypted read paths", () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = ENCRYPTION_KEY_B64;
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    vi.clearAllMocks();

    enforceStorefrontRateLimitFromRequest.mockResolvedValue({ ok: true });
    enforceStorefrontRouteRateLimit.mockResolvedValue({ ok: true });
    verifyTurnstileToken.mockResolvedValue({ ok: true });
    recordBillingEvent.mockResolvedValue(undefined);
    sendOrderConfirmation.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    const userIds = Array.from(cleanupUserIds);
    const workspaceIds = Array.from(cleanupWorkspaceIds);
    const storefrontIds = Array.from(cleanupStorefrontIds);
    cleanupUserIds.clear();
    cleanupWorkspaceIds.clear();
    cleanupStorefrontIds.clear();

    if (storefrontIds.length > 0) {
      await prisma.storefrontConversionEvent.deleteMany({
        where: { storefrontId: { in: storefrontIds } },
      });
      await prisma.storefrontCustomer.deleteMany({
        where: { storefrontId: { in: storefrontIds } },
      });
      await prisma.storefrontOrder.deleteMany({
        where: { storefrontId: { in: storefrontIds } },
      });
      await prisma.storefrontSettings.deleteMany({
        where: { id: { in: storefrontIds } },
      });
    }
    if (userIds.length > 0) {
      await prisma.kitchenSettings.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.order.deleteMany({
        where: { userId: { in: userIds } },
      });
    }
    if (workspaceIds.length > 0) {
      await prisma.workspace.deleteMany({
        where: { id: { in: workspaceIds } },
      });
    }
    if (userIds.length > 0) {
      await prisma.userProfile.deleteMany({
        where: { id: { in: userIds } },
      });
    }
  });

  it("guest order lookup returns orders when storefront sidecar email is encrypted", async () => {
    const fixture = await createEncryptedStorefrontOrderFixture("guest-lookup");

    const response = await postGuestLookup(
      new Request("http://localhost/api/storefront/account/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          storeSlug: fixture.storeSlug,
          email: fixture.orderEmail.toUpperCase(),
        }),
      }),
    );
    expect(response.status).toBe(200);
    const json = (await response.json()) as {
      ok: boolean;
      orders: Array<{ token: string }>;
    };
    expect(json.ok).toBe(true);
    expect(json.orders.map((o) => o.token)).toContain(fixture.publicToken);
  });

  it("signed-in account session returns orders through linked storefront customer lookup", async () => {
    const fixture = await createEncryptedStorefrontOrderFixture("session-orders");
    await prisma.storefrontCustomer.create({
      data: {
        storefrontId: fixture.storefrontId,
        email: fixture.orderEmail,
        supabaseUserId: "supabase-user-1",
      },
    });
    getStorefrontCustomerSession.mockResolvedValue({
      storefrontId: fixture.storefrontId,
      storeSlug: fixture.storeSlug,
      publicName: "Store",
      email: "alias@example.com",
      supabaseUserId: "supabase-user-1",
    });

    const response = await getAccountSessionOrders(
      new Request(
        `http://localhost/api/storefront/account/session?storeSlug=${encodeURIComponent(
          fixture.storeSlug,
        )}`,
      ),
    );
    expect(response.status).toBe(200);
    const json = (await response.json()) as {
      ok: boolean;
      email: string;
      orders: Array<{ token: string }>;
    };
    expect(json.ok).toBe(true);
    expect(json.email).toBe("alias@example.com");
    expect(json.orders.map((o) => o.token)).toContain(fixture.publicToken);
  });

  it("guest account OTP flow decrypts storefront order email before sending sign-in link", async () => {
    const fixture = await createEncryptedStorefrontOrderFixture("guest-otp");
    const signInWithOtp = vi.fn().mockResolvedValue({ error: null });
    createClient.mockResolvedValue({
      auth: { signInWithOtp },
    });

    const response = await postGuestAccountOtp(
      new Request("http://localhost/api/storefront/guest-account", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          storeSlug: fixture.storeSlug,
          orderToken: fixture.publicToken,
        }),
      }),
    );
    expect(response.status).toBe(200);
    expect(signInWithOtp).toHaveBeenCalledWith({
      email: fixture.orderEmail,
      options: {
        emailRedirectTo:
          "http://localhost:3000/auth/callback?next=%2Fdashboard",
      },
    });
  });

  it("stripe completion decrypts storefront sidecar PII for confirmation email and marks payment paid", async () => {
    const fixture = await createPaidCheckoutFixture("stripe-read");

    await applyStorefrontOrderCheckoutCompleted(
      {
        id: "cs_test_123",
        metadata: {
          purpose: "storefront_order",
          storefrontOrderId: fixture.storefrontOrderId,
        },
        payment_status: "paid",
        amount_total: 1850,
        currency: "usd",
      } as never,
      { stripeEventId: "evt_test_123" },
    );

    const storefrontOrder = await prisma.storefrontOrder.findUnique({
      where: { id: fixture.storefrontOrderId },
      select: {
        paymentStatus: true,
        paymentMode: true,
        status: true,
      },
    });
    expect(storefrontOrder).toEqual({
      paymentStatus: "PAID",
      paymentMode: "ONLINE_PAYMENT",
      status: "CONFIRMED",
    });

    const order = await prisma.order.findUnique({
      where: { id: fixture.internalOrderId! },
      select: {
        paymentStatus: true,
        paymentMode: true,
        status: true,
      },
    });
    expect(order).toEqual({
      paymentStatus: "paid",
      paymentMode: "storefront_stripe_checkout",
      status: "CONFIRMED",
    });

    expect(sendOrderConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        to: fixture.orderEmail,
        customerName: fixture.customerName,
        orderId: fixture.internalOrderId,
      }),
    );
    expect(recordBillingEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: fixture.ownerId,
        eventType: "STOREFRONT_STRIPE_CHECKOUT_PAID",
      }),
    );
  });
});
