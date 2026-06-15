import { beforeEach, describe, expect, it, vi } from "vitest";

const requireWorkspacePermissionActor = vi.hoisted(() => vi.fn());
const canProvisionPartnerOrganizations = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const partnerAccountFindUnique = vi.hoisted(() => vi.fn());
const partnerAccountCreate = vi.hoisted(() => vi.fn());
const partnerMemberUpsert = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/permissions/require-workspace-permission", () => ({
  requireWorkspacePermissionActor,
}));

vi.mock("@/lib/partner/partner-permissions", () => ({
  canProvisionPartnerOrganizations,
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    partnerAccount: {
      findUnique: partnerAccountFindUnique,
      create: partnerAccountCreate,
    },
    partnerMember: {
      upsert: partnerMemberUpsert,
    },
  },
}));

import { createPartnerOrganization } from "@/actions/partner-operations";

const workspaceActor = {
  sessionUser: { id: "owner-1", email: "owner@example.com" },
  sessionUserId: "owner-1",
  dataUserId: "owner-1",
  userId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "OWNER" as const,
  staffRoleType: null,
  email: "owner@example.com",
  granted: new Set<string>(),
  platformBypass: false,
};

describe("partner operations RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireWorkspacePermissionActor.mockResolvedValue(workspaceActor);
    partnerAccountFindUnique.mockResolvedValue(null);
    partnerAccountCreate.mockResolvedValue({ id: "partner-1" });
    partnerMemberUpsert.mockResolvedValue({});
  });

  it("denies create without partner provision rights and audits", async () => {
    canProvisionPartnerOrganizations.mockResolvedValue(false);

    const result = await createPartnerOrganization({ name: "Acme Agency" });

    expect(result).toEqual({ error: "You do not have permission to create partner organizations." });
    expect(canProvisionPartnerOrganizations).toHaveBeenCalledWith(
      "owner-1",
      "owner@example.com",
      "OWNER",
    );
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "partner_provision.permission_denied",
        metadata: expect.objectContaining({
          operation: "partner.create_organization",
        }),
      }),
    );
    expect(partnerAccountCreate).not.toHaveBeenCalled();
  });

  it("allows create when partner provision bridge grants access", async () => {
    canProvisionPartnerOrganizations.mockResolvedValue(true);

    const result = await createPartnerOrganization({ name: "Acme Agency", orgType: "AGENCY" });

    expect(result).toEqual({ ok: true });
    expect(partnerAccountCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Acme Agency",
          ownerUserId: "owner-1",
          orgType: "AGENCY",
        }),
      }),
    );
  });
});
