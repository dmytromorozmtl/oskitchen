import { beforeEach, describe, expect, it, vi } from "vitest";

import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const createTab = vi.hoisted(() => vi.fn());
const addItemToTab = vi.hoisted(() => vi.fn());
const closeTab = vi.hoisted(() => vi.fn());
const revalidatePath = vi.hoisted(() => vi.fn());
const logPosPermissionDenied = vi.hoisted(() => vi.fn());
const logPosTabEvent = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/permissions/mutation-access", () => ({ requireMutationPermission }));
vi.mock("@/services/pos/tab-service", () => ({ createTab, addItemToTab, closeTab }));
vi.mock("@/services/pos/pos-permission-audit", () => ({
  logPosPermissionDenied,
  logPosTabEvent,
}));

import { addItemToTabAction, closeTabAction, createTabAction } from "@/actions/pos/tabs";

const actor = {
  sessionUser: { id: "staff-user-1" },
  sessionUserId: "staff-user-1",
  userId: "owner-user-1",
  dataUserId: "owner-user-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "CUSTOMER_SERVICE" as const,
  email: "cashier@example.com",
  granted: new Set(["pos.access", "pos.checkout"]),
};

const baseForbiddenAccess = { ok: false as const, error: "Forbidden", actor };

function formDataFrom(values: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }
  return formData;
}

describe("POS tab action RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createTab.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      name: "Patio 12",
      status: "OPEN",
      subtotal: 0,
      tax: 0,
      tip: 0,
      total: 0,
      tableId: null,
    });
    addItemToTab.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      name: "Patio 12",
      subtotal: 12,
      tax: 0,
      tip: 0,
      total: 12,
    });
    closeTab.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      name: "Patio 12",
      subtotal: 12,
      tax: 0.96,
      tip: 2,
      total: 14.96,
    });
  });

  it("blocks tab creation without POS access permission", async () => {
    requireMutationPermission.mockResolvedValueOnce(baseForbiddenAccess);

    const result = await createTabAction(formDataFrom({ name: "Patio 12" }));

    expect(result).toEqual({ ok: false, error: "Forbidden" });
    expect(createTab).not.toHaveBeenCalled();
    expect(logPosPermissionDenied).toHaveBeenCalledWith(actor, {
      requiredPermission: "pos.access",
      operation: "pos.tab.create",
    });
  });

  it("blocks tab item adds without POS access permission", async () => {
    requireMutationPermission.mockResolvedValueOnce(baseForbiddenAccess);

    const result = await addItemToTabAction(
      formDataFrom({
        tabId: "11111111-1111-4111-8111-111111111111",
        productName: "Burger",
        quantity: "1",
        unitPrice: "12",
      }),
    );

    expect(result).toEqual({ ok: false, error: "Forbidden" });
    expect(addItemToTab).not.toHaveBeenCalled();
    expect(logPosPermissionDenied).toHaveBeenCalledWith(actor, {
      requiredPermission: "pos.access",
      operation: "pos.tab.item.add",
    });
  });

  it("blocks tab close without checkout permission", async () => {
    requireMutationPermission.mockResolvedValueOnce(baseForbiddenAccess);

    const result = await closeTabAction(
      formDataFrom({
        tabId: "11111111-1111-4111-8111-111111111111",
        tip: "2",
      }),
    );

    expect(result).toEqual({ ok: false, error: "Forbidden" });
    expect(closeTab).not.toHaveBeenCalled();
    expect(logPosPermissionDenied).toHaveBeenCalledWith(actor, {
      requiredPermission: "pos.checkout",
      operation: "pos.tab.close",
    });
  });

  it("uses owner-scoped tenant data and records an audit event when opening tabs", async () => {
    requireMutationPermission.mockResolvedValueOnce({ ok: true, actor });

    const result = await createTabAction(formDataFrom({ name: "Patio 12" }));

    expect(result).toEqual({
      ok: true,
      data: {
        tab: {
          id: "11111111-1111-4111-8111-111111111111",
          name: "Patio 12",
          status: "OPEN",
          subtotal: 0,
          tax: 0,
          tip: 0,
          total: 0,
          tableId: null,
          items: [],
        },
      },
    });
    expect(createTab).toHaveBeenCalledWith("owner-user-1", "Patio 12", undefined);
    expect(logPosTabEvent).toHaveBeenCalledWith(actor, {
      action: AUDIT_ACTIONS.POS_TAB_OPENED,
      entityId: "11111111-1111-4111-8111-111111111111",
      label: "Patio 12",
      metadata: { tableId: null },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/pos/tabs");
  });

  it("uses owner-scoped tenant data and records an audit event when adding tab items", async () => {
    requireMutationPermission.mockResolvedValueOnce({ ok: true, actor });

    const result = await addItemToTabAction(
      formDataFrom({
        tabId: "11111111-1111-4111-8111-111111111111",
        productName: "Burger",
        quantity: "1",
        unitPrice: "12",
      }),
    );

    expect(result).toEqual({
      ok: true,
      data: {
        item: {
          id: expect.stringMatching(/^sync-/),
          productName: "Burger",
          quantity: 1,
          unitPrice: 12,
          totalPrice: 12,
        },
      },
    });
    expect(addItemToTab).toHaveBeenCalledWith("11111111-1111-4111-8111-111111111111", "owner-user-1", {
      tabId: "11111111-1111-4111-8111-111111111111",
      productName: "Burger",
      quantity: 1,
      unitPrice: 12,
    });
    expect(logPosTabEvent).toHaveBeenCalledWith(actor, {
      action: AUDIT_ACTIONS.POS_TAB_ITEM_ADDED,
      entityId: "11111111-1111-4111-8111-111111111111",
      label: "Patio 12",
      metadata: {
        productName: "Burger",
        quantity: 1,
        unitPrice: 12,
        totalPrice: 12,
      },
    });
  });

  it("uses checkout permission and records an audit event when closing tabs", async () => {
    requireMutationPermission.mockResolvedValueOnce({ ok: true, actor });

    const result = await closeTabAction(
      formDataFrom({
        tabId: "11111111-1111-4111-8111-111111111111",
        tip: "2",
      }),
    );

    expect(result).toEqual({ ok: true });
    expect(closeTab).toHaveBeenCalledWith("11111111-1111-4111-8111-111111111111", "owner-user-1", 2);
    expect(logPosTabEvent).toHaveBeenCalledWith(actor, {
      action: AUDIT_ACTIONS.POS_TAB_CLOSED,
      entityId: "11111111-1111-4111-8111-111111111111",
      label: "Patio 12",
      metadata: {
        tip: 2,
        subtotal: 12,
        tax: 0.96,
        total: 14.96,
      },
    });
  });
});
