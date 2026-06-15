import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

const { productRow, settingsJson, getProductRow, setProductRow } = vi.hoisted(() => {
  const settingsJson: Record<string, unknown> = {};
  let productRow = {
    id: "prod-1",
    menuId: "menu-1",
    title: "Burger",
    description: "Tasty",
    price: "12.00",
    category: "MAINS",
    image: null as string | null,
    active: true,
    posVisible: true,
    storefrontVisible: true,
    updatedAt: new Date("2026-06-01T12:00:00Z"),
  };
  return {
    settingsJson,
    productRow,
    getProductRow: () => productRow,
    setProductRow: (next: typeof productRow) => {
      productRow = next;
    },
  };
});

import {
  getUniversalMenuItem,
  listUniversalMenuItems,
  updateMenuItem,
} from "@/services/menu/universal-menu-engine";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveWorkspaceOwnerUserId: vi.fn(),
  resolveOwnerWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  productListWhereForOwner: vi.fn().mockResolvedValue({ userId: "user-1" }),
  productByIdWhereForOwner: vi.fn().mockResolvedValue({ id: "prod-1", userId: "user-1" }),
  integrationConnectionByProviderWhereForOwner: vi.fn().mockResolvedValue({ userId: "user-1" }),
}));

vi.mock("@/lib/integrations/shopify-market-catalog-push-trigger", () => ({
  triggerShopifyMarketCatalogPushAfterProductUpdate: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/storefront/revalidate-shopify-market-catalog", () => ({
  revalidateStorefrontCatalogForOwner: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: vi.fn().mockImplementation(() => {
        const row = getProductRow();
        return Promise.resolve([
          {
            ...row,
            price: new Prisma.Decimal(String(row.price)),
          },
        ]);
      }),
      findFirst: vi.fn().mockImplementation(() => {
        const row = getProductRow();
        return Promise.resolve({
          ...row,
          price: new Prisma.Decimal(String(row.price)),
        });
      }),
      update: vi.fn().mockImplementation(({ data }) => {
        const row = getProductRow();
        const next = {
          ...row,
          ...data,
          price: String(data.price ?? row.price),
          updatedAt: new Date("2026-06-01T12:05:00Z"),
        };
        setProductRow(next);
        return Promise.resolve({
          ...next,
          price: new Prisma.Decimal(next.price),
        });
      }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    kitchenSettings: {
      findUnique: vi.fn().mockImplementation(() =>
        Promise.resolve({ settingsCenterJson: settingsJson }),
      ),
      upsert: vi.fn().mockImplementation(async ({ update }) => {
        Object.assign(settingsJson, update.settingsCenterJson ?? {});
        return { userId: "user-1" };
      }),
    },
    integrationConnection: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
    externalProduct: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
  },
}));

describe("universal menu engine (integration)", () => {
  it("lists menu items with default channel maps", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");

    const items = await listUniversalMenuItems("ws-1");
    expect(items).toHaveLength(1);
    expect(items[0]!.master.title).toBe("Burger");
    expect(items[0]!.syncStatus.pos.status).toBe("pending");
  });

  it("loads a single universal menu item", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");

    const item = await getUniversalMenuItem("ws-1", "prod-1");
    expect(item?.productId).toBe("prod-1");
  });

  it("updates master fields and pushes to channels", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");

    const result = await updateMenuItem("ws-1", "prod-1", {
      master: { title: "Deluxe Burger", price: 13.5 },
      channelOverrides: { website: { title: "Web Deluxe Burger" } },
    });

    expect(result.item.master.title).toBe("Deluxe Burger");
    expect(result.pushOutcomes.length).toBe(7);
    expect(result.pushOutcomes.some((o) => o.channel === "pos")).toBe(true);
    expect((settingsJson.universalMenu as { items: Record<string, unknown> }).items["prod-1"]).toBeTruthy();
  });
});
