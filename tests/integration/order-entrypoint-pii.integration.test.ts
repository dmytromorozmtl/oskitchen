import { randomUUID } from "node:crypto";

import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const requireUserProfile = vi.hoisted(() => vi.fn());
const requireMutationPermission = vi.hoisted(() => vi.fn());
const guardPublicApi = vi.hoisted(() => vi.fn());
const auditLog = vi.hoisted(() => vi.fn());
const upsertCustomerFromOrder = vi.hoisted(() => vi.fn());
const recomputeMetricsForOrderEmail = vi.hoisted(() => vi.fn());
const earnLoyaltyPointsForOrder = vi.hoisted(() => vi.fn());
const redeemLoyaltyPoints = vi.hoisted(() => vi.fn());
const canUseFeature = vi.hoisted(() => vi.fn());
const logPosCheckoutAnalytics = vi.hoisted(() => vi.fn());
const syncPosOrderToCrm = vi.hoisted(() => vi.fn());
const recordPendingInventoryImpactsForPosOrder = vi.hoisted(() => vi.fn());
const enqueueKitchenRoutingForPosOrder = vi.hoisted(() => vi.fn());
const buildPosReceiptText = vi.hoisted(() => vi.fn());
const redeemGiftCard = vi.hoisted(() => vi.fn());
const notifyNewOrderPush = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/auth", () => ({ requireUserProfile }));
vi.mock("@/lib/scope/require-tenant-actor", () => ({ requireTenantActor }));
vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));
vi.mock("@/lib/api-public/guard", () => ({
  guardPublicApi,
  isGuardError: (result: unknown) =>
    Boolean(result && typeof result === "object" && "response" in result),
}));
vi.mock("@/services/audit/audit-service", () => ({ auditLog }));
vi.mock("@/services/crm/customer-service", () => ({
  upsertCustomerFromOrder,
}));
vi.mock("@/services/crm/customer-metrics-service", () => ({
  recomputeMetricsForOrderEmail,
}));
vi.mock("@/services/loyalty/loyalty-service", () => ({
  earnLoyaltyPointsForOrder,
  redeemLoyaltyPoints,
}));
vi.mock("@/lib/plans/feature-registry", () => ({ canUseFeature }));
vi.mock("@/services/pos/pos-analytics-service", () => ({
  logPosCheckoutAnalytics,
}));
vi.mock("@/services/pos/pos-crm-service", () => ({ syncPosOrderToCrm }));
vi.mock("@/services/pos/pos-inventory-impact-service", () => ({
  recordPendingInventoryImpactsForPosOrder,
}));
vi.mock("@/services/pos/pos-kitchen-routing-service", () => ({
  enqueueKitchenRoutingForPosOrder,
}));
vi.mock("@/services/pos/pos-receipt-service", () => ({
  buildPosReceiptText,
}));
vi.mock("@/services/gift-cards/gift-card-service", () => ({
  redeemGiftCard,
}));
vi.mock("@/services/notifications/order-lifecycle-push", () => ({
  notifyNewOrderPush,
  notifyOrderReadyPush: vi.fn(),
}));
vi.mock("@/lib/email", () => ({
  sendDeliveryReminder: vi.fn(),
  sendOrderConfirmation: vi.fn(),
  sendOrderReady: vi.fn(),
  sendPickupReminder: vi.fn(),
  sendPreorderReminder: vi.fn(),
}));

import { isActionSuccess } from "@/lib/action-result";
import { decryptOrderPiiFields } from "@/lib/orders/order-pii";
import { prisma } from "@/lib/prisma";
import { createOrderViaCenterAction } from "@/actions/order-creation";
import { createOrder } from "@/actions/orders";
import { POST as postPublicOrder } from "@/app/api/public/v1/orders/route";
import { checkoutPosSale } from "@/services/pos/pos-checkout-service";
import { fetchDoorDashOrders } from "@/services/integrations/doordash/doordash-service";
import { assertOrderPiiEncrypted } from "@/tests/helpers/assert-order-pii-encrypted";

const run =
  process.env.RUN_DB_INTEGRATION === "1" &&
  Boolean(process.env.DATABASE_URL?.trim());
const ENCRYPTION_KEY_B64 = Buffer.alloc(32, 11).toString("base64");

type OwnerFixture = {
  ownerId: string;
  workspaceId: string;
  email: string;
};

const cleanupUserIds = new Set<string>();
const cleanupWorkspaceIds = new Set<string>();

async function createOwnerFixture(tag: string): Promise<OwnerFixture> {
  const suffix = randomUUID().slice(0, 8);
  const ownerId = randomUUID();
  const email = `${tag}-${suffix}@example.com`;

  await prisma.userProfile.create({
    data: {
      id: ownerId,
      email,
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

  cleanupUserIds.add(ownerId);
  cleanupWorkspaceIds.add(workspace.id);
  return { ownerId, workspaceId: workspace.id, email };
}

async function createActiveMenuProductFixture(owner: OwnerFixture) {
  const now = new Date("2026-05-25T12:00:00.000Z");
  const menu = await prisma.menu.create({
    data: {
      userId: owner.ownerId,
      workspaceId: owner.workspaceId,
      title: `Weekly Menu ${randomUUID().slice(0, 6)}`,
      startDate: new Date("2026-05-26T00:00:00.000Z"),
      endDate: new Date("2026-05-31T00:00:00.000Z"),
      preorderDeadline: now,
      active: true,
      published: true,
      catalogOnly: false,
    },
    select: { id: true },
  });

  const product = await prisma.product.create({
    data: {
      menuId: menu.id,
      workspaceId: owner.workspaceId,
      title: `Meal ${randomUUID().slice(0, 6)}`,
      preparedDate: new Date("2026-05-26T00:00:00.000Z"),
      price: 18.5,
      active: true,
      storefrontVisible: true,
      posVisible: true,
    },
    select: { id: true },
  });

  return { menuId: menu.id, productId: product.id };
}

async function createPosRegisterFixture(owner: OwnerFixture) {
  return prisma.pOSRegister.create({
    data: {
      userId: owner.ownerId,
      workspaceId: owner.workspaceId,
      name: `Register ${randomUUID().slice(0, 6)}`,
    },
    select: { id: true },
  });
}

async function createDoorDashConnectionFixture(owner: OwnerFixture) {
  return prisma.integrationConnection.create({
    data: {
      userId: owner.ownerId,
      workspaceId: owner.workspaceId,
      provider: "DOORDASH",
      name: "DoorDash",
      status: "CONNECTED",
      externalStoreId: process.env.DOORDASH_MERCHANT_ID ?? "merchant-test",
    },
    select: { id: true },
  });
}

async function loadOrder(orderId: string, ownerId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: ownerId },
    select: {
      id: true,
      workspaceId: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      channelProvider: true,
      externalOrderIdExt: true,
    },
  });
  expect(order).not.toBeNull();
  return order!;
}

describe.skipIf(!run)("order entrypoint PII integration", () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = ENCRYPTION_KEY_B64;
    process.env.API_KEY_HASH_SALT = "integration-pii-salt";
    process.env.DOORDASH_API_KEY = "dd-api-test";
    process.env.DOORDASH_MERCHANT_ID = "merchant-test";

    vi.clearAllMocks();

    requireUserProfile.mockResolvedValue({
      id: randomUUID(),
      role: "OWNER",
      email: "owner@example.com",
    });
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: randomUUID() },
      dataUserId: randomUUID(),
    });
    requireMutationPermission.mockResolvedValue({
      ok: true,
      actor: {
        userId: randomUUID(),
        workspaceId: randomUUID(),
        sessionUser: { id: randomUUID() },
      },
    });
    guardPublicApi.mockResolvedValue({ userId: randomUUID() });
    auditLog.mockResolvedValue(undefined);
    upsertCustomerFromOrder.mockResolvedValue(undefined);
    recomputeMetricsForOrderEmail.mockResolvedValue(undefined);
    earnLoyaltyPointsForOrder.mockResolvedValue(undefined);
    redeemLoyaltyPoints.mockResolvedValue({ discount: 0 });
    canUseFeature.mockResolvedValue({ allowed: true });
    logPosCheckoutAnalytics.mockResolvedValue(undefined);
    syncPosOrderToCrm.mockResolvedValue(undefined);
    recordPendingInventoryImpactsForPosOrder.mockResolvedValue(undefined);
    enqueueKitchenRoutingForPosOrder.mockResolvedValue(undefined);
    buildPosReceiptText.mockReturnValue("receipt-text");
    redeemGiftCard.mockResolvedValue({ applied: 0 });
    notifyNewOrderPush.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    const userIds = Array.from(cleanupUserIds);
    const workspaceIds = Array.from(cleanupWorkspaceIds);
    cleanupUserIds.clear();
    cleanupWorkspaceIds.clear();
    if (userIds.length > 0) {
      await prisma.pOSAuditEvent.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.pOSTransaction.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.pOSRegister.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.externalOrder.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.webhookEvent.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.integrationConnection.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.order.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.menu.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.kitchenSettings.deleteMany({
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

  it("stores encrypted PII when the generic order-center action creates an order", async () => {
    const owner = await createOwnerFixture("center-action");
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: owner.ownerId },
      dataUserId: owner.ownerId,
    });
    requireUserProfile.mockResolvedValue({
      id: owner.ownerId,
      role: "OWNER",
      email: owner.email,
    });

    const formData = new FormData();
    formData.set(
      "payload",
      JSON.stringify({
        orderType: "CUSTOM_ORDER",
        customerName: "Center Action Guest",
        customerEmail: "center.action@example.com",
        customerPhone: "+15550000001",
        fulfillmentDetail: "PICKUP",
        lines: [{ title: "Center custom item", quantity: 1, unitPrice: 21.75 }],
      }),
    );

    const result = await createOrderViaCenterAction(formData);
    if (!isActionSuccess<{ orderId: string }>(result)) {
      throw new Error(`Expected success, got: ${JSON.stringify(result)}`);
    }

    const order = await loadOrder(result.data!.orderId, owner.ownerId);
    assertOrderPiiEncrypted(order, {
      workspaceId: owner.workspaceId,
      customerName: "Center Action Guest",
      customerEmail: "center.action@example.com",
      customerPhone: "+15550000001",
    });
  });

  it("stores encrypted PII when the dashboard manual order action creates an order", async () => {
    const owner = await createOwnerFixture("manual-order");
    const { productId } = await createActiveMenuProductFixture(owner);

    requireMutationPermission.mockResolvedValue({
      ok: true,
      actor: {
        userId: owner.ownerId,
        workspaceId: owner.workspaceId,
        sessionUser: { id: owner.ownerId },
      },
    });

    const formData = new FormData();
    formData.set("customerName", "Manual Dashboard Guest");
    formData.set("customerEmail", "manual.dashboard@example.com");
    formData.set("customerPhone", "+15550000002");
    formData.set("fulfillmentType", "PICKUP");
    formData.append("productId", productId);
    formData.append("qty", "1");

    const result = await createOrder(formData);
    if (!isActionSuccess<{ orderId: string }>(result)) {
      throw new Error(`Expected success, got: ${JSON.stringify(result)}`);
    }

    const order = await loadOrder(result.data!.orderId, owner.ownerId);
    assertOrderPiiEncrypted(order, {
      workspaceId: owner.workspaceId,
      customerName: "Manual Dashboard Guest",
      customerEmail: "manual.dashboard@example.com",
      customerPhone: "+15550000002",
    });
  });

  it("stores encrypted PII when the public API route creates an order", async () => {
    const owner = await createOwnerFixture("public-api");
    guardPublicApi.mockResolvedValue({ userId: owner.ownerId });

    const request = new Request("http://localhost/api/public/v1/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        customerName: "Public API Guest",
        customerEmail: "public.api@example.com",
        customerPhone: "+15550000003",
        fulfillmentType: "PICKUP",
        total: 33.4,
      }),
    });

    const response = await postPublicOrder(request);
    expect(response.status).toBe(200);
    const json = (await response.json()) as {
      data: { id: string; customerName: string; customerEmail: string };
    };

    expect(json.data.customerName).toBe("Public API Guest");
    expect(json.data.customerEmail).toBe("public.api@example.com");

    const order = await loadOrder(json.data.id, owner.ownerId);
    assertOrderPiiEncrypted(order, {
      workspaceId: owner.workspaceId,
      customerName: "Public API Guest",
      customerEmail: "public.api@example.com",
      customerPhone: "+15550000003",
    });
  });

  it("stores encrypted PII when POS checkout creates a walk-in order", async () => {
    const owner = await createOwnerFixture("pos-checkout");
    const register = await createPosRegisterFixture(owner);

    const result = await checkoutPosSale(owner.ownerId, owner.ownerId, {
      registerId: register.id,
      shiftId: null,
      staffMemberId: null,
      locationId: null,
      brandId: null,
      customerId: null,
      fulfillmentDetail: "PICKUP",
      paymentMode: "CASH",
      lines: [{ title: "POS coffee", quantity: 1, unitPrice: 8.25 }],
      notes: "Walk-in checkout",
    });

    if (!result.ok) {
      throw new Error(`Expected success, got: ${JSON.stringify(result)}`);
    }

    const order = await loadOrder(result.orderId, owner.ownerId);
    assertOrderPiiEncrypted(order, {
      workspaceId: owner.workspaceId,
      customerName: "Walk-in customer",
      customerEmail: decryptOrderPiiFields({
        customerName: order.customerName,
        customerEmail: order.customerEmail,
      }).customerEmail!,
      customerPhone: null,
    });
    expect(
      decryptOrderPiiFields({
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
      }).customerEmail,
    ).toMatch(/^no-email\+.+@local\.kitchenos\.invalid$/);

    const transaction = await prisma.pOSTransaction.findFirst({
      where: { orderId: result.orderId, userId: owner.ownerId },
      select: { id: true },
    });
    expect(transaction).not.toBeNull();
  });

  it("stores encrypted PII when DoorDash import creates a sales-channel order", async () => {
    const owner = await createOwnerFixture("doordash-import");
    await createDoorDashConnectionFixture(owner);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          orders: [
            {
              id: "dd-order-1",
              total: 2550,
              customer: { name: "DoorDash Guest" },
              delivery: { address: "123 Main St" },
              items: [{ name: "Bowl", quantity: 1, price: 2550 }],
            },
          ],
        }),
      }),
    );

    const result = await fetchDoorDashOrders(owner.ownerId);
    expect(result).toEqual({ imported: 1, total: 1 });

    const order = await prisma.order.findFirst({
      where: {
        userId: owner.ownerId,
        channelProvider: "DOORDASH",
        externalOrderIdExt: "dd-order-1",
      },
      select: {
        id: true,
        workspaceId: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        channelProvider: true,
        externalOrderIdExt: true,
      },
    });
    expect(order).not.toBeNull();
    assertOrderPiiEncrypted(order!, {
      workspaceId: owner.workspaceId,
      customerName: "DoorDash Guest",
      customerEmail: "doordash@import.local",
      customerPhone: null,
    });

    const externalOrder = await prisma.externalOrder.findFirst({
      where: { userId: owner.ownerId, externalOrderId: "dd-order-1" },
      select: { importedOrderId: true },
    });
    expect(externalOrder?.importedOrderId).toBe(order!.id);
  });
});
