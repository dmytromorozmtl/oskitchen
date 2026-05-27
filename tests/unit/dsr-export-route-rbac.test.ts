import { beforeEach, describe, expect, it, vi } from "vitest";

const requireSessionUser = vi.hoisted(() => vi.fn());
const hasSuperAdminRoleRow = vi.hoisted(() => vi.fn());
const rejectCrossSiteMutation = vi.hoisted(() => vi.fn());
const verifyImpersonationMfa = vi.hoisted(() => vi.fn());
const buildUserDataExportBundle = vi.hoisted(() => vi.fn());
const logDsrExportRequested = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({
  requireSessionUser,
}));

vi.mock("@/lib/platform-super-bypass", () => ({
  hasSuperAdminRoleRow,
}));

vi.mock("@/lib/security/mutation-origin-guard", () => ({
  rejectCrossSiteMutation,
}));

vi.mock("@/lib/platform/impersonation-mfa", () => ({
  verifyImpersonationMfa,
}));

vi.mock("@/services/dsr/user-data-export-service", () => ({
  buildUserDataExportBundle,
  logDsrExportRequested,
}));

import { POST } from "@/app/api/internal/dsr/export/route";

const targetUserId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

describe("DSR export route RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rejectCrossSiteMutation.mockReturnValue(null);
    requireSessionUser.mockResolvedValue({
      id: "user-1",
      email: "workspace.moroz@gmail.com",
    });
    verifyImpersonationMfa.mockReturnValue(true);
    buildUserDataExportBundle.mockResolvedValue({
      ok: true,
      workspace: { id: "ws-1" },
      bundle: {},
    });
    logDsrExportRequested.mockResolvedValue(undefined);
  });

  it("denies export when bootstrap email lacks SUPER_ADMIN role row", async () => {
    hasSuperAdminRoleRow.mockResolvedValue(false);

    const response = await POST(
      new Request("http://localhost/api/internal/dsr/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId, totpCode: "123456" }),
      }),
    );

    expect(response.status).toBe(403);
    expect(hasSuperAdminRoleRow).toHaveBeenCalledWith("user-1");
    expect(buildUserDataExportBundle).not.toHaveBeenCalled();
  });

  it("allows export when SUPER_ADMIN role row exists and MFA passes", async () => {
    hasSuperAdminRoleRow.mockResolvedValue(true);

    const response = await POST(
      new Request("http://localhost/api/internal/dsr/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId, totpCode: "123456" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(buildUserDataExportBundle).toHaveBeenCalledWith(targetUserId);
    expect(logDsrExportRequested).toHaveBeenCalledWith({
      actorUserId: "user-1",
      targetUserId,
      workspaceId: "ws-1",
    });
  });

  it("denies export when SUPER_ADMIN role exists but MFA fails", async () => {
    hasSuperAdminRoleRow.mockResolvedValue(true);
    verifyImpersonationMfa.mockReturnValue(false);

    const response = await POST(
      new Request("http://localhost/api/internal/dsr/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId, totpCode: "000000" }),
      }),
    );

    expect(response.status).toBe(403);
    expect(buildUserDataExportBundle).not.toHaveBeenCalled();
  });
});
