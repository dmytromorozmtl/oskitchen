import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const logTemperature = vi.hoisted(() => vi.fn());
const createChecklist = vi.hoisted(() => vi.fn());
const verifyAudit = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor,
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog,
}));

vi.mock("@/services/food-safety/temperature-service", () => ({
  logTemperature,
}));

vi.mock("@/services/food-safety/checklist-service", () => ({
  createChecklist,
}));

vi.mock("@/services/food-safety/audit-service", () => ({
  startAudit: vi.fn(),
  submitAuditResponse: vi.fn(),
}));

vi.mock("@/services/food-safety/corrective-action-service", () => ({
  addCorrectiveAction: vi.fn(),
  verifyAudit,
}));

import {
  createChecklistAction,
  logTemperatureAction,
  verifyFoodSafetyAuditAction,
} from "@/actions/food-safety";

const AUDIT_ID = "11111111-1111-4111-8111-111111111111";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("food safety actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      dataUserId: "owner-1",
      sessionUserId: "actor-1",
    });
    logTemperature.mockResolvedValue(undefined);
    createChecklist.mockResolvedValue(undefined);
    verifyAudit.mockResolvedValue(undefined);
  });

  it("denies logTemperatureAction without production.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("checkType", "REFRIGERATOR");
    formData.set("temperature", "4");

    await logTemperatureAction(formData);

    expect(requireMutationPermission).toHaveBeenCalledWith("production.manage");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(logTemperature).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "food_safety.permission_denied",
        metadata: expect.objectContaining({
          operation: "food_safety.log_temperature",
          requiredPermission: "production.manage",
        }),
      }),
    );
  });

  it("denies createChecklistAction without production.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("name", "Opening checklist");
    formData.set("frequency", "DAILY");
    formData.set("questions", "Sanitizer ready\nHands washed");

    await createChecklistAction(formData);

    expect(createChecklist).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "food_safety.create_checklist" }),
      }),
    );
  });

  it("denies verifyFoodSafetyAuditAction without production.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("auditId", AUDIT_ID);

    await verifyFoodSafetyAuditAction(formData);

    expect(verifyAudit).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "food_safety.verify_audit" }),
      }),
    );
  });

  it("allows logTemperatureAction when production.manage is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("checkType", "REFRIGERATOR");
    formData.set("temperature", "4");

    await logTemperatureAction(formData);

    expect(requireTenantActor).toHaveBeenCalled();
    expect(logTemperature).toHaveBeenCalledWith(
      "owner-1",
      expect.objectContaining({
        checkType: "REFRIGERATOR",
        temperature: 4,
        checkedById: "actor-1",
      }),
    );
  });
});
