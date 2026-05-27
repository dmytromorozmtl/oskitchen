import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const createTerminalConnectionToken = vi.hoisted(() => vi.fn());
const createTerminalPaymentIntent = vi.hoisted(() => vi.fn());
const processTerminalPayment = vi.hoisted(() => vi.fn());
const cancelTerminalPayment = vi.hoisted(() => vi.fn());
const logPosPermissionDenied = vi.hoisted(() => vi.fn());
const logPosTerminalControlEvent = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({ requireMutationPermission }));
vi.mock("@/services/payments/stripe-terminal-service", () => ({
  createTerminalConnectionToken,
  createTerminalPaymentIntent,
  processTerminalPayment,
  cancelTerminalPayment,
}));
vi.mock("@/services/pos/pos-permission-audit", () => ({
  logPosPermissionDenied,
  logPosTerminalControlEvent,
}));

import { DELETE, GET, POST, PUT } from "@/app/api/pos/terminal/route";

const actor = {
  sessionUser: { id: "staff-user-1" },
  sessionUserId: "staff-user-1",
  userId: "owner-user-1",
  dataUserId: "owner-user-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "MANAGER" as const,
  email: "manager@example.com",
  granted: new Set(["pos.checkout"]),
};

describe("POS terminal route RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    {
      method: "GET",
      invoke: () => GET(),
    },
    {
      method: "POST",
      invoke: () =>
        POST(new Request("http://localhost/api/pos/terminal", { method: "POST" })),
    },
    {
      method: "PUT",
      invoke: () =>
        PUT(new Request("http://localhost/api/pos/terminal", { method: "PUT" })),
    },
    {
      method: "DELETE",
      invoke: () =>
        DELETE(new Request("http://localhost/api/pos/terminal", { method: "DELETE" })),
    },
  ])("returns 403 and audits the denial when POS checkout permission is missing for $method", async ({ method, invoke }) => {
    requireMutationPermission.mockResolvedValue({ ok: false, error: "Forbidden", actor });

    const response = await invoke();
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json).toEqual({ error: "You do not have permission to perform this action." });
    expect(logPosPermissionDenied).toHaveBeenCalledWith(actor, {
      requiredPermission: "pos.checkout",
      operation: "pos.terminal",
      metadata: { method, route: "/api/pos/terminal" },
    });
    expect(createTerminalConnectionToken).not.toHaveBeenCalled();
    expect(createTerminalPaymentIntent).not.toHaveBeenCalled();
    expect(processTerminalPayment).not.toHaveBeenCalled();
    expect(cancelTerminalPayment).not.toHaveBeenCalled();
  });

  it("creates terminal intents using the owner-scoped actor id", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor });
    createTerminalPaymentIntent.mockResolvedValue({
      clientSecret: "pi_secret_123",
      paymentIntentId: "pi_123",
    });

    const request = new Request("http://localhost/api/pos/terminal", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: 12.5, orderId: "order-1" }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      clientSecret: "pi_secret_123",
      paymentIntentId: "pi_123",
    });
    expect(createTerminalPaymentIntent).toHaveBeenCalledWith(
      12.5,
      "usd",
      { orderId: "order-1", userId: "owner-user-1" },
    );
    expect(logPosTerminalControlEvent).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({
        entityId: "order-1",
        label: "order-1",
      }),
    );
    expect(logPosPermissionDenied).not.toHaveBeenCalled();
    expect(processTerminalPayment).not.toHaveBeenCalled();
    expect(cancelTerminalPayment).not.toHaveBeenCalled();
  });
});
