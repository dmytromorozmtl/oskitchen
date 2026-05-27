import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const createForecastRun = vi.hoisted(() => vi.fn());
const sendForecastToProduction = vi.hoisted(() => vi.fn());
const archiveForecastRun = vi.hoisted(() => vi.fn());

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

vi.mock("@/services/forecast/forecast-service", () => ({
  createForecastRun,
  addForecastAdjustment: vi.fn(),
  sendForecastToProduction,
  sendForecastToIngredientDemand: vi.fn(),
  archiveForecastRun,
  restoreForecastRun: vi.fn(),
}));

import {
  archiveForecastRunAction,
  runForecastAction,
  sendForecastToProductionAction,
} from "@/actions/forecast";

const RUN_ID = "11111111-1111-4111-8111-111111111111";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("forecast actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "actor-1", email: "owner@example.com" },
      dataUserId: "owner-1",
    });
    createForecastRun.mockResolvedValue({ id: RUN_ID });
    sendForecastToProduction.mockResolvedValue({ id: "batch-1" });
    archiveForecastRun.mockResolvedValue({});
  });

  it("denies runForecastAction without production.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("title", "Week forecast");
    formData.set("forecastType", "ORDER_DEMAND");
    formData.set("dateFrom", "2026-05-01");
    formData.set("dateTo", "2026-05-07");
    formData.append("sources", "HISTORICAL_ORDERS");

    const result = await runForecastAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("production.manage");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(createForecastRun).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "forecast.permission_denied",
        metadata: expect.objectContaining({
          operation: "forecast.run.create",
          requiredPermission: "production.manage",
        }),
      }),
    );
  });

  it("denies sendForecastToProductionAction without production.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("forecastRunId", RUN_ID);
    formData.set("title", "Production batch");
    formData.set("productionDate", "2026-05-27");

    const result = await sendForecastToProductionAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(sendForecastToProduction).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "forecast.send_to_production" }),
      }),
    );
  });

  it("denies archiveForecastRunAction without production.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("forecastRunId", RUN_ID);

    const result = await archiveForecastRunAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(archiveForecastRun).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "forecast.run.archive" }),
      }),
    );
  });

  it("allows runForecastAction when production.manage is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("title", "Week forecast");
    formData.set("forecastType", "ORDER_DEMAND");
    formData.set("dateFrom", "2026-05-01");
    formData.set("dateTo", "2026-05-07");
    formData.append("sources", "HISTORICAL_ORDERS");

    const result = await runForecastAction(formData);

    expect(result).toEqual({ ok: true, runId: RUN_ID });
    expect(requireTenantActor).toHaveBeenCalled();
    expect(createForecastRun).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "owner-1", title: "Week forecast" }),
    );
  });

  it("scopes archiveForecastRunAction to tenant owner id", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("forecastRunId", RUN_ID);

    const result = await archiveForecastRunAction(formData);

    expect(result).toEqual({ ok: true });
    expect(archiveForecastRun).toHaveBeenCalledWith("owner-1", RUN_ID);
  });
});
