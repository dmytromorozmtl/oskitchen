import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const getManageStorefrontForSession = vi.hoisted(() => vi.fn());
const requireManageStorefrontRow = vi.hoisted(() => vi.fn());
const runStorefrontDomainVerification = vi.hoisted(() => vi.fn());
const logStorefrontPermissionDenied = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/storefront/revalidate-storefront-dashboard", () => ({
  revalidateStorefrontDashboardAndPublic: vi.fn(),
}));

vi.mock("@/services/storefront/storefront-domain-verification-service", () => ({
  runStorefrontDomainVerification,
  refreshStorefrontDomainRouting: vi.fn(),
}));

vi.mock("@/lib/storefront/require-admin-storefront", () => ({
  requireManageStorefrontRow,
}));

vi.mock("@/services/storefront/storefront-form-service", () => ({
  getManageStorefrontForSession,
  createStorefrontFormRecord: vi.fn(),
  findStorefrontFormForMerchant: vi.fn(),
  linkStorefrontPublicForms: vi.fn(),
  markStorefrontFormSubmissionRead: vi.fn(),
  archiveStorefrontFormCascade: vi.fn(),
  updateStorefrontFormRecord: vi.fn(),
}));

vi.mock("@/services/storefront/storefront-form-submission-service", () => ({
  submitPublicStorefrontFormFromFd: vi.fn(),
}));

vi.mock("@/services/storefront/storefront-permission-audit", () => ({
  logStorefrontPermissionDenied,
}));

vi.mock("@/lib/permissions/require-workspace-permission", () => ({
  requireWorkspacePermissionActor: vi.fn(),
}));

vi.mock("@/services/storefront/storefront-permission-service", () => ({
  getStorefrontPermissionSetForUser: vi.fn().mockResolvedValue({
    permissions: new Set(),
    email: "viewer@example.com",
  }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    storefrontSettings: { update: vi.fn() },
  },
}));

import { verifyStorefrontDomainDnsAction } from "@/actions/storefront-domains";
import { createStorefrontFormAction } from "@/actions/storefront-forms";

const viewerActor = {
  sessionUser: { id: "staff-1" },
  sessionUserId: "staff-1",
  userId: "owner-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  email: "viewer@example.com",
  workspaceRole: "STAFF" as const,
  staffRoleType: "VIEWER" as const,
  granted: new Set(["storefront.read"]),
};

describe("storefront domains and forms RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "staff-1" },
      userId: "owner-1",
    });
    logStorefrontPermissionDenied.mockResolvedValue(undefined);
    requireManageStorefrontRow.mockResolvedValue({
      sf: { id: "sf-1", storeSlug: "demo", customDomain: "shop.example.com" },
    });
  });

  it("denies domain DNS verification without storefront.manage", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: viewerActor,
    });

    await verifyStorefrontDomainDnsAction();
    expect(runStorefrontDomainVerification).not.toHaveBeenCalled();
    expect(logStorefrontPermissionDenied).toHaveBeenCalled();
  });

  it("denies form creation without storefront.manage", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: viewerActor,
    });
    getManageStorefrontForSession.mockResolvedValue({
      error: "You do not have permission to perform this action.",
    });

    const fd = new FormData();
    fd.set("title", "Contact");
    fd.set("slug", "contact");
    fd.set("formKind", "CONTACT");

    const result = await createStorefrontFormAction(fd);
    expect(result).toEqual({ error: "You do not have permission to perform this action." });
    expect(getManageStorefrontForSession).toHaveBeenCalledWith("storefront.forms.create");
    expect(requireManageStorefrontRow).not.toHaveBeenCalled();
  });
});
