import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const createOperationsChecklist = vi.hoisted(() => vi.fn());
const submitOperationsResponse = vi.hoisted(() => vi.fn());

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

vi.mock("@/services/operations/operations-service", () => ({
  createOperationsChecklist,
  startOperationsAudit: vi.fn(),
  submitOperationsResponse,
}));

import {
  createOperationsChecklistAction,
  submitOperationsResponseAction,
} from "@/actions/operations";

const AUDIT_ID = "11111111-1111-4111-8111-111111111111";
const RESPONSE_ID = "22222222-2222-4222-8222-222222222222";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("operations actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      dataUserId: "owner-1",
      sessionUserId: "actor-1",
    });
    createOperationsChecklist.mockResolvedValue(undefined);
    submitOperationsResponse.mockResolvedValue(undefined);
  });

  it("denies createOperationsChecklistAction without production.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("name", "Opening checklist");
    formData.set("frequency", "DAILY");
    formData.set("questions", "Lights on\nSanitizer ready");

    await createOperationsChecklistAction(formData);

    expect(requireMutationPermission).toHaveBeenCalledWith("production.manage");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(createOperationsChecklist).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "operations.permission_denied",
        metadata: expect.objectContaining({
          operation: "operations.create_checklist",
          requiredPermission: "production.manage",
        }),
      }),
    );
  });

  it("denies submitOperationsResponseAction without production.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("auditId", AUDIT_ID);
    formData.set("responseId", RESPONSE_ID);
    formData.set("pass", "true");

    await submitOperationsResponseAction(formData);

    expect(submitOperationsResponse).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "operations.submit_response" }),
      }),
    );
  });

  it("allows createOperationsChecklistAction when production.manage is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("name", "Opening checklist");
    formData.set("frequency", "DAILY");
    formData.set("questions", "Lights on\nSanitizer ready");

    await createOperationsChecklistAction(formData);

    expect(requireTenantActor).toHaveBeenCalled();
    expect(createOperationsChecklist).toHaveBeenCalledWith(
      "owner-1",
      expect.objectContaining({
        name: "Opening checklist",
        frequency: "DAILY",
        questions: ["Lights on", "Sanitizer ready"],
      }),
    );
  });
});
