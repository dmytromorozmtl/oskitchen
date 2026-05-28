import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const guardPublicApiV1Resource = vi.hoisted(() => vi.fn());
const guardPublicApi = vi.hoisted(() => vi.fn());
const productListWhereForOwner = vi.hoisted(() => vi.fn());

const prismaMock = vi.hoisted(() => ({
  product: { findMany: vi.fn() },
  kitchenCustomer: { findMany: vi.fn(), count: vi.fn() },
  order: { findMany: vi.fn(), findFirst: vi.fn() },
  ingredient: { findMany: vi.fn() },
  location: { findMany: vi.fn() },
  recipe: { findMany: vi.fn(), create: vi.fn() },
  staffMember: { findMany: vi.fn() },
  webhookEvent: { findMany: vi.fn(), create: vi.fn() },
}));

vi.mock("@/lib/api-public/guard", () => ({
  guardPublicApiV1Resource,
  guardPublicApi,
  isGuardError: (value: unknown) =>
    Boolean(value && typeof value === "object" && "response" in value),
}));

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  productListWhereForOwner,
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

vi.mock("@/lib/orders/order-pii", () => ({
  decryptOrderPiiFields: (fields: { customerName: string; customerEmail: string }) => fields,
}));

vi.mock("@/services/orders/order-creation-service", () => ({
  createOrderViaCenter: vi.fn(),
}));

import { GET as getProducts } from "@/app/api/public/v1/products/route";
import { GET as getCustomers } from "@/app/api/public/v1/customers/route";
import { GET as getOrders } from "@/app/api/public/v1/orders/route";
import { GET as getInventory } from "@/app/api/public/v1/inventory/route";
import { GET as getLocations } from "@/app/api/public/v1/locations/route";
import { GET as getRecipes, POST as postRecipes } from "@/app/api/public/v1/recipes/route";
import { GET as getStaff } from "@/app/api/public/v1/staff/route";
import { GET as getWebhooks, POST as postWebhooks } from "@/app/api/public/v1/webhooks/route";

const listEnvelopeSchema = z.object({
  data: z.array(z.record(z.string(), z.unknown())),
});

const customersEnvelopeSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      email: z.string(),
      name: z.string(),
      orders: z.number(),
      lifetimeCents: z.number(),
      updatedAt: z.string(),
    }),
  ),
  pagination: z.object({
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().positive(),
  }),
});

function unauthorizedGuard() {
  guardPublicApiV1Resource.mockResolvedValue({
    response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
  });
}

function authorizedGuard(userId = "owner-1") {
  guardPublicApiV1Resource.mockResolvedValue({ userId });
}

describe("public API v1 resource contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authorizedGuard();
    productListWhereForOwner.mockResolvedValue({ userId: "owner-1" });
  });

  describe("auth fail-closed", () => {
    it.each([
      ["products", () => getProducts(new Request("http://localhost/api/public/v1/products"))],
      ["customers", () => getCustomers(new Request("http://localhost/api/public/v1/customers"))],
      ["orders", () => getOrders(new Request("http://localhost/api/public/v1/orders"))],
      ["inventory", () => getInventory(new Request("http://localhost/api/public/v1/inventory"))],
      ["locations", () => getLocations(new Request("http://localhost/api/public/v1/locations"))],
      ["recipes", () => getRecipes(new Request("http://localhost/api/public/v1/recipes"))],
      ["staff", () => getStaff(new Request("http://localhost/api/public/v1/staff"))],
      ["webhooks", () => getWebhooks(new Request("http://localhost/api/public/v1/webhooks"))],
    ])("returns 401 for %s without bearer auth", async (_name, callRoute) => {
      unauthorizedGuard();
      const response = await callRoute();
      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    });
  });

  describe("tenant-scoped list responses", () => {
    it("products returns decimal strings and scopes via productListWhereForOwner", async () => {
      prismaMock.product.findMany.mockResolvedValue([
        {
          id: "prod-1",
          title: "Soup",
          price: { toString: () => "12.50" },
          active: true,
          preparedDate: new Date("2026-05-27T00:00:00.000Z"),
        },
      ]);

      const response = await getProducts(new Request("http://localhost/api/public/v1/products"));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(listEnvelopeSchema.safeParse(json).success).toBe(true);
      expect(json.data[0].price).toBe("12.50");
      expect(productListWhereForOwner).toHaveBeenCalledWith("owner-1");
    });

    it("inventory scopes queries to authenticated userId", async () => {
      prismaMock.ingredient.findMany.mockResolvedValue([
        {
          id: "ing-1",
          name: "Flour",
          unit: "kg",
          currentStock: { toString: () => "10" },
          parLevel: { toString: () => "5" },
          costPerUnit: { toString: () => "2.5" },
        },
      ]);

      const response = await getInventory(new Request("http://localhost/api/public/v1/inventory"));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(listEnvelopeSchema.safeParse(json).success).toBe(true);
      expect(prismaMock.ingredient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: "owner-1", active: true } }),
      );
    });

    it("locations scopes queries to authenticated userId", async () => {
      prismaMock.location.findMany.mockResolvedValue([
        { id: "loc-1", name: "Main", type: "KITCHEN", status: "ACTIVE", timezone: "UTC" },
      ]);

      const response = await getLocations(new Request("http://localhost/api/public/v1/locations"));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(listEnvelopeSchema.safeParse(json).success).toBe(true);
      expect(prismaMock.location.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: "owner-1", active: true } }),
      );
    });

    it("staff scopes queries to authenticated userId", async () => {
      prismaMock.staffMember.findMany.mockResolvedValue([
        { id: "staff-1", name: "Alex", roleType: "LINE_COOK", email: "alex@example.com" },
      ]);

      const response = await getStaff(new Request("http://localhost/api/public/v1/staff"));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(listEnvelopeSchema.safeParse(json).success).toBe(true);
      expect(prismaMock.staffMember.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: "owner-1", status: "ACTIVE" } }),
      );
    });

    it("orders scopes queries to authenticated userId", async () => {
      prismaMock.order.findMany.mockResolvedValue([
        {
          id: "ord-1",
          customerName: "Guest",
          customerEmail: "guest@example.com",
          status: "CONFIRMED",
          total: { toString: () => "18.00" },
          createdAt: new Date("2026-05-27T12:00:00.000Z"),
        },
      ]);

      const response = await getOrders(new Request("http://localhost/api/public/v1/orders"));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(listEnvelopeSchema.safeParse(json).success).toBe(true);
      expect(json.data[0].total).toBe("18.00");
      expect(prismaMock.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: "owner-1" } }),
      );
    });
  });

  describe("customers pagination contract", () => {
    it("returns 400 for invalid pagination query", async () => {
      const response = await getCustomers(
        new Request("http://localhost/api/public/v1/customers?page=0&pageSize=500"),
      );
      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({ error: "Invalid query" });
    });

    it("returns paginated envelope for valid query", async () => {
      prismaMock.kitchenCustomer.findMany.mockResolvedValue([
        {
          id: "cust-1",
          email: "jane@example.com",
          firstName: "Jane",
          lastName: "Doe",
          displayName: null,
          totalOrders: 2,
          lifetimeValueCents: 4500,
          updatedAt: new Date("2026-05-27T12:00:00.000Z"),
        },
      ]);
      prismaMock.kitchenCustomer.count.mockResolvedValue(1);

      const response = await getCustomers(
        new Request("http://localhost/api/public/v1/customers?page=1&pageSize=25"),
      );
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(customersEnvelopeSchema.safeParse(json).success).toBe(true);
      expect(prismaMock.kitchenCustomer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: "owner-1" }, skip: 0, take: 25 }),
      );
    });
  });

  describe("mutation validation contracts", () => {
    it("recipes POST returns 400 for invalid body", async () => {
      const response = await postRecipes(
        new Request("http://localhost/api/public/v1/recipes", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: "Missing product id" }),
        }),
      );
      expect(response.status).toBe(400);
    });

    it("webhooks POST returns 400 for invalid body", async () => {
      const response = await postWebhooks(
        new Request("http://localhost/api/public/v1/webhooks", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ topic: "" }),
        }),
      );
      expect(response.status).toBe(400);
    });
  });
});
