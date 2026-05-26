import { randomUUID } from "node:crypto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.hoisted(() => vi.fn());
const enforceStorefrontRateLimit = vi.hoisted(() => vi.fn());
const verifyTurnstileToken = vi.hoisted(() => vi.fn());
const resolveActiveMarket = vi.hoisted(() => vi.fn());
const buildStorefrontMenuCatalog = vi.hoisted(() => vi.fn());
const priceCartLines = vi.hoisted(() => vi.fn());
const runStorefrontFulfillmentRuleEngine = vi.hoisted(() => vi.fn());
const quoteStorefrontTaxFromAddress = vi.hoisted(() => vi.fn());
const upsertCustomerFromOrder = vi.hoisted(() => vi.fn());
const recomputeMetricsForOrderEmail = vi.hoisted(() => vi.fn());
const upsertStorefrontCustomer = vi.hoisted(() => vi.fn());
const markCartRecoveryConverted = vi.hoisted(() => vi.fn());
const sendOrderConfirmation = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/storefront/storefront-rate-limit", () => ({
  enforceStorefrontRateLimit,
}));
vi.mock("@/lib/storefront/turnstile", () => ({ verifyTurnstileToken }));
vi.mock("@/lib/storefront/market-resolve", () => ({ resolveActiveMarket }));
vi.mock("@/services/storefront/storefront-menu-catalog-service", () => ({
  buildStorefrontMenuCatalog,
}));
vi.mock("@/services/storefront/storefront-cart-service", () => ({
  priceCartLines,
}));
vi.mock("@/services/storefront/storefront-fulfillment-rule-engine", () => ({
  runStorefrontFulfillmentRuleEngine,
}));
vi.mock("@/lib/storefront/tax-provider", () => ({
  quoteStorefrontTaxFromAddress,
}));
vi.mock("@/services/crm/customer-service", () => ({
  upsertCustomerFromOrder,
}));
vi.mock("@/services/crm/customer-metrics-service", () => ({
  recomputeMetricsForOrderEmail,
}));
vi.mock("@/services/storefront/storefront-customer-service", () => ({
  upsertStorefrontCustomer,
}));
vi.mock("@/services/storefront/storefront-cart-recovery-service", () => ({
  markCartRecoveryConverted,
}));
vi.mock("@/lib/email", () => ({
  sendOrderConfirmation,
}));

import { decryptOrderPiiFields } from "@/lib/orders/order-pii";
import { prisma } from "@/lib/prisma";
import { decryptStorefrontOrderPiiFields } from "@/lib/storefront/storefront-order-pii";
import { submitPublicStorefrontOrder } from "@/actions/storefront-order";

const run =
  process.env.RUN_DB_INTEGRATION === "1" &&
  Boolean(process.env.DATABASE_URL?.trim());
const ENCRYPTION_KEY_B64 = Buffer.alloc(32, 17).toString("base64");

type OwnerFixture = {
  ownerId: string;
  workspaceId: string;
  storefrontId: string;
  storeSlug: string;
  menuId: string;
  productId: string;
};

const cleanupUserIds = new Set<string>();
const cleanupWorkspaceIds = new Set<string>();
const cleanupStorefrontIds = new Set<string>();

async function createStorefrontFixture(tag: string): Promise<OwnerFixture> {
  const suffix = randomUUID().slice(0, 8);
  const ownerId = randomUUID();

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
  const menu = await prisma.menu.create({
    data: {
      userId: ownerId,
      workspaceId: workspace.id,
      title: `Storefront Menu ${suffix}`,
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
      title: `Storefront Meal ${suffix}`,
      preparedDate: new Date("2026-05-26T00:00:00.000Z"),
      price: 18.5,
      active: true,
      storefrontVisible: true,
    },
    select: { id: true },
  });
  const storeSlug = `sf-${suffix}`;
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
      activeMenuId: menu.id,
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
    menuId: menu.id,
    productId: product.id,
  };
}

describe.skipIf(!run)("storefront order PII integration", () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = ENCRYPTION_KEY_B64;
    vi.clearAllMocks();

    enforceStorefrontRateLimit.mockResolvedValue({ ok: true });
    verifyTurnstileToken.mockResolvedValue({ ok: true });
    runStorefrontFulfillmentRuleEngine.mockResolvedValue({
      allowed: true,
      blockers: [],
    });
    quoteStorefrontTaxFromAddress.mockResolvedValue(null);
    upsertCustomerFromOrder.mockResolvedValue(undefined);
    recomputeMetricsForOrderEmail.mockResolvedValue(undefined);
    upsertStorefrontCustomer.mockResolvedValue(undefined);
    markCartRecoveryConverted.mockResolvedValue(undefined);
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
      await prisma.storefrontOrder.deleteMany({
        where: { storefrontId: { in: storefrontIds } },
      });
      await prisma.storefrontSettings.deleteMany({
        where: { id: { in: storefrontIds } },
      });
    }
    if (userIds.length > 0) {
      await prisma.order.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.menu.deleteMany({
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

  it("stores encrypted PII in both internal and storefront order rows", async () => {
    const fixture = await createStorefrontFixture("storefront-pii");

    resolveActiveMarket.mockResolvedValue({
      activeMenuId: fixture.menuId,
      market: { id: "default", name: "Default Market", currency: "USD" },
      productIds: [fixture.productId],
    });
    buildStorefrontMenuCatalog.mockResolvedValue({
      priceVersion: "pv-1",
      products: [{ id: fixture.productId }],
    });
    priceCartLines.mockReturnValue({
      warnings: [],
      cart: {
        lines: [
          {
            productId: fixture.productId,
            variantId: undefined,
            modifierOptionIds: undefined,
            quantity: 1,
            unitPrice: 18.5,
            lineTotal: 18.5,
            title: "Storefront Meal",
            variantTitle: undefined,
            modifierLabels: undefined,
          },
        ],
        subtotal: 18.5,
      },
    });

    const result = await submitPublicStorefrontOrder({
      slug: fixture.storeSlug,
      customerName: "Storefront Guest",
      customerEmail: "storefront.guest@example.com",
      customerPhone: "+15550000004",
      fulfillmentType: "PICKUP",
      pickupDate: "2026-05-28",
      lines: [{ productId: fixture.productId, quantity: 1 }],
      checkoutPayment: "pay_later",
    });

    expect(result).toMatchObject({ ok: true });
    if (!("ok" in result) || !result.ok) {
      throw new Error(`Expected success, got: ${JSON.stringify(result)}`);
    }

    const storefrontOrder = await prisma.storefrontOrder.findFirst({
      where: { publicToken: result.token, storefrontId: fixture.storefrontId },
      select: {
        internalOrderId: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
      },
    });
    expect(storefrontOrder).not.toBeNull();
    expect(storefrontOrder!.customerName).toMatch(/^enc:v1:/);
    expect(storefrontOrder!.customerEmail).toMatch(
      /^enc:storefront-order-email:v1:/,
    );
    expect(storefrontOrder!.customerPhone).toMatch(/^enc:v1:/);

    const storefrontPii = decryptStorefrontOrderPiiFields({
      customerName: storefrontOrder!.customerName,
      customerEmail: storefrontOrder!.customerEmail,
      customerPhone: storefrontOrder!.customerPhone,
    });
    expect(storefrontPii).toEqual({
      customerName: "Storefront Guest",
      customerEmail: "storefront.guest@example.com",
      customerPhone: "+15550000004",
    });

    const order = await prisma.order.findFirst({
      where: { id: storefrontOrder!.internalOrderId!, userId: fixture.ownerId },
      select: {
        workspaceId: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        creationSource: true,
      },
    });
    expect(order).not.toBeNull();
    expect(order!.workspaceId).toBe(fixture.workspaceId);
    expect(order!.creationSource).toBe("STOREFRONT");
    expect(order!.customerName).toMatch(/^enc:v1:/);
    expect(order!.customerEmail).toMatch(/^enc:order-email:v1:/);
    expect(order!.customerPhone).toMatch(/^enc:v1:/);

    const orderPii = decryptOrderPiiFields({
      customerName: order!.customerName,
      customerEmail: order!.customerEmail,
      customerPhone: order!.customerPhone,
    });
    expect(orderPii).toEqual({
      customerName: "Storefront Guest",
      customerEmail: "storefront.guest@example.com",
      customerPhone: "+15550000004",
    });
  });
});
