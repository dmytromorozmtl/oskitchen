import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const logImportPermissionDenied = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/services/import-export/import-permission-audit", () => ({
  logImportPermissionDenied,
}));

vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor,
}));

vi.mock("@/lib/upload-policy/media-upload-validation", () => ({
  validateImportCsvUpload: vi.fn().mockReturnValue({ ok: true }),
}));

vi.mock("@/lib/upload-policy/enforce-upload-content-safety", () => ({
  enforceUploadContentSafety: vi.fn().mockResolvedValue({ ok: true }),
}));

vi.mock("@/services/audit/upload-audit", () => ({
  logUploadDenied: vi.fn(),
}));

vi.mock("@/services/import-export/import-service", () => ({
  createIngredientCsvPreviewJob: vi.fn().mockResolvedValue({ ok: true, importJobId: "job-1" }),
}));

import { validateIngredientImportPreviewAction } from "@/actions/import-export";

describe("import-export actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "user-1" },
      userId: "owner-1",
      workspaceId: "ws-1",
    });
  });

  it("denies ingredient CSV preview without products.edit", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: {
        sessionUserId: "user-1",
        dataUserId: "owner-1",
        workspaceId: "ws-1",
        workspaceRole: "STAFF",
        staffRoleType: "LINE_COOK",
        email: "cook@example.com",
        granted: new Set(),
      },
    });

    const formData = new FormData();
    formData.set("file", new File(["name\nflour"], "ingredients.csv", { type: "text/csv" }));

    const result = await validateIngredientImportPreviewAction(formData);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Forbidden");
    expect(requireMutationPermission).toHaveBeenCalledWith("products.edit");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(logImportPermissionDenied).toHaveBeenCalled();
  });
});
