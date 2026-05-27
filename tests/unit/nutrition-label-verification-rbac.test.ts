import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const nutritionProfileFindFirst = vi.hoisted(() => vi.fn());
const nutritionProfileUpdate = vi.hoisted(() => vi.fn());
const appendLabelVerificationEvent = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor,
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    nutritionProfile: {
      findFirst: nutritionProfileFindFirst,
      update: nutritionProfileUpdate,
    },
    allergenProfile: { findFirst: vi.fn(), update: vi.fn() },
    ingredientDeclaration: { findFirst: vi.fn(), update: vi.fn() },
  },
}));

vi.mock("@/services/nutrition-labels/label-verification-log", () => ({
  appendLabelVerificationEvent,
}));

import {
  setNutritionVerificationStatusAction,
  verifyNutritionProfileAction,
} from "@/actions/nutrition-label-verification";

const PRODUCT_ID = "11111111-1111-4111-8111-111111111111";
const PROFILE_ID = "22222222-2222-4222-8222-222222222222";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("nutrition label verification actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "actor-1", email: "owner@example.com" },
      dataUserId: "owner-1",
    });
    nutritionProfileFindFirst.mockResolvedValue({
      id: PROFILE_ID,
      servingSize: "100g",
      notes: null,
    });
    nutritionProfileUpdate.mockResolvedValue({});
    appendLabelVerificationEvent.mockResolvedValue(undefined);
  });

  it("denies verifyNutritionProfileAction without reports.read.audit and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("productId", PRODUCT_ID);

    const result = await verifyNutritionProfileAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("reports.read.audit");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(nutritionProfileUpdate).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "nutrition_label_verification.permission_denied",
        metadata: expect.objectContaining({
          operation: "nutrition_label.verify_profile",
          requiredPermission: "reports.read.audit",
        }),
      }),
    );
  });

  it("denies setNutritionVerificationStatusAction without reports.read.audit and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("productId", PRODUCT_ID);
    formData.set("status", "BLOCKED");

    const result = await setNutritionVerificationStatusAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(nutritionProfileUpdate).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "nutrition_label.set_status" }),
      }),
    );
  });

  it("allows verifyNutritionProfileAction when reports.read.audit is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("productId", PRODUCT_ID);
    formData.set("note", "Reviewed by QA");

    const result = await verifyNutritionProfileAction(formData);

    expect(result).toEqual({ ok: true });
    expect(requireTenantActor).toHaveBeenCalled();
    expect(nutritionProfileUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: PROFILE_ID },
        data: expect.objectContaining({
          verificationStatus: "VERIFIED",
          verifiedById: "actor-1",
        }),
      }),
    );
  });
});
