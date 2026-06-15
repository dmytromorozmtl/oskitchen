import { beforeEach, describe, expect, it, vi } from "vitest";

const requireCrmMutation = vi.hoisted(() => vi.fn());
const prismaUpsert = vi.hoisted(() => vi.fn());
const prismaCreate = vi.hoisted(() => vi.fn());
const createMealPlan = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/crm/require-crm-mutation", () => ({
  requireCrmMutation,
}));

vi.mock("@/services/meal-plans/meal-plan-service", () => ({
  createMealPlan,
}));

vi.mock("@/lib/logger", () => ({
  logger: { warn: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    kitchenCustomer: { upsert: prismaUpsert },
    customerSubscription: { create: prismaCreate, updateMany: vi.fn() },
  },
}));

import {
  createCustomerSubscriptionAction,
  setSubscriptionStatusAction,
} from "@/actions/customer-subscription";

const ownerActor = {
  ok: true as const,
  actor: {
    sessionUserId: "owner-1",
    userId: "owner-1",
    dataUserId: "owner-1",
    workspaceId: "ws-1",
    sessionUser: { id: "owner-1", email: "owner@example.com" },
    workspaceRole: "OWNER" as const,
    staffRoleType: "OWNER" as const,
    email: "owner@example.com",
    granted: new Set<string>(),
    platformBypass: false,
  },
};

describe("customer subscription RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaUpsert.mockResolvedValue({ id: "cust-1" });
    prismaCreate.mockResolvedValue({ id: "sub-1" });
    createMealPlan.mockResolvedValue(undefined);
  });

  it("denies create without customers.manage", async () => {
    requireCrmMutation.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
    });

    const formData = new FormData();
    formData.set("customerEmail", "guest@example.com");
    formData.set("planName", "Weekly");
    formData.set("frequency", "WEEKLY");
    formData.set("mealsPerWeek", "5");
    formData.set("pickupOrDelivery", "PICKUP");

    const result = await createCustomerSubscriptionAction(formData);

    expect(result).toEqual({ error: "You do not have permission to perform this action." });
    expect(requireCrmMutation).toHaveBeenCalledWith("customer_subscription.create");
    expect(prismaCreate).not.toHaveBeenCalled();
  });

  it("allows create when CRM mutation gate passes", async () => {
    requireCrmMutation.mockResolvedValue(ownerActor);

    const formData = new FormData();
    formData.set("customerEmail", "guest@example.com");
    formData.set("customerName", "");
    formData.set("planName", "Weekly");
    formData.set("frequency", "WEEKLY");
    formData.set("mealsPerWeek", "5");
    formData.set("pickupOrDelivery", "PICKUP");
    formData.set("nextOrderDate", "2026-06-01");
    formData.set("notes", "");

    const result = await createCustomerSubscriptionAction(formData);

    expect(result).toEqual({ ok: true });
    expect(prismaCreate).toHaveBeenCalled();
  });

  it("denies status change without customers.manage", async () => {
    requireCrmMutation.mockResolvedValue({
      ok: false,
      error: "Forbidden",
    });

    const formData = new FormData();
    formData.set("id", "00000000-0000-4000-8000-000000000001");
    formData.set("status", "PAUSED");

    const result = await setSubscriptionStatusAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireCrmMutation).toHaveBeenCalledWith("customer_subscription.set_status");
  });
});
