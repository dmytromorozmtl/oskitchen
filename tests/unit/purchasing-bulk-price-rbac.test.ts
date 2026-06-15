import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor,
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog,
}));

vi.mock("@/services/purchasing/bulk-price-service", () => ({
  bulkUpdateSupplierPrices: vi.fn(),
  undoLastBulkPriceChange: vi.fn(),
}));

import {
  bulkUpdateSupplierPrices,
  undoLastBulkPriceChange,
} from "@/services/purchasing/bulk-price-service";
import { bulkUpdatePricesAction, undoBulkPricesAction } from "@/actions/purchasing/bulk-price";

const deniedActor = {
  sessionUserId: "user-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("purchasing bulk-price actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "owner-1" },
      dataUserId: "owner-1",
    });
  });

  it("denies bulkUpdatePricesAction without reports.read.financial", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set(
      "updates",
      JSON.stringify([{ supplierItemId: "00000000-0000-4000-8000-000000000001", unitCost: 5 }]),
    );
    const result = await bulkUpdatePricesAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("reports.read.financial");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(bulkUpdateSupplierPrices).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "purchasing.permission_denied",
        metadata: expect.objectContaining({
          operation: "purchasing.bulk_update_prices",
        }),
      }),
    );
  });

  it("denies undoBulkPricesAction without reports.read.financial", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const result = await undoBulkPricesAction();

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("reports.read.financial");
    expect(undoLastBulkPriceChange).not.toHaveBeenCalled();
  });

  it("allows bulkUpdatePricesAction with reports.read.financial", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });
    vi.mocked(bulkUpdateSupplierPrices).mockResolvedValue(undefined);

    const formData = new FormData();
    formData.set(
      "updates",
      JSON.stringify([{ supplierItemId: "00000000-0000-4000-8000-000000000001", unitCost: 5 }]),
    );
    const result = await bulkUpdatePricesAction(formData);

    expect(result).toEqual({ updated: 1 });
    expect(requireTenantActor).toHaveBeenCalled();
    expect(bulkUpdateSupplierPrices).toHaveBeenCalled();
  });
});
