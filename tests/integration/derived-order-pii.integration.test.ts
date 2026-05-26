import { randomUUID } from "node:crypto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const recomputeMetricsForOrderEmail = vi.hoisted(() => vi.fn());
const createCateringDepositCheckoutSession = vi.hoisted(() => vi.fn());
const captureErrorSafe = vi.hoisted(() => vi.fn());

vi.mock("@/services/crm/customer-metrics-service", () => ({
  recomputeMetricsForOrderEmail,
}));
vi.mock("@/services/catering/catering-deposit-checkout-service", () => ({
  createCateringDepositCheckoutSession,
}));
vi.mock("@/services/observability/error-reporting-service", () => ({
  captureErrorSafe,
}));

import { convertQuoteToOrder } from "@/services/catering/quote-conversion-service";
import { generateDraftOrderForCycle } from "@/services/meal-plans/meal-plan-order-generator";
import { decryptOrderPiiFields } from "@/lib/orders/order-pii";
import { prisma } from "@/lib/prisma";

const run =
  process.env.RUN_DB_INTEGRATION === "1" &&
  Boolean(process.env.DATABASE_URL?.trim());
const ENCRYPTION_KEY_B64 = Buffer.alloc(32, 19).toString("base64");

type OwnerFixture = {
  ownerId: string;
  workspaceId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  menuId: string;
  productId: string;
};

const cleanupUserIds = new Set<string>();
const cleanupWorkspaceIds = new Set<string>();

async function createOwnerFixture(tag: string): Promise<OwnerFixture> {
  const suffix = randomUUID().slice(0, 8);
  const ownerId = randomUUID();
  const customerEmail = `${tag}.customer-${suffix}@example.com`;
  const customerName = `Customer ${suffix}`;
  const customerPhone = "+15551112222";

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
  const customer = await prisma.kitchenCustomer.create({
    data: {
      userId: ownerId,
      workspaceId: workspace.id,
      email: customerEmail,
      name: customerName,
      phone: customerPhone,
      source: "MANUAL",
      type: "INDIVIDUAL",
      status: "ACTIVE",
    },
    select: { id: true },
  });
  const menu = await prisma.menu.create({
    data: {
      userId: ownerId,
      workspaceId: workspace.id,
      title: `Menu ${tag} ${suffix}`,
      startDate: new Date("2026-05-26T00:00:00.000Z"),
      endDate: new Date("2026-05-31T00:00:00.000Z"),
      preorderDeadline: new Date("2026-05-25T00:00:00.000Z"),
      active: true,
      published: true,
      catalogOnly: false,
    },
    select: { id: true },
  });
  const product = await prisma.product.create({
    data: {
      menuId: menu.id,
      workspaceId: workspace.id,
      title: `Product ${tag} ${suffix}`,
      preparedDate: new Date("2026-05-26T00:00:00.000Z"),
      price: 24.5,
      active: true,
    },
    select: { id: true },
  });

  cleanupUserIds.add(ownerId);
  cleanupWorkspaceIds.add(workspace.id);

  return {
    ownerId,
    workspaceId: workspace.id,
    customerId: customer.id,
    customerName,
    customerEmail,
    customerPhone,
    menuId: menu.id,
    productId: product.id,
  };
}

describe.skipIf(!run)("derived order PII integration", () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = ENCRYPTION_KEY_B64;
    vi.clearAllMocks();
    recomputeMetricsForOrderEmail.mockResolvedValue(undefined);
    createCateringDepositCheckoutSession.mockResolvedValue({
      ok: true,
      url: "https://example.com/deposit",
    });
    captureErrorSafe.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    const userIds = Array.from(cleanupUserIds);
    const workspaceIds = Array.from(cleanupWorkspaceIds);
    cleanupUserIds.clear();
    cleanupWorkspaceIds.clear();

    if (userIds.length > 0) {
      await prisma.customerTimelineEvent.deleteMany({
        where: { customer: { userId: { in: userIds } } },
      });
      await prisma.cateringQuoteEvent.deleteMany({
        where: { quote: { userId: { in: userIds } } },
      });
      await prisma.mealPlanEvent.deleteMany({
        where: { mealPlan: { userId: { in: userIds } } },
      });
      await prisma.cateringQuote.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.mealPlan.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.order.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.menu.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.kitchenCustomer.deleteMany({
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

  it("converts a catering quote into an encrypted draft order and links the quote", async () => {
    const fixture = await createOwnerFixture("catering");
    const quote = await prisma.cateringQuote.create({
      data: {
        userId: fixture.ownerId,
        workspaceId: fixture.workspaceId,
        customerId: fixture.customerId,
        customerName: "Catering Client",
        customerEmail: "catering.client@example.com",
        customerPhone: "+15550000005",
        publicToken: `cq_${randomUUID().replaceAll("-", "")}`,
        quoteNumber: `CQ-${Date.now().toString(36).toUpperCase()}`,
        status: "ACCEPTED",
        serviceStyle: "DROP_OFF",
        deliveryRequired: true,
        eventDate: new Date("2026-06-02T00:00:00.000Z"),
        subtotal: 49,
        total: 49,
        items: {
          create: [
            {
              productId: fixture.productId,
              menuId: fixture.menuId,
              title: "Catering Tray",
              quantity: 2,
              unitPrice: 24.5,
              total: 49,
              lineType: "FOOD",
            },
          ],
        },
      },
      select: { id: true },
    });

    const result = await convertQuoteToOrder(
      { userId: fixture.ownerId },
      quote.id,
      "integration-test",
      0,
    );

    expect(result).toMatchObject({ ok: true, quoteId: quote.id });
    if (!result.ok) {
      throw new Error(`Expected success, got: ${JSON.stringify(result)}`);
    }

    const order = await prisma.order.findFirst({
      where: { id: result.orderId, userId: fixture.ownerId },
      select: {
        workspaceId: true,
        customerId: true,
        orderType: true,
        creationSource: true,
        paymentMode: true,
        statusDetail: true,
        fulfillmentDetail: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
      },
    });
    expect(order).not.toBeNull();
    expect(order!.workspaceId).toBe(fixture.workspaceId);
    expect(order!.customerId).toBe(fixture.customerId);
    expect(order!.orderType).toBe("CATERING_ORDER");
    expect(order!.creationSource).toBe("CATERING_QUOTE");
    expect(order!.paymentMode).toBe("MANUAL_INVOICE");
    expect(order!.statusDetail).toBe("DRAFT");
    expect(order!.fulfillmentDetail).toBe("EVENT_DELIVERY");
    expect(order!.customerName).toMatch(/^enc:v1:/);
    expect(order!.customerEmail).toMatch(/^enc:order-email:v1:/);
    expect(order!.customerPhone).toMatch(/^enc:v1:/);

    const pii = decryptOrderPiiFields({
      customerName: order!.customerName,
      customerEmail: order!.customerEmail,
      customerPhone: order!.customerPhone,
    });
    expect(pii).toEqual({
      customerName: "Catering Client",
      customerEmail: "catering.client@example.com",
      customerPhone: "+15550000005",
    });

    const updatedQuote = await prisma.cateringQuote.findUnique({
      where: { id: quote.id },
      select: { status: true, convertedOrderId: true },
    });
    expect(updatedQuote).toEqual({
      status: "CONVERTED_TO_ORDER",
      convertedOrderId: result.orderId,
    });

    const quoteEvent = await prisma.cateringQuoteEvent.findFirst({
      where: { quoteId: quote.id, eventType: "QUOTE_CONVERTED_TO_ORDER" },
      select: { id: true },
    });
    expect(quoteEvent).not.toBeNull();

    const timelineEvent = await prisma.customerTimelineEvent.findFirst({
      where: { customerId: fixture.customerId, sourceId: result.orderId },
      select: { id: true },
    });
    expect(timelineEvent).not.toBeNull();
  });

  it("generates a meal-plan draft order with encrypted PII and cycle linkage", async () => {
    const fixture = await createOwnerFixture("meal-plan");
    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId: fixture.ownerId,
        workspaceId: fixture.workspaceId,
        customerId: fixture.customerId,
        name: "Weekly Lunch Plan",
        frequency: "WEEKLY",
        fulfillmentMode: "DELIVERY",
        startDate: new Date("2026-05-26T00:00:00.000Z"),
        nextOrderDate: new Date("2026-05-26T00:00:00.000Z"),
      },
      select: { id: true, nextOrderDate: true },
    });
    const cycle = await prisma.mealPlanCycle.create({
      data: {
        mealPlanId: mealPlan.id,
        cycleStartDate: new Date("2026-05-26T00:00:00.000Z"),
        cycleEndDate: new Date("2026-06-01T00:00:00.000Z"),
        status: "READY_TO_GENERATE",
      },
      select: { id: true, cycleStartDate: true },
    });
    await prisma.mealPlanSelection.create({
      data: {
        cycleId: cycle.id,
        productId: fixture.productId,
        menuId: fixture.menuId,
        itemName: "Delivery Meal",
        quantity: 2,
        servings: 1,
      },
    });

    const result = await generateDraftOrderForCycle(
      { userId: fixture.ownerId },
      cycle.id,
      "integration-test",
    );

    expect(result).toMatchObject({ ok: true, cycleId: cycle.id });
    if (!result.ok) {
      throw new Error(`Expected success, got: ${JSON.stringify(result)}`);
    }

    const order = await prisma.order.findFirst({
      where: { id: result.orderId, userId: fixture.ownerId },
      select: {
        workspaceId: true,
        customerId: true,
        orderType: true,
        creationSource: true,
        paymentMode: true,
        statusDetail: true,
        fulfillmentDetail: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
      },
    });
    expect(order).not.toBeNull();
    expect(order!.workspaceId).toBe(fixture.workspaceId);
    expect(order!.customerId).toBe(fixture.customerId);
    expect(order!.orderType).toBe("MEAL_PLAN_ORDER");
    expect(order!.creationSource).toBe("MEAL_PLAN");
    expect(order!.paymentMode).toBe("PAY_LATER");
    expect(order!.statusDetail).toBe("DRAFT");
    expect(order!.fulfillmentDetail).toBe("DELIVERY");
    expect(order!.customerName).toMatch(/^enc:v1:/);
    expect(order!.customerEmail).toMatch(/^enc:order-email:v1:/);
    expect(order!.customerPhone).toMatch(/^enc:v1:/);

    const pii = decryptOrderPiiFields({
      customerName: order!.customerName,
      customerEmail: order!.customerEmail,
      customerPhone: order!.customerPhone,
    });
    expect(pii).toEqual({
      customerName: fixture.customerName,
      customerEmail: fixture.customerEmail,
      customerPhone: fixture.customerPhone,
    });

    const updatedCycle = await prisma.mealPlanCycle.findUnique({
      where: { id: cycle.id },
      select: { status: true, orderId: true, generatedAt: true },
    });
    expect(updatedCycle?.status).toBe("GENERATED");
    expect(updatedCycle?.orderId).toBe(result.orderId);
    expect(updatedCycle?.generatedAt).not.toBeNull();

    const generatedEvent = await prisma.mealPlanEvent.findFirst({
      where: { mealPlanId: mealPlan.id, cycleId: cycle.id, eventType: "ORDER_DRAFT_GENERATED" },
      select: { id: true },
    });
    expect(generatedEvent).not.toBeNull();

    const previewEvent = await prisma.mealPlanEvent.findFirst({
      where: { mealPlanId: mealPlan.id, cycleId: cycle.id, eventType: "ORDER_PREVIEWED" },
      select: { id: true },
    });
    expect(previewEvent).not.toBeNull();

    const updatedMealPlan = await prisma.mealPlan.findUnique({
      where: { id: mealPlan.id },
      select: { nextOrderDate: true },
    });
    expect(updatedMealPlan?.nextOrderDate).not.toBeNull();
    expect(updatedMealPlan!.nextOrderDate!.getTime()).toBeGreaterThan(
      cycle.cycleStartDate.getTime(),
    );

    const timelineEvent = await prisma.customerTimelineEvent.findFirst({
      where: { customerId: fixture.customerId, sourceId: result.orderId },
      select: { id: true },
    });
    expect(timelineEvent).not.toBeNull();
  });
});
