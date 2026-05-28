import { beforeEach, describe, expect, it, vi } from "vitest";

const requireWorkspacePermissionActor = vi.hoisted(() => vi.fn());
const createCopilotActorScope = vi.hoisted(() => vi.fn());
const canUseCopilot = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const getAIOrderForecast = vi.hoisted(() => vi.fn());
const getAIMenuSuggestions = vi.hoisted(() => vi.fn());
const getAIWhatToOrder = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/require-workspace-permission", () => ({
  requireWorkspacePermissionActor,
}));

vi.mock("@/lib/ai/copilot-actor-scope", () => ({
  createCopilotActorScope,
}));

vi.mock("@/lib/ai/copilot-permissions", () => ({
  canUseCopilot,
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog,
}));

vi.mock("@/services/ai/kitchen-ai-service", () => ({
  getAIOrderForecast,
  getAIMenuSuggestions,
  getAIWhatToOrder,
}));

import {
  runAIMenuSuggestionsAction,
  runAIOrderForecastAction,
  runAIWhatToOrderAction,
} from "@/actions/kitchen-ai";

const workspaceActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  userId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
  platformBypass: false,
};

const copilotScope = {
  userId: "owner-1",
  workspaceId: "ws-1",
  email: "cook@example.com",
  isOwner: false,
  role: "kitchen",
  platformBypass: false,
};

describe("kitchen AI actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireWorkspacePermissionActor.mockResolvedValue(workspaceActor);
    createCopilotActorScope.mockReturnValue(copilotScope);
    getAIOrderForecast.mockResolvedValue({ days: [] });
    getAIMenuSuggestions.mockResolvedValue({ suggestions: [] });
    getAIWhatToOrder.mockResolvedValue({ orders: [] });
  });

  it("denies order forecast without copilot.read.financial and audits", async () => {
    canUseCopilot.mockReturnValue(false);

    const result = await runAIOrderForecastAction(7);

    expect(result).toEqual({
      ok: false,
      error: "You do not have permission to use Kitchen AI tools.",
    });
    expect(canUseCopilot).toHaveBeenCalledWith(copilotScope, "copilot.read.financial");
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "kitchen_ai.permission_denied",
        metadata: expect.objectContaining({
          operation: "kitchen_ai.order_forecast",
          requiredCapability: "copilot.read.financial",
        }),
      }),
    );
    expect(getAIOrderForecast).not.toHaveBeenCalled();
  });

  it("allows order forecast when copilot.read.financial is granted", async () => {
    canUseCopilot.mockImplementation((_scope, capability) => capability === "copilot.read.financial");

    const result = await runAIOrderForecastAction(7);

    expect(result.ok).toBe(true);
    expect(getAIOrderForecast).toHaveBeenCalledWith("owner-1", 7);
  });

  it("denies menu suggestions without copilot.read.financial", async () => {
    canUseCopilot.mockReturnValue(false);

    const result = await runAIMenuSuggestionsAction();

    expect(result).toEqual({
      ok: false,
      error: "You do not have permission to use Kitchen AI tools.",
    });
    expect(getAIMenuSuggestions).not.toHaveBeenCalled();
  });

  it("denies what-to-order without copilot.read.operations", async () => {
    canUseCopilot.mockReturnValue(false);

    const result = await runAIWhatToOrderAction();

    expect(result).toEqual({
      ok: false,
      error: "You do not have permission to use Kitchen AI tools.",
    });
    expect(canUseCopilot).toHaveBeenCalledWith(copilotScope, "copilot.read.operations");
    expect(getAIWhatToOrder).not.toHaveBeenCalled();
  });

  it("allows what-to-order when copilot.read.operations is granted", async () => {
    canUseCopilot.mockImplementation((_scope, capability) => capability === "copilot.read.operations");

    const result = await runAIWhatToOrderAction();

    expect(result.ok).toBe(true);
    expect(getAIWhatToOrder).toHaveBeenCalledWith("owner-1");
  });
});
